# Guia de Onboarding — Axel CRM

> Gerado pelo fluxo de codebase-onboarding. Resumo operacional do projeto; detalhes em `docs/09-guia-de-desenvolvimento.md` e nos demais capítulos técnicos.

## Visão Geral

CRM multi-tenant para gestão comercial, operacional e financeira — leads/prospects/clientes, pipeline de vendas, propostas com link público e PDF, projetos/contratos/processos legais, financeiro completo (invoices, plano de contas, comissões), LGPD e inbox WhatsApp. SPA Angular consumindo API REST Spring Boot sobre PostgreSQL, com isolamento de dados por organização via JWT.

## Tech Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Java + Spring Boot | 21 / 4.0.7 |
| Frontend | Angular (standalone) + Material + Chart.js | 18.2 |
| Database | PostgreSQL + Flyway | 16+ / V1–V29 |
| Auth | JWT (Auth0 java-jwt) + BCrypt | 4.4.0 |
| Docs API | SpringDoc OpenAPI | 2.8.0 |
| Testes | JUnit 5 + Mockito + H2 (backend); Karma + Jasmine (frontend) | — |
| Deploy | Render Blueprint + Docker | — |

## Arquitetura

```
Angular SPA (:4200) ──HTTP /api/v1──▶ Spring Boot API (:8080)
                                        │
                              JwtAuthenticationFilter (valida token)
                                        │
                              TenantFilter (resolve org → TenantContext)
                                        │
                              Controller (fino, lê TenantContext)
                                        │
                              Service (@Transactional, regra de negócio)
                                        │
                              Repository (findByOrganization_IdAndDeletedAtIsNull)
                                        │
                              PostgreSQL (Flyway migrations)
```

**Padrão:** monólito full-stack em 2 pastas (`backend/`, `frontend/`), REST, camadas clássicas (controller → service → repository), multi-tenancy por coluna `organization_id` em toda tabela.

## Pontos de Entrada Chave

- **API REST**: `backend/src/main/java/com/axelcrm/controller/` — 41 controllers sob `/api/v1/...`
- **Regras de negócio**: `backend/.../service/` — 44 services (inclui `PipelineEngine`, `LeadScoringService`)
- **Modelo de dados**: `backend/src/main/resources/db/migration/` — fonte da verdade do schema
- **Segurança/multi-tenancy**: `backend/.../auth/security/` (`SecurityConfig`, `JwtAuthenticationFilter`, `TenantFilter`, `TenantContext`)
- **Rotas SPA**: `frontend/src/app/app.routes.ts` + `features/<modulo>/<modulo>.routes.ts`
- **Shell/layout**: `frontend/src/app/shell/shell.component.ts` (sidebar, navegação)
- **Config**: `backend/src/main/resources/application*.yml`, `frontend/src/environments/`

## Mapa de Diretórios

```
backend/src/main/java/com/axelcrm/
├── controller/   → endpoints REST (finos, só orquestram)
├── service/      → regras de negócio (@Transactional)
├── repository/   → Spring Data JPA com filtro de tenant
├── entity/       → entidades JPA (estendem BaseEntity)
├── dto/          → records XxxRequest/XxxResponse (validação Jakarta)
├── auth/         → controller/dto/entity/repository/security/service de auth
├── config/       → CORS, OpenAPI, JPA auditing, Flyway
├── commons/      → BaseEntity, exceções, GlobalExceptionHandler
└── analytics/    → views/agregações de relatórios

frontend/src/app/
├── core/         → services (BaseService<T>, auth), guards, interceptors, models
├── features/     → 31 módulos de negócio (clients, deals, proposals, invoices...)
├── shared/       → list-page, form-dialog, componentes reutilizáveis
└── shell/        → layout com sidebar + timer

docs/              → documentação técnica pt-BR (10 capítulos + manual do usuário)
```

## Ciclo de Vida de uma Request

1. **Entrada**: `GET /api/v1/clients` → `SecurityConfig` exige autenticação (exceto paths públicos).
2. **Auth**: `JwtAuthenticationFilter` valida o JWT (Auth0) e popula o `SecurityContext`.
3. **Tenant**: `TenantFilter` resolve a organização do token e popula `TenantContext`.
4. **Controller**: `ClientController.findAll(Pageable)` lê `TenantContext.getOrganizationId()` e delega ao service.
5. **Service**: `ClientService.findAll(organizationId, pageable)` aplica regras e chama o repositório.
6. **Repository**: `findByOrganization_IdAndDeletedAtIsNull(organizationId, pageable)` — filtro de tenant + soft-delete.
7. **Resposta**: DTO `ClientResponse` (entidade nunca serializada) → `GlobalExceptionHandler` traduz `BadRequestException`/`ResourceNotFoundException` em status HTTP com mensagem em pt-BR.

## Convenções

- **Backend**: `@RequiredArgsConstructor` + `@Data` (Lombok); DTOs como records; `@Tag`/`@Operation` no Swagger; erros de negócio em português; exclusão sempre lógica (`deletedAt`).
- **Frontend**: standalone components + lazy loading; services estendem `BaseService<T>`; listas via `shared/list-page/`; navegação registrada no shell.
- **Testes**: backend `*Test.java` em `src/test/java/com/axelcrm/{service,controller}/` com `BaseServiceTest`/`ControllerTestConfig`; frontend sem specs relevantes.
- **Git**: commits convencionais (`feat:`, `fix:`, `refactor:`...) no imperativo; branch `master`.

## Tarefas Comuns

- **Rodar backend**: `cd backend && mvn spring-boot:run` (DB: `localhost:5440/axelcrm`, user `postgres`/`123456`)
- **Rodar frontend**: `cd frontend && npm install && ng serve`
- **Testes backend**: `cd backend && mvn test` (144 testes / 23 classes)
- **Build**: `mvn package` (backend) / `npm run build -- --configuration production` (frontend)
- **Swagger**: `http://localhost:8080/swagger-ui.html`
- **Nova migration**: `V<n>__descricao.sql` em `db/migration/` (nunca editar migration aplicada)

## Onde Procurar

| Preciso de... | Vá para... |
|---------------|-----------|
| Adicionar um módulo CRUD | `docs/09-guia-de-desenvolvimento.md` (passo a passo com `Client` como referência) |
| Contrato de um endpoint | Swagger UI ou `controller/` + `dto/` |
| Regra de negócio | `service/` |
| Estrutura de tabela | `resources/db/migration/` |
| Isolamento de tenant | `auth/security/TenantFilter`, `TenantContext`, `commons/entity/BaseEntity` |
| Autenticação | `auth/security/`, `auth/service/AuthService` |
| Tela de listagem | `shared/list-page/` + componente do módulo |
| Riscos conhecidos | `docs/10-pontos-de-atencao.md` |