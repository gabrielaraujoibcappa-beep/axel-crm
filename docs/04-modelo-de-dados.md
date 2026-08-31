# 04 — Modelo de dados

O schema é gerenciado exclusivamente pelo **Flyway** (`backend/src/main/resources/db/migration/`). O Hibernate roda com `ddl-auto: none` — ele nunca altera o banco.

## Convenções comuns

Toda tabela de negócio herda a estrutura de `BaseEntity`:

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | `UUID` | Chave primária, gerada pela aplicação |
| `organization_id` | `UUID` | FK obrigatória para `organizations` — chave do isolamento multi-tenant |
| `created_at` | `TIMESTAMP` | Preenchido no insert |
| `updated_at` | `TIMESTAMP` | Atualizado a cada update |
| `deleted_at` | `TIMESTAMP` | Soft delete: `NULL` significa registro ativo |

Exceções: `organizations` e `users` não têm `organization_id` no mesmo sentido (`users` referencia a organização, `organizations` é a raiz do tenant).

## Tabelas por domínio

### Núcleo

| Tabela | Descrição |
| --- | --- |
| `organizations` | Tenant. Nome, domínio único, documento, contato, endereço, flag `active` |
| `users` | Usuário. E-mail único global, senha BCrypt, papel, avatar, flag `active` |
| `audit_logs` | Trilha de auditoria de ações sensíveis |
| `notifications` | Notificações do usuário (lidas / não lidas) |
| `integrations` | Configuração de integrações externas |
| `google_tokens` | Tokens OAuth2 do Google por usuário |
| `lgpd_consents` | Registro de consentimentos LGPD |

### Comercial (CRM)

| Tabela | Descrição |
| --- | --- |
| `prospects` | Topo do funil, antes de virar lead |
| `partners` | Parceiros e indicadores de negócio |
| `leads` | Lead com origem, estágio, score e valor estimado |
| `lead_notes` | Anotações do lead |
| `clients` | Cliente convertido, com status, segmento e responsável |
| `client_notes` | Anotações do cliente |
| `client_attachments` | Anexos do cliente |
| `contacts` | Pessoas de contato vinculadas a clientes |
| `pipelines` | Funil de vendas |
| `pipeline_stages` | Estágios ordenados por `position` dentro do pipeline |
| `deals` | Negócio: valor, pipeline, estágio, cliente e responsável |
| `deal_stage_history` | Histórico de permanência em cada estágio, com duração e motivo |
| `campaigns` | Campanhas de marketing |
| `campaign_recipients` | Destinatários de cada campanha |
| `messages` | Comunicações registradas (e-mail, WhatsApp, SMS, ligação, Instagram) |

### Operações

| Tabela | Descrição |
| --- | --- |
| `proposals` | Proposta comercial, com código, token público e rateio de comissões |
| `proposal_items` | Itens da proposta |
| `contracts` | Contratos |
| `projects` | Projeto de entrega, com orçamento, custo e dados periciais |
| `products` | Catálogo de produtos e serviços |
| `tasks` | Tarefas |
| `calendar_events` | Eventos de agenda |
| `legal_processes` | Processos jurídicos (número CNJ) |
| `documents` | Documentos |
| `support_tickets` | Tickets de suporte |
| `time_entries` | Apontamento de horas |

### Financeiro

| Tabela | Descrição |
| --- | --- |
| `invoices` | Fatura: número único, emissão, vencimento, pagamento, subtotal, impostos, desconto, total |
| `financial_transactions` | Lançamentos de entrada, saída, transferência, estorno e ajuste |
| `chart_of_accounts` | Plano de contas hierárquico |
| `bank_accounts` | Contas bancárias |
| `commissions` | Comissões apuradas |
| `commission_rules` | Regras de cálculo de comissão |

## Entidades principais

### `Client`

`name`, `email`, `phone`, `document`, `companyName`, `website`, `address`, `city`, `state`, `zipCode`, `country`, `industry`, `notes`, `active`, `status` (`ClientStatus`), `serviceType`, `assignedTo` (usuário), `contacts` (lista).

### `Lead`

`name`, `email`, `phone`, `company`, `position`, `source` (`LeadSource`), `stage` (`LeadStage`), `notes`, `score`, `estimatedValue`, `lastContactAt`, `convertedAt`, `assignedTo`, `convertedClient` (cliente resultante da conversão), `partner`.

### `Deal`

`title`, `description`, `value`, `pipeline`, `stage`, `client`, `contact`, `assignedTo`, `expectedCloseDate`, `closedAt`, `won`.

O campo `won` é um `Boolean` com **três estados semânticos**:

| Valor | Significado |
| --- | --- |
| `null` | Negócio aberto, em andamento |
| `true` | Ganho |
| `false` | Perdido |

### `Proposal`

`proposalCode`, `publicToken` (UUID usado no link público), `title`, `description`, `status` (`ProposalStatus`), `issueDate`, `validUntil`, `totalAmount`, `discountAmount`, `approvedAt`, `client`, `assignedTo`, `items`, `deal`, `partner` e o bloco de rateio de comissão: `captureUser`/`captureRate`, `sellerUser`/`sellerRate`, `collaboratorUser`/`collaboratorRate`, `partnerRate`.

Há ainda o bloco jurídico e pericial (migration `V28`):

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `lawyerContact` | FK → `contacts` | Advogado vinculado, escolhido entre os contatos cadastrados |
| `lawyerName` | `VARCHAR(200)` | Nome do advogado quando ele ainda não existe no cadastro |
| `referralSource` | `LeadSource` | Origem da indicação — quem indicou continua sendo `partner` |
| `expertUser` | FK → `users` | Perito responsável; **não** participa do rateio de comissão |
| `technicalManagerUser` | FK → `users` | Responsável técnico; **não** participa do rateio de comissão |
| `project` | FK → `projects` | Projeto vinculado à proposta |

`lawyerContact` e `lawyerName` são mutuamente exclusivos: com o contato vinculado, o nome livre é descartado e a leitura devolve o nome do contato (`resolveLawyerName()`).

O vínculo com projeto é bidirecional por caminhos distintos: `Proposal.project` aponta para o projeto atual, e `Project.sourceProposalId` registra a proposta que originou o projeto criado automaticamente.

### `Project`

`name`, `description`, `startDate`, `endDate`, `budget`, `cost`, `status` (string livre, padrão `"PLANEJAMENTO"`), `client`, `manager`, `sourceProposalId` (rastreia a proposta que originou o projeto), `legalProcess`, `cnjNumber`, `expertType`, `paymentStatus`, `deliveryDeadline`.

Os campos `cnjNumber`, `expertType` e `legalProcess` refletem o uso do sistema em perícias e trabalhos jurídicos.

### `Invoice`

`invoiceNumber` (único), `client`, `contract`, `issueDate`, `dueDate`, `paidDate`, `status` (string, padrão `"DRAFT"`), `subtotal`, `taxAmount`, `discountAmount`, `total`, `paidAmount`, `paymentMethod`, `notes`.

## Enums

| Enum | Valores |
| --- | --- |
| `LeadSource` | `WEBSITE`, `SOCIAL_MEDIA`, `REFERRAL`, `EMAIL`, `PHONE`, `EVENT`, `ADVERTISEMENT`, `PARTNER`, `OTHER` |
| `LeadStage` | `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `CONVERTED`, `LOST`, `ARCHIVED` |
| `ProspectStage` | `PROSPECTING`, `CONTACTED`, `WAITING_REPLY` |
| `ClientStatus` | `NEW`, `CONTACTED`, `QUALIFIED`, `WAITING_RESPONSE`, `CLOSED_WON`, `CLOSED_LOST`, `DISCARDED`, `ONBOARDING`, `ACTIVE`, `INACTIVE` |
| `ProposalStatus` | `DRAFT`, `SENT`, `VIEWED`, `NEGOTIATING`, `ACCEPTED`, `REJECTED`, `EXPIRED` |
| `TaskStatus` | `PENDING`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `CANCELLED` |
| `TransactionType` | `INCOME`, `EXPENSE`, `TRANSFER`, `REFUND`, `ADJUSTMENT` |
| `ChartOfAccountType` | `RECEITA`, `DESPESA`, `ATIVO`, `PASSIVO` |
| `CampaignType` | `EMAIL`, `SOCIAL`, `PPC`, `SEO`, `EVENT`, `WEBINAR`, `DIRECT_MAIL`, `OTHER` |
| `MessageChannel` | `EMAIL`, `WHATSAPP`, `SMS`, `CALL`, `INSTAGRAM` |
| `MessageDirection` | `INBOUND`, `OUTBOUND` |
| `ContactType` | `LAWYER`, `JUDGE`, `CLIENT`, `TECHNICAL_ASSISTANT`, `OTHER` |
| `Role` | `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SALES`, `SUPPORT`, `USER`, `VIEWER` |

`Project.status`, `Invoice.status` e `Contract.status` são strings livres, não enums — não há validação de valores permitidos no backend.

## Views analíticas

Criadas em `V25__create_analytics_views.sql` e consultadas por `AnalyticsViewRepository`. Elas agregam dados para o dashboard sem penalizar as consultas transacionais.

| View | Conteúdo |
| --- | --- |
| `vw_entity_counts` | Contagens por entidade para os cards do dashboard |
| `vw_deal_pipeline` | Distribuição de negócios por pipeline e estágio |
| `vw_lead_analytics` | Funil e desempenho de leads |
| `vw_proposal_analytics` | Métricas de propostas |
| `vw_monthly_financial` | Série mensal de receitas e despesas |
| `vw_project_profitability` | Rentabilidade por projeto (orçamento × custo) |

## Migrations

Numeração `V<n>__descricao.sql`, aplicadas em ordem. `R__seed_data.sql` é uma migration **repetível**: reexecuta sempre que seu conteúdo muda, alimentando dados de demonstração.

Linha do tempo das versões:

| Faixa | Escopo |
| --- | --- |
| V1 | Organizações e usuários |
| V2–V8 | Leads, clientes, pipelines, negócios, propostas, projetos, tarefas, agenda, financeiro, campanhas, notificações, suporte |
| V9–V17 | Refinamento de leads e clientes, detalhes, LGPD, mensagens, prospects, parceiros, status |
| V18–V24 | Token público de proposta, plano de contas, processos jurídicos e cronômetro, contratos, produtos, faturas, documentos |
| V25–V26 | Views analíticas, vínculo de propostas com negócios e histórico de estágio |
| V27–V28 | Tokens do Google; campos jurídicos e periciais da proposta |
