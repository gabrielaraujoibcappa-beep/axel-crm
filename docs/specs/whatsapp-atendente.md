# Spec: whatsapp-atendente

Status: ready-for-agent

Glossário: `CONTEXT.md`. Decisão de aceite: ADR-009.

## Problem Statement

A equipe já conversa com o mercado pela Inbox de WhatsApp, mas toda primeira resposta é humana. Fora do horário, ou quando o contato só quer cadastrar interesse, tirar uma dúvida do playbook, marcar horário ou saber o status de proposta/fatura/processo, a mensagem fica parada. O CRM não transforma inbound em Lead sozinho, não agenda sozinho e não mostra um resumo de status no próprio WhatsApp. Sem um atendente na frente da Inbox, o canal que já existe não puxa o funil.

## Solution

Um **Atendente automático** por **Roteiro** (menu numerado) senta na frente da Inbox. Ele usa o **Playbook** que o admin cadastra. Identifica o contato pelo telefone (e pelo vínculo da Conversa). Número novo: cadastra **Lead**. **FAQ** e **Agendamento** (calendário do CRM) valem para Lead e Cliente. **Status** (resumo) só para **Cliente**. **Conversão** Lead → Cliente só depois de **Proposta aceita** na página pública — nunca por texto no chat. O contato pede humano → **Transferência**. Humano escreveu na conversa → **Silêncio**. Só a equipe devolve o atendente pela Inbox. Fora do expediente o atendente continua respondendo pelo Roteiro.

## User Stories

1. As an admin da organização, I want cadastrar o Playbook estruturado (saudação, perguntas de cadastro, itens de FAQ, tipos de agenda, texto fora do expediente, usuário padrão da agenda, frases de transferência), so that o atendente trabalha com o material da empresa e não com texto genérico.
2. As an admin da organização, I want colar um texto livre extra no Playbook, so that o material narrativo da empresa fica guardado para um híbrido futuro — ciente de que a v1 não o interpreta.
3. As an admin da organização, I want ativar ou desativar o atendente por organização, so that a Inbox humana continua igual quando o automático estiver desligado.
4. As an admin da organização, I want editar o Playbook sem redeploy, so that horário, FAQ e saudação mudam no próximo recado.
5. As a contato com número novo, I want receber a saudação e o menu (1 cadastro, 2 dúvidas, 3 agenda, 4 status), so that eu saiba o que o atendente faz.
6. As a contato com número novo, I want escolher cadastro e responder as perguntas do Playbook, so that eu vire um Lead no CRM sem esperar um humano.
7. As a contato que já é Lead pelo mesmo telefone, I want não repetir o cadastro inteiro, so that o atendente me reconheça e ofereça FAQ e agenda.
8. As a contato que já é Cliente pelo mesmo telefone, I want o menu com status habilitado, so that eu consulte proposta, fatura e processo.
9. As a contato cujo telefone não é Cliente, I want que a opção 4 explique que status é só para cliente e ofereça cadastro ou humano, so that o atendente não vaze dado de outra pessoa nem finja que sou cliente.
10. As a Lead recém-cadastrado pelo atendente, I want a Conversa vinculada ao meu Lead, so that a equipe abra a ficha direto da Inbox.
11. As a vendedor, I want ser notificado no CRM quando o atendente criar um Lead, so that eu pegue o inbound cedo.
12. As a contato, I want escolher FAQ e ver a lista de perguntas cadastradas, so that eu ache a dúvida sem falar com humano.
13. As a contato, I want escolher um item de FAQ e receber a resposta cadastrada, so that a resposta seja a da empresa, não uma invenção.
14. As a contato, I want voltar ao menu depois de uma resposta, so that eu continue sozinho.
15. As a contato, I want marcar um horário a partir dos tipos de agenda do Playbook, so that nasça um evento no calendário do CRM ligado ao meu Lead ou Cliente.
16. As a responsável do Lead/Cliente, I want o Agendamento cair no meu calendário, so that eu veja o compromisso na agenda que já uso.
17. As an admin, I want definir um usuário padrão da agenda no Playbook, so that o evento tenha dono quando o registro não tem responsável.
18. As a Cliente, I want pedir Status e ver propostas (código, situação, link público), faturas (número, vencimento, valor, paga/em aberto) e processos (número, situação), so that eu saiba “cadê a minha coisa” sem PDF, itens ou anexo.
19. As a Cliente com proposta em aberto, I want receber o link da página pública no WhatsApp, so that eu leia e aceite o documento.
20. As a contato na página pública, I want um botão Aceitar na proposta enviada, so that o “sim” fique amarrado ao documento (ADR-009).
21. As a contato, I want que “aceito” digitado no WhatsApp não mude o status da proposta, so that um texto solto não vire contrato.
22. As a Lead com proposta aceita na página pública, I want ser convertido em Cliente automaticamente, so that o Status passe a fazer sentido.
23. As a Cliente que já existia quando a proposta foi aceita, I want só o status da proposta mudar para aceita, so that não nasça Cliente duplicado.
24. As a contato, I want escrever uma frase de transferência (padrão: “falar com atendente”, mais as do Playbook), so that a conversa vá para a Inbox e o atendente cale.
25. As a vendedor, I want ver na Inbox que a conversa está em Silêncio / transferida, so that eu saiba que o automático não vai falar por cima.
26. As a vendedor, I want que o atendente entre em Silêncio assim que eu mandar uma mensagem naquela conversa, so that nós dois não falemos no mesmo número.
27. As a vendedor, I want um controle “devolver ao atendente” na Inbox, so that só a equipe tire a conversa do Silêncio.
28. As a contato em Silêncio, I want que minhas mensagens só cheguem na Inbox, so that o menu não volte no meio da negociação.
29. As a contato fora do horário cadastrado no Playbook, I want ainda assim receber o Roteiro (com o texto fora do expediente, se houver), so that eu não fique sem resposta.
30. As a contato, I want que o atendente ignore o texto livre do Playbook na v1, so that ele não “interprete” documento e não invente regra.
31. As a contato, I want responder 1/2/3/4 ou o texto curto equivalente do menu, so that o Roteiro não dependa de modelo de linguagem.
32. As a contato no meio do cadastro, I want poder pedir humano e abortar o roteiro, so that eu não fique preso nas perguntas.
33. As a contato no meio do cadastro, I want que uma resposta inválida peça de novo o campo, so that o Lead não nasça sem nome.
34. As a equipe, I want as mensagens do atendente gravadas na mesma Conversa (saída, visíveis na Inbox), so that o histórico humano + automático seja um só.
35. As a organização, I want que o atendente só leia e grave dados do meu tenant, so that não vaze Lead, fatura ou processo de outra organização.
36. As a contato de um tenant sem Playbook ou com atendente desligado, I want que nada automático responda, so that a Inbox continue só humana.
37. As a contato cujo número casa com mais de um registro, I want que o atendente prefira Cliente sobre Lead sobre Prospect e avise a equipe se ainda restar ambiguidade, so that Status não saia do registro errado.
38. As a admin, I want ver se o Playbook está incompleto (sem saudação ou sem FAQ), so that o menu não ofereça um trabalho sem material.
39. As a contato pedindo FAQ com lista vazia, I want uma mensagem pedindo para falar com humano, so that o atendente não finja que tem resposta.
40. As a contato pedindo agenda sem tipo cadastrado ou sem dono de calendário, I want ser orientado a pedir humano, so that não nasça evento órfão.
41. As a desenvolvedor do agente, I want um único ponto de entrada no recebimento da mensagem inbound, so that os quatro trabalhos e o Silêncio sejam testáveis sem o gateway real.

## Implementation Decisions

- **Seam principal (um):** depois que a Inbox persiste uma mensagem inbound nova (não deduplicada), o atendente decide se responde. Se responder, a saída usa o mesmo envio de texto e a mesma gravação outbound da Inbox. Gateway, webhook e tela de chat não viram um segundo canal.
- **Seam colateral (inevitável):** aceitar proposta é um ato na página pública, não um inbound de WhatsApp. Endpoint público autenticado só pelo token: aceitar marca a proposta como aceita (o mesmo caminho que hoje a equipe usa ao mudar o status), dispara a Conversão se a proposta estiver ligada a um Lead ainda não convertido, e pode mandar um recado no WhatsApp pelo mesmo envio da Inbox. “Aceito” no corpo da mensagem não chama esse caminho.
- **Identidade:** telefone da mensagem contra telefone de Cliente, Lead e Prospect do tenant, mais o vínculo já existente da Conversa. Ordem: Cliente > Lead > Prospect. Sem match: desconhecido. Ambiguidade no mesmo nível: não mostrar Status; seguir como desconhecido/Lead mais recente e sinalizar a equipe.
- **Cadastro:** roteiro com as perguntas estruturadas do Playbook (mínimo: nome; interesse/notas). Cria Lead no estágio novo, origem identificável como WhatsApp, telefone = número da conversa, vincula a Conversa, notifica a equipe. Não cria Cliente. Não promove Prospect automaticamente (se o telefone já for Prospect, o admin/equipe continua dono da promoção; o atendente pode só avisar e oferecer FAQ/agenda).
- **Conversão vs modelo atual de proposta:** hoje a proposta aponta para Cliente. Para o “sim” comercial acontecer *antes* da Conversão, a proposta passa a poder apontar para um Lead (referência opcional). Aceitar: se há Lead e ainda não há Cliente, roda a mesma Conversão já existente e preenche o Cliente na proposta. Se já há Cliente, só aceita. Equipe marcando aceita no CRM continua válida (ponte do ADR-009).
- **Status:** só se a identidade for Cliente. Montar o resumo a partir das listagens já filtradas por organização e pelo id do Cliente. Não gerar PDF, não listar itens, não anexar arquivo. Sem Cliente: recusar com texto do Roteiro.
- **Agendamento:** cria evento no calendário já existente. Dono: responsável do Lead/Cliente; senão, usuário padrão do Playbook; senão, não agenda e oferece Transferência. Liga o evento ao Lead ou Cliente. Tipos e duração vêm do Playbook (não há “livre no calendário” inteligente na v1: o contato escolhe tipo + data/hora que o roteiro pedir).
- **Playbook:** um por organização, editável só por admin. Campos estruturados + texto livre opcional. v1 lê só estruturados. Atendente desligável. Frases de transferência: lista do Playbook unida a um padrão (“falar com atendente”).
- **Estado da Conversa:** persistir por organização + telefone: ativo vs Silêncio, passo do Roteiro (menu, coletando campo N, listando FAQ, coletando agenda). Transferência ou outbound humano naquela conversa → Silêncio e cancela o passo. Devolver na Inbox → ativo no menu. Sem expiração.
- **Fora do horário:** se o Playbook tiver janela, prefixar o texto fora do expediente e seguir o Roteiro. Sem janela, só o Roteiro.
- **API autenticada extra:** ler/atualizar Playbook (admin); devolver conversa ao atendente; o restante do WhatsApp já existe.
- **Página pública:** botão Aceitar só se a proposta ainda não está aceita/recusada/expirada; depois, estado só leitura.
- **Inbox:** indicador de Silêncio e ação devolver. Mensagens do atendente aparecem como as outras outbound.
- **Sem modelo de linguagem** em qualquer passo da v1.
- **Multi-tenant e exclusão lógica** iguais ao resto do CRM. Webhook continua público com o segredo da integração. Aceite público não pede JWT: o token da proposta é o segredo.
- **Origem do Lead:** valor de origem que identifique WhatsApp, para relatórios não misturarem com telefone/site.

## Testing Decisions

Um bom teste observa comportamento na borda do seam, não o miolo do parser do gateway nem o HTML do botão.

- Dado inbound persistido, o módulo do atendente: responde menu; cria Lead e vincula; recusa Status sem Cliente; monta Status só com os campos do resumo; não responde em Silêncio; responde de novo depois de devolver; Transferência pela frase padrão; Silêncio depois de outbound humano; fora do horário ainda responde; texto livre do Playbook não altera a saída; “aceito” no body não aceita proposta.
- Aceite público: token válido em proposta do Lead → proposta aceita + Cliente criado + proposta aponta para esse Cliente; token de proposta já de Cliente → aceita sem duplicar; token inválido ou proposta não aceitável → erro de negócio em português; chamada sem JWT.
- Playbook: tenant A não lê o do tenant B; usuário não-admin não grava.
- Agenda: evento no responsável; sem responsável usa o padrão do Playbook; sem os dois não grava evento.
- Prior art: testes de service com JUnit 5 + Mockito (Lead, Proposal, conversão). Inbox WhatsApp ainda quase sem teste — o atendente não herda essa lacuna. Controllers de proposta pública seguem o estilo dos testes de controller existentes.

## Out of Scope

- Modelo de linguagem, copilot da equipe, assistente interno (“quais minhas tarefas”).
- Interpretação do texto livre do Playbook.
- Meta Cloud API oficial; o canal continua o gateway da Inbox.
- Aceitar proposta por texto no WhatsApp.
- Autenticação por CPF/token a cada conversa.
- Converter Lead em Cliente no cadastro ou porque a pessoa pediu.
- Status com PDF, itens, anexos, ou qualquer dado de outro Cliente.
- Expiração automática do Silêncio.
- Otimização de horário livre, Google Calendar sync, lembretes.
- Mídia, áudio, botões nativos do WhatsApp (list/reply buttons) na v1 — só texto e menu numerado.
- Autorização por papel na API (gap conhecido do produto); Playbook no frontend continua admin; a API segue o padrão atual e isola por organização.
- Campanhas em massa, chatbot em Instagram/SMS, portal do cliente.

## Further Notes

- Tracker desta spec: markdown local em `.scratch/whatsapp-atendente/` (setup de tracker GitHub ainda não rodou neste repo). Cópia de leitura em `docs/specs/whatsapp-atendente.md`.
- Premissa de calendário confirmada no fechamento do grill: responsável do registro, senão usuário do Playbook.
- A Inbox existente permanece a superfície humana. O atendente não substitui a tela `/whatsapp`; senta na frente dela.
- Próxima fase Ask Matt: `/to-tickets` (fatias verticais com blockers), depois `/implement` por ticket em contexto limpo.
