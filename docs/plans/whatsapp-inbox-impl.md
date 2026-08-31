---
plan name: whatsapp-inbox-impl
plan description: Inbox WhatsApp via gateway Evolution/OpenWA
plan status: active
---

## Idea
Implementar a tela de Inbox de WhatsApp no Axel CRM (Angular 18 + Spring Boot 4 + PostgreSQL). Conexão por gateway terceiro open-source (Evolution API primeiro, OpenWA depois) via abstração de provedor. Inbox completo estilo WhatsApp Web (lista de conversas + chat), duas vias: envio via gateway e recebimento via webhook público roteado por organização. Tempo real via SSE com fallback de polling. Acesso a toda a equipe na rota /whatsapp (sem adminGuard); somente a página de configuração da integração permanece admin. Reaproveita a tabela messages existente (V13) e a entidade Integration; adiciona colunas wa_message_id/is_read/integration_id e tabela whatsapp_sessions via Flyway V28. Isolamento por organization_id, credenciais criptografadas, dedup de webhook por wa_message_id.

## Implementation
- Backend: criar migração Flyway V28 adicionando colunas wa_message_id (único, p/ dedup), is_read, integration_id à tabela messages, e criar tabela whatsapp_sessions (integration_id, status CONNECTING/CONNECTED/DISCONNECTED, qrcode, instance_id, last_seen_at) com índices por organization_id.
- Backend: definir interface WhatsAppGatewayService (connect/QR, status, sendText, disconnect, mapWebhook) e implementar EvolutionProvider (primeiro) + OpenWAProvider (segundo), selecionados por integration.provider, com credenciais criptografadas.
- Backend: implementar WhatsAppWebhookController (endpoint público POST /api/v1/whatsapp/webhook/{integrationId}) com validação de assinatura/segredo, roteamento por organization_id, gravação de Message INBOUND e dedup por wa_message_id.
- Backend: implementar WhatsAppMessageController + DTOs (WhatsAppMessageRequest, ConversationSummary, WhatsAppMessageResponse, WhatsAppStatusResponse) com endpoints: GET /conversations, GET /conversations/{phone}/messages, POST /conversations/{phone}/messages, POST /messages/{id}/read, POST /connect, POST /disconnect, GET /status — todos com isolamento por organization_id e autorização JWT.
- Backend: implementar tempo real — endpoint SSE GET /conversations/stream (ou fallback de polling) que emite eventos de nova mensagem/não-lidos por organização; publicar evento no webhook e no envio.
- Frontend: criar features/whatsapp/whatsapp.routes.ts e WhatsappInboxComponent com layout dois painéis (lista de conversas com busca/avatar/última msg/badge de não-lidos + janela de chat com balões e campo de envio), standalone + Angular Material.
- Frontend: implementar fluxo de chat (render de histórico, envio via POST, atualização por SSE EventSource com fallback de polling 5s, indicador de status enviada/entregue/lida) e vínculo de conversa a lead/cliente existente.
- Frontend: registrar rota /whatsapp em app.routes.ts SEM adminGuard (acesso a toda a equipe), adicionar link de navegação no shell, e integrar banner/status de conectividade do gateway + fluxo de QR code para conectar.
- Testes: unitários/integração no backend (dedup de webhook, isolamento por organização, envio via provider, SSE) e testes no frontend (lista de conversas, envio, renderização de mensagens recebidas); atualizar docs/04-modelo-de-dados, docs/05-api-rest e docs/manual-do-usuario.

## Required Specs
<!-- SPECS_START -->
- whatsapp-inbox
<!-- SPECS_END -->