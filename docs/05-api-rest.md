# 05 — API REST

Base: `/api/v1`. Documentação interativa em `/swagger-ui.html`; contrato OpenAPI em `/v3/api-docs`.

## Convenções

**Autenticação.** Todo endpoint privado exige `Authorization: Bearer <jwt>`. O tenant é lido do claim `organizationId` do próprio token — não é preciso enviá-lo no corpo nem na URL.

**CRUD padrão.** A maioria dos módulos expõe exatamente cinco operações:

| Método | Path | Resposta |
| --- | --- | --- |
| `GET` | `/api/v1/<recurso>` | `Page<XxxResponse>` |
| `GET` | `/api/v1/<recurso>/{id}` | `XxxResponse` |
| `POST` | `/api/v1/<recurso>` | `XxxResponse` (200) |
| `PUT` | `/api/v1/<recurso>/{id}` | `XxxResponse` |
| `DELETE` | `/api/v1/<recurso>/{id}` | `204 No Content` (soft delete) |

**Paginação.** As listagens aceitam os parâmetros padrão do Spring Data:

```
GET /api/v1/clients?page=0&size=10&sort=name,asc
```

A resposta é o envelope `Page` do Spring: `content`, `totalElements`, `totalPages`, `number`, `size`, `first`, `last`.

**Erros.** Formato uniforme, produzido pelo `GlobalExceptionHandler`:

```json
{
  "error": "Erro de validação de dados",
  "details": ["email: não deve estar em branco"],
  "status": 400,
  "timestamp": "2026-08-07T10:00:00"
}
```

## Autenticação e usuários

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/auth/register` | Cria organização + usuário `ADMIN` e devolve o token |
| `POST` | `/auth/login` | Autentica e devolve o token |
| `GET` | `/users` `/users/{id}` | Lista e consulta usuários da organização |
| `GET` | `/users/me` | Dados do usuário autenticado |
| `POST` `PUT` `DELETE` | `/users` `/users/{id}` | Gestão de usuários |

## CRM

| Recurso | Base | Endpoints adicionais |
| --- | --- | --- |
| Prospects | `/prospects` | `POST /{id}/promote` — promove prospect a lead |
| Parceiros | `/partners` | — |
| Leads | `/leads` | `POST /{id}/convert` — converte em cliente; `POST /{id}/recalculate-score` |
| Notas de lead | `/leads/{leadId}/notes` | `DELETE /{noteId}` |
| Timeline de lead | `/leads/{leadId}/timeline` | Somente leitura |
| Clientes | `/clients` | — |
| Notas de cliente | `/clients/{clientId}/notes` | `DELETE /{noteId}` |
| Anexos de cliente | `/clients/{clientId}/attachments` | `GET /{attachmentId}/download`, `DELETE /{attachmentId}` |
| Timeline de cliente | `/clients/{clientId}/timeline` | Somente leitura |
| Contatos | `/contacts` | — |
| Pipelines | `/pipelines` | `GET /{pipelineId}/stages`, `POST /stages`, `PUT /stages/{stageId}`, `DELETE /stages/{stageId}` |
| Negócios | `/deals` | `POST /{id}/transition`, `POST /{id}/mark-lost`, `POST /{id}/reopen`, `POST /{id}/convert-to-project` |
| Comunicações | `/communications` | `GET /lead/{leadId}`, `GET /client/{clientId}` |
| Campanhas | `/campaigns` | `POST /{id}/send` |

## Operações

| Recurso | Base | Endpoints adicionais |
| --- | --- | --- |
| Propostas | `/proposals` | `GET /public/{token}` (público), `GET /{id}/pdf`, `GET /public/{token}/pdf` (público), `POST /{id}/convert-to-project` |

O corpo de `ProposalRequest` aceita, além dos campos comerciais, o bloco jurídico e pericial: `lawyerContactId`, `lawyerName`, `referralSource`, `expertUserId`, `technicalManagerUserId` e `projectId`. A resposta devolve `lawyerContactId`, `lawyerName` (resolvido a partir do contato quando houver), `referralSource`, `expertUser`, `technicalManagerUser`, `projectId` e `projectName`. Ver [Regras de negócio](07-regras-de-negocio.md).
| Contratos | `/contracts` | — |
| Projetos | `/projects` | — |
| Produtos | `/products` | — |
| Tarefas | `/tasks` | — |
| Agenda | `/calendar-events` | — |
| Processos jurídicos | `/legal-processes` | `GET /search` |
| Documentos | `/documents` | — |
| Tickets | `/support-tickets` | — |
| Apontamento de horas | `/time-entries` | — |

## Financeiro

| Recurso | Base | Endpoints adicionais |
| --- | --- | --- |
| Faturas | `/invoices` | `GET /{id}/pdf`, `GET /report/pdf` |
| Transações | `/financial-transactions` | — |
| Plano de contas | `/chart-of-accounts` | `GET /tree` (hierarquia), `POST /import` |
| Contas bancárias | `/bank-accounts` | — |
| Comissões | `/commissions` | — |
| Regras de comissão | `/commission-rules` | — |
| Relatórios financeiros | `/financial-reports` | `GET /cash-flow`, `GET /income-statement` |
| Relatórios | `/reports` | `GET /dre`, `GET /dfc` |

## Dashboard e analytics

| Método | Endpoint | Conteúdo |
| --- | --- | --- |
| `GET` | `/dashboard/summary` | Resumo consolidado |
| `GET` | `/dashboard/counts` | Contadores por entidade |
| `GET` | `/dashboard/sales` | Métricas de vendas |
| `GET` | `/dashboard/leads` | Funil de leads |
| `GET` | `/dashboard/financial-trend` | Série mensal financeira |
| `GET` | `/dashboard/projects` | Rentabilidade de projetos |
| `GET` | `/dashboard/proposals` | Métricas de propostas |
| `GET` | `/analytics/dashboard` | Agregação direta das views analíticas |

## Transversais

| Recurso | Base | Observação |
| --- | --- | --- |
| Notificações | `/notifications` | `PUT /{id}/read` marca como lida |
| Logs de auditoria | `/audit-logs` | Somente leitura |
| LGPD | `/lgpd` | `POST /consent`, `GET /export`, `DELETE /forget` |
| Integrações | `/integrations` | CRUD + `/google/status`, `/google/connect`, `/google/disconnect`, `/google/calendar`, `/ai/generate` |

> Os endpoints `/integrations/google/*` e `/integrations/ai/generate` no controller devolvem respostas **mockadas** e não usam o `GoogleIntegrationService` real. Veja [Pontos de atenção](10-pontos-de-atencao.md).

## Endpoints públicos

Dois fluxos funcionam sem autenticação:

**Proposta pública.** `GET /api/v1/proposals/public/{token}` e `GET /api/v1/proposals/public/{token}/pdf` localizam a proposta pelo `publicToken` (UUID). O link é entregue ao cliente final e renderizado pela rota `/public/proposals/:token` da SPA. Quem tiver o token acessa a proposta — não há expiração de token nem segundo fator.

**Saúde da aplicação.** `GET /actuator/health` e `GET /actuator/info`, com `show-details: never`.
