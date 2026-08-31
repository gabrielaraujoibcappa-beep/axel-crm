# Axel CRM — Project Instructions

CRM multi-tenant (Angular 18 SPA + Spring Boot 4 REST API + PostgreSQL). Gestão comercial, operacional e financeira. Documentação técnica completa em `docs/` (pt-BR) — leia `docs/09-guia-de-desenvolvimento.md` antes de adicionar módulos.

## Tech Stack

| Layer    | Technology |
| -------- | ---------- |
| Backend  | Java 21, Spring Boot 4.0, Spring Data JPA, Spring Security |
| Frontend | Angular 18 (standalone components), Angular Material, Chart.js |
| Database | PostgreSQL, Flyway migrations (`backend/src/main/resources/db/migration/`) |
| Auth     | JWT (Auth0 java-jwt), BCrypt |
| Docs     | SpringDoc OpenAPI (Swagger UI em `/swagger-ui.html`) |
| Deploy   | Render Blueprint (`render.yaml`), Docker |

## Commands

- Backend dev: `cd backend && mvn spring-boot:run` (porta 8080; DB local em `localhost:5440/axelcrm`)
- Backend tests: `cd backend && mvn test` (JUnit 5 + Mockito + H2)
- Backend build: `cd backend && mvn package`
- Frontend dev: `cd frontend && npm install && ng serve` (porta 4200)
- Frontend tests: `cd frontend && npm test` (Karma + Jasmine — sem specs relevantes hoje)
- Frontend build: `cd frontend && npm run build -- --configuration production`

## Backend Conventions (obrigatórias)

- **Toda consulta filtra por organização** — repositórios usam `findByOrganization_IdAndDeletedAtIsNull(...)`. Não há rede de proteção no banco; vazar tenant é bug crítico.
- **Toda exclusão é lógica** — preenche `deletedAt`; nunca remove linha.
- **Entidade nunca sai pela API** — controllers respondem DTOs (records `XxxRequest`/`XxxResponse` em `dto/`).
- **Tenant vem do token** — `TenantContext.getOrganizationId()` no controller; nunca aceitar `organizationId` do body/query.
- **Regra de negócio fica no service** — controllers são finos, só orquestram.
- **Erros de negócio em português** — `BadRequestException` (regra violada) e `ResourceNotFoundException` (não encontrado); `GlobalExceptionHandler` mapeia o status.
- **Lombok** — `@RequiredArgsConstructor` + `@Data`; entidades estendem `BaseEntity` (`commons/entity/`).
- **Swagger** — controllers anotados com `@Tag` e métodos com `@Operation`.
- **Migrations** — `V<n>__descricao.sql` com `id UUID PK`, `organization_id UUID NOT NULL`, `created_at`, `updated_at`, `deleted_at`, índice em `organization_id`.

## Frontend Conventions

- **Standalone components** com lazy loading (`loadComponent`/`loadChildren` em `app.routes.ts`).
- **Módulos em `features/<nome>/`** com `features/<nome>/<nome>.routes.ts` exportando `<NOME>_ROUTES`.
- **Services estendem `BaseService<T>`** (`core/services/base.service.ts`) fixando o path do recurso.
- **Listas** usam `shared/list-page/` (declarando `columns`, `kpis`) + `FormDialogComponent`.
- **Shell** (`shell/`) tem o layout com sidebar; itens de navegação são registrados em `shell.component.ts`.
- **Guards** em `core/guards/` (`authGuard`, `adminGuard`).

## Architecture Notes

- Multi-tenancy: `TenantFilter` (após JWT) resolve a organização e popula `TenantContext`; `BaseEntity` carrega `organizationId`.
- API REST sob `/api/v1/...`; paginação Spring Data (`Pageable`) — frontend usa `getPage(path, page, size, sort)`.
- Caminhos públicos: `/api/v1/auth/**`, `/api/v1/proposals/public/**`, webhooks WhatsApp/Google, Swagger, actuator health.
- Módulos de negócio: leads/prospects/clientes, pipeline de vendas (`PipelineEngine`, `DealStageHistory`), propostas (link público + PDF via OpenPDF), projetos/contratos/processos legais, financeiro (invoices, transações, plano de contas, comissões), LGPD, WhatsApp inbox.

## Known Gaps (docs/10-pontos-de-atencao.md)

- Autorização por papel NÃO está aplicada na API (só no frontend).
- Integração Google/email: service existe, controller retorna mocks.
- Sem cobertura de teste: `LeadScoringService`, `CommissionService`, `LgpdService`, `CampaignService`.

## Git

- Commits convencionais: `<tipo>: <descrição>` (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`), descrição no imperativo.
- Branch principal: `master`.