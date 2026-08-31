# WhatsApp Inbox — Frontend CRM link + API wiring

Escopo entregue no frontend Angular (`frontend/src/app/features/whatsapp/`), mais o
alinhamento de contrato com o backend já existente.

> **Correção de um relato anterior:** a primeira versão deste documento afirmava que os
> endpoints `/whatsapp/conversations/{phone}/link`, `/unlink` e `/read` não existiam no
> backend. Isso estava **errado** — eu não havia inspecionado o backend antes de afirmar.
> Todos existem em `WhatsAppMessageController` + `WhatsAppInboxService`. O trabalho real
> era alinhar os contratos; os desalinhamentos encontrados e corrigidos estão na seção
> "Alinhamento de contrato" abaixo.

## O que mudou

### 1. Mock apenas em erro de rede / 404
`whatsapp.service.ts` ganhou `shouldFallback(err)` + `withFallback(fn)`. O modo demo só é
acionado quando `HttpErrorResponse.status` é `0` (offline, DNS, CORS, conexão recusada) ou
`404` (rota não publicada). **401, 403 e 5xx voltam a propagar** para o componente, que
exibe snackbar de erro real em vez de mascarar como "demo".

Aplicado em: `getStatus`, `connect`, `disconnect`, `getConversations`, `getMessages`,
`sendMessage`, `markRead`, `markConversationRead`, `linkConversation`, `unlinkConversation`.

### 2. Vínculo com Lead/Cliente
- Novo `WhatsappLinkDialogComponent` (`.ts/.html/.scss`): busca com debounce de 250ms sobre
  leads + clientes (`GET /leads`, `GET /clients`, `size=200`, filtro local por nome, e-mail,
  empresa e telefone — os endpoints do backend não expõem parâmetro de busca).
- `WhatsappService.linkConversation(phone, type, id, label)` → `POST /whatsapp/conversations/{phone}/link`
- `WhatsappService.unlinkConversation(phone)` → `DELETE /whatsapp/conversations/{phone}/link`
- `linkedRoute(type, id)` devolve `/leads/{id}` ou `/clients/{id}`; o chip no cabeçalho do
  chat vira um `<a routerLink>` que abre a ficha. Tipos sem tela de detalhe (PROSPECT/CONTACT)
  renderizam um chip estático.
- Menu do chat: abrir ficha · alterar vínculo · remover vínculo.

### 3. Filtros `all | unread | unlinked`
Três chips no topo da sidebar, cada um com contador. Combinam com a busca por texto
(filtro + query são aplicados juntos em `applyFilter()`). Conversas sem vínculo mostram um
ícone `link_off` na linha da lista.

### 4. Marcar como lida via API
Ao abrir uma conversa, `markConversationRead(phone, unreadIds)` chama
`POST /whatsapp/conversations/{phone}/read`. Se essa rota devolver 404, o serviço faz
fallback para `POST /whatsapp/messages/{id}/read` por mensagem não lida (`forkJoin`).
Falha real exibe snackbar; a lista é recarregada para atualizar o badge.

### 5. Tokens dark forge
Todas as cores fixas (`#fff`, `rgba(239,68,68,…)`, `rgba(16,185,129,…)`, `rgba(252,110,32,…)`,
`#93c5fd`, `#fecaca`) foram trocadas por `var(--success|warning|danger|info|primary|primary-hover|ink)`
com `color-mix(in srgb, …)` para as variações de opacidade. Foi adicionado o token
`--on-primary: #ffffff` em `styles.scss` (dark e light) para texto sobre o laranja da marca.

## Alinhamento de contrato com o backend

Endpoints reais em `WhatsAppMessageController` (todos já existiam):
`GET /status`, `POST /connect`, `POST /disconnect`, `GET /conversations`,
`POST /conversations/{phone}/read`, `POST|DELETE /conversations/{phone}/link`,
`POST /conversations/{phone}/unlink`, `GET|POST /conversations/{phone}/messages`,
`POST /messages/{id}/read`.

Quatro desalinhamentos reais foram encontrados e corrigidos:

| # | Problema | Correção |
|---|----------|----------|
| 1 | `WhatsAppStatusResponse.qrCode` (camelCase) vs. `qrcode` no modelo do frontend → **o banner de QR nunca renderizava** | `normalizeStatus()` no serviço aceita as duas grafias (`getStatus` e `connect`) |
| 2 | `GET /conversations/{phone}/messages` pagina **mais recente primeiro**; o chat renderiza de cima para baixo → **histórico invertido** | `getMessages()` reordena a página por `sentAt` ascendente |
| 3 | `POST /disconnect` devolve **204 sem corpo**, mas o frontend tipava a resposta como `WhatsAppStatus` → `status` virava `null` | `disconnect()` mapeia o 204 para `{ status: 'DISCONNECTED' }` |
| 4 | `ConversationSummary.linkedLabel` traz o **nome puro** ("Ana Souza"); o prefixo "Lead · " era montado no cliente e se perdia no refresh | prefixo passa a ser composto na exibição (`linkedDisplayLabel`), armazenando o nome puro |

E uma correção no backend:

| # | Problema | Correção |
|---|----------|----------|
| 5 | `WhatsAppInboxService.status()` lançava `ResourceNotFoundException` → **404** quando a organização não tem integração WhatsApp configurada. Como o frontend trata 404 como "rota não publicada", o inbox caía em **modo demo** para uma organização apenas não configurada — indistinguível de endpoint ausente | `status()` devolve `DISCONNECTED` quando nenhum `integrationId` foi pedido e não há integração. Com `integrationId` explícito, o 404 continua (o recurso pedido realmente não existe) |

`WhatsAppConversationLinkRequest` tem `@JsonAlias("linkedType"/"linkedId")`, então o payload
`{ linkedType, linkedId }` enviado pelo frontend é aceito sem mudanças.

## Build

- `npx ng build --configuration development` → **passa**, sem erros nem warnings.
- `mvn -DskipTests compile` (backend) → **passa**.

## Passos de teste para `/whatsapp`

Pré-requisito: `npm start` no `frontend/`, autenticado, navegar para `/whatsapp`.

### A. Fallback de mock restrito
1. **Backend fora do ar** (nenhum processo Spring rodando) → abrir `/whatsapp`.
   Esperado: chip laranja **Demo** no cabeçalho, 4 conversas de demonstração, status "Conectado".
2. **Backend no ar sem os endpoints `/whatsapp`** (404) → mesmo resultado: chip **Demo**.
3. **Token expirado / 401**: limpar o JWT no `localStorage` e recarregar.
   Esperado: **nenhum** chip Demo; snackbar "Não foi possível carregar as conversas." e
   "Não foi possível consultar o status do WhatsApp." — o erro real aparece, não é mascarado.
4. **Backend devolvendo 500**: mesmo comportamento do item 3 (sem modo demo).

### B. Filtros
5. Clicar em **Não lidas** → só conversas com badge; contador do chip bate com a lista.
   No mock: Ana Souza (2) e Juliana Prado (1).
6. Clicar em **Sem vínculo** → só conversas sem ficha; no mock apenas Juliana Prado.
   As demais linhas exibem `link_off` na lista quando sem vínculo.
7. Clicar em **Todas** → volta a lista completa.
8. Com **Não lidas** ativo, digitar "juliana" na busca → filtro e busca se combinam
   (resultado vazio se ela já foi lida; a mensagem de vazio muda conforme o filtro).

### C. Marcar como lida
9. Selecionar Ana Souza (badge 2). Esperado: badge zera imediatamente na lista.
10. Com backend real: verificar no DevTools → Network um `POST /api/v1/whatsapp/conversations/5511987654321/read`.
11. Se esse endpoint devolver 404: verificar que caem N chamadas
    `POST /api/v1/whatsapp/messages/{id}/read`, uma por mensagem inbound não lida.
12. Se o endpoint devolver 500: snackbar "Não foi possível marcar a conversa como lida."

### D. Vínculo com CRM
13. Selecionar **Juliana Prado** (sem vínculo) → botão "Vincular ao CRM" no cabeçalho.
14. Clicar → abre o dialog "Vincular ao CRM" com o número formatado no subtítulo e a lista
    de leads + clientes carregada.
15. Digitar parte de um nome/e-mail/empresa → lista filtra após ~250ms; chips **Lead**
    (laranja) e **Cliente** (azul) diferenciam a origem.
16. Digitar 3+ dígitos de telefone → filtra também por telefone (ignora formatação).
17. Escolher um registro → dialog fecha, snackbar "Conversa vinculada a Lead · Fulano.",
    o cabeçalho passa a exibir o chip com o rótulo, e a conversa some do filtro "Sem vínculo".
18. Clicar no chip → navega para `/leads/{id}` (ou `/clients/{id}`) e abre a ficha.
19. Voltar ao `/whatsapp`, abrir o menu `⋮` → "Abrir ficha no CRM", "Alterar vínculo",
    "Remover vínculo" disponíveis.
20. "Remover vínculo" → snackbar "Vínculo removido."; a conversa reaparece em "Sem vínculo".

### E. Tema e tokens
21. Alternar o tema para claro (`html[data-theme="light"]`) → status bar, chips de filtro,
    balões e o dialog acompanham; nenhuma cor fixa remanescente.
22. Navegação por teclado: Tab percorre chips de filtro (foco laranja visível), itens da
    lista e itens do dialog; Enter seleciona.
