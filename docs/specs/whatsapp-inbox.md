# Spec: whatsapp-inbox

Scope: feature

# Feature Spec — Inbox de WhatsApp no Axel CRM

## Objetivo
Prover uma tela de **inbox de WhatsApp** dentro do CRM, no estilo WhatsApp Web, onde a equipe pode **receber e enviar** mensagens de/para leads, clientes, prospects e contatos. A conexão é feita por **gateway terceiro** (Evolution API / WPPConnect / Zenvia) via QR code ou API do provedor — **não** pela Meta Cloud API oficial.

## Decisões de escopo (confirmadas)

- **Conexão:** gateway terceiro (Evolution/WPPConnect/Zenvia), com onboarding por QR code ou credencial de API.
- **Escopo da tela:** inbox completo estilo WhatsApp Web — lista de conversas à esquerda + chat à direita.
- **Direção:** duas vias — o CRM envia e recebe (webhook público roteado por número/nuvem do gateway).

## Stack e padrões existentes (a reutilizar)

- Frontend: **Angular 18 + Angular Material**, componentes standalone, lazy routes (`loadChildren`).
- Backend: **Spring Boot 4**, Spring Data JPA, multi-tenancy por `organization_id`.
- DB: PostgreSQL + Flyway migrations (próxima: `V28__...`).
- JWT auth; páginas de integração protegidas por `adminGuard` (frontend) — atenção: a API **não** aplica autorização por papel (ver `docs/10-pontos-de-atencao.md`).

### Recursos prontos que o spec reutiliza

- Enum `MessageChannel` já tem `WHATSAPP`.
- Tabela `messages` (V13) já modela histórico: `channel`, `direction`, `sender`, `recipient`, `body`, `status`, `sent_at`, refs a `lead_id`/`client_id`/`user_id`.
- Entidade `Integration` (`name`, `provider`, `credentials` TEXT, `webhookUrl`, `apiKey`, `active`, `lastSyncAt`) + `IntegrationController`, `IntegrationService`, `IntegrationRepository`.
- `phone` em `Lead`, `Client`, `Prospect`, `Contact`, `Partner`, `CampaignRecipient`.

## Arquitetura proposta

### Backend (Spring Boot)

1. **`WhatsAppGatewayService`** — abstração sobre o provedor. Interface única com implementações por gateway (Evolution, WPPConnect, Zenvia), selecionada por `provider` na `Integration`. Responsabilidades:
   - `connect` (gerar QR / validar credencial) e `status` (conectado/desconectado).
   - `sendText(organizationId, toPhone, body)`.
   - mapear webhook recebido para um `Message`.

2. **`WhatsAppWebhookController`** — endpoint público (`POST /api/v1/whatsapp/webhook/{integrationId}`) que:
   - valida assinatura/segredo do gateway,
   - resolve a `Integration` por `integrationId` + `organization_id` (roteamento multi-tenant),
   - grava a mensagem recebida e publica um evento de inbox.

3. **`WhatsAppMessageController`** — endpoints autenticados:
   - `GET /conversations` — lista de conversas (agrupadas por número/contato) com última mensagem e não-lidos.
   - `GET /conversations/{phone}/messages` — histórico paginado.
   - `POST /conversations/{phone}/messages` — envia texto via gateway e grava em `messages`.
   - `POST /messages/{id}/read` — marca como lida.
   - `POST /connect` / `POST /disconnect` / `GET /status` — gestão da integração.

4. **DTOs** — `WhatsAppMessageRequest`, `ConversationSummary`, `WhatsAppMessageResponse`, `WhatsAppStatusResponse`.

### Banco (Flyway `V28`)

- Reaproveitar a tabela `messages` (não criar duplicata). Adicionar colunas se necessário:
  - `wa_message_id` (id nativo do gateway, p/ dedupe de webhook),
  - `is_read BOOLEAN` (não-lido para o inbox),
  - `integration_id` (origem).
- Criar tabela `whatsapp_sessions` (ou usar `credentials` da `Integration`) para estado do gateway por organização: `integration_id`, `status` (CONNECTING/CONNECTED/DISCONNECTED), `qrcode`, `instance_id`, `last_seen_at`.
- Índices: `messages(organization_id, channel, recipient)` e `messages.wa_message_id` único.

### Frontend (Angular)

1. **`features/whatsapp/whatsapp.routes.ts`** + `WhatsappInboxComponent` — rota `/whatsapp` (autenticada; decidir se `adminGuard` ou acesso por papel de equipe).
2. Layout **dois painéis**: lista de conversas (esquerda, com busca, avatar, última mensagem, badge de não-lidos) + janela de chat (direita) com balões, campo de envio e indicador de status (enviada/entregue/lida).
3. **Polling ou WebSocket** para atualização em tempo real (recomendado: WebSocket/SSE no backend; fallback: polling a cada Ns).
4. **Vínculo com CRM:** na conversa, botão "vincular a lead/cliente" que associa o número a um registro existente (uso do `phone`); no chat, link para abrir a ficha.
5. **Status da integração:** banner/indicator de conectividade do gateway + fluxo de QR code para conectar (na tela de integrações e/ou no inbox).

## Fluxo de dados

1. **Envio:** usuário digita → `POST /conversations/{phone}/messages` → `WhatsAppGatewayService.sendText` → gateway envia → grava `messages(direction=OUTBOUND)` → UI atualiza.
2. **Recebimento:** gateway chama webhook público → `WhatsAppWebhookController` valida → grava `messages(direction=INBOUND)` → evento → UI recebe via WebSocket/SSE → badge de não-lidos incrementa.
3. **Dedup:** webhooks com `wa_message_id` repetido são ignorados.

## Segurança e multi-tenancy

- Todo acesso a conversas/mensagens restrito por `organization_id` (mesmo padrão das demais entidades).
- Webhook público **sem autenticação**, mas com **validação de assinatura/segredo** por integração.
- Credenciais do gateway armazenadas **criptografadas** (reusar mecanismo existente, se houver, ou adicionar).
- Endpoints privados exigem JWT; autorização por papel é pendência conhecida (ver docs/10) — recomenda-se aplicar `@PreAuthorize` ou guard de papel nos novos endpoints.

## Erros e edge cases

- Número sem `phone` no registro vinculado → UI mostra "número não informado".
- Gateway desconectado → envio bloqueado com mensagem clara e CTA para reconectar.
- Deduplicação de webhooks (idempotência por `wa_message_id`).
- Números não cadastrados como lead/cliente → conversa "sem vínculo"; permite vincular depois.

## Critérios de aceite (mínimos)

- [ ] Admin consegue conectar um número via gateway (QR ou credencial) e ver o status conectado.
- [ ] Usuário vê lista de conversas com última mensagem e contador de não-lidos.
- [ ] Usuário abre um chat, vê histórico e envia mensagem que chega ao destino.
- [ ] Mensagem recebida via webhook aparece no inbox em tempo real e incrementa não-lidos.
- [ ] Conversa pode ser vinculada a um lead/cliente existente.
- [ ] Toda operação respeita o isolamento por organização.

## Fora de escopo (fase 2)

- Mídia/áudio/documentos (texto apenas no MVP).
- Mensagens em massa / templates de campanha (reusar `campaign_recipients` depois).
- Chatbot / respostas automáticas.
- Integração com Meta Cloud API oficial.

## Perguntas em aberto

- Qual gateway específico será usado primeiro (Evolution API é o mais comum self-hosted; Zenvia é SaaS)?
- O inbox deve ser acessível a toda a equipe ou apenas a papéis específicos?
- WebSocket/SSE versus polling para tempo real?

## Referências

- `docs/04-modelo-de-dados.md`, `docs/05-api-rest.md`, `docs/07-regras-de-negocio.md`, `docs/10-pontos-de-atencao.md`
- Migração `V13__create_campaign_recipients_and_messages.sql`
- `backend/.../entity/Integration.java`, `controller/IntegrationController.java`