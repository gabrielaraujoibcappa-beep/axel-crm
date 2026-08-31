# 02 — Arquitetura

## Visão macro

```
┌──────────────────────────┐        HTTPS / JSON        ┌──────────────────────────┐
│  Angular 18 SPA          │  ───────────────────────>  │  Spring Boot REST API    │
│  (static site)           │   Authorization: Bearer    │  /api/v1/**              │
│                          │   X-Tenant-Id: <orgId>     │                          │
│  shell + 30 módulos      │  <───────────────────────  │  Controller → Service    │
└──────────────────────────┘        Page<T> / DTO       │       → Repository       │
                                                        └────────────┬─────────────┘
                                                                     │ JPA / Hibernate
                                                        ┌────────────▼─────────────┐
                                                        │  PostgreSQL              │
                                                        │  38 tabelas + 6 views    │
                                                        │  schema via Flyway       │
                                                        └──────────────────────────┘
```

## Backend — organização de pacotes

Raiz: `backend/src/main/java/com/axelcrm/`

| Pacote | Responsabilidade |
| --- | --- |
| `auth/` | Módulo vertical de autenticação: controller, dto, entity, repository, security, service |
| `commons/` | `BaseEntity`, `Organization`, enum `Role`, exceções e `GlobalExceptionHandler` |
| `config/` | CORS, OpenAPI, auditoria JPA, execução programática do Flyway |
| `controller/` | Controllers REST dos módulos de negócio |
| `dto/` | Records de request e response |
| `entity/` | Entidades JPA e `entity/enums/` |
| `repository/` | Interfaces Spring Data JPA |
| `service/` | Regras de negócio |
| `analytics/` | Repositório que lê as views analíticas |

O módulo `auth` segue organização vertical (fatia completa por feature); os demais módulos seguem organização horizontal (por tipo de camada). Ao criar código novo, mantenha o padrão do módulo em que você está mexendo.

## Fluxo de uma requisição autenticada

1. **`JwtAuthenticationFilter`** lê o header `Authorization: Bearer <token>`, valida a assinatura HMAC256 e extrai `userId`, `role` e `organizationId`. Popula o `SecurityContextHolder` com um `UsernamePasswordAuthenticationToken` cujo *principal* é o `UUID` do usuário, e grava o `organizationId` como atributo da requisição.
2. **`TenantFilter`** lê esse atributo e o coloca no `TenantContext` (`ThreadLocal<UUID>`), limpando-o no `finally`.
3. **Controller** obtém o tenant com `TenantContext.getOrganizationId()` e o repassa explicitamente ao service.
4. **Service** executa a regra e chama o repositório sempre filtrando por `organization_id`.
5. **Repository** aplica o filtro por convenção de nomes (`...AndOrganization_IdAndDeletedAtIsNull`).
6. A resposta é serializada como DTO (`record`), nunca como entidade JPA.

Ambos os filtros limpam seu estado no `finally`, o que é obrigatório em pools de threads reutilizadas.

## Padrões de código no backend

**Controllers** são finos: extraem o tenant, delegam ao service e devolvem `ResponseEntity`. Anotados com `@Tag` e `@Operation` para alimentar o Swagger.

**Services** concentram a regra de negócio, são transacionais (`@Transactional`) e fazem o mapeamento entidade → DTO.

**DTOs** são Java `records` no padrão `XxxRequest` / `XxxResponse`, validados com `@Valid` e Jakarta Validation.

**Entidades** estendem `BaseEntity`, que fornece:

- `id` (`UUID`, gerado pela aplicação)
- `organization` (`@ManyToOne` obrigatório)
- `createdAt` / `updatedAt` (`@CreationTimestamp` / `@UpdateTimestamp`)
- `deletedAt` — soft delete; nenhuma exclusão é física
- um hook `@PrePersist` que preenche a organização a partir do `TenantContext` quando ela não foi setada explicitamente

**Exclusão** é sempre lógica: os métodos `delete` preenchem `deletedAt` e todas as consultas filtram por `DeletedAtIsNull`.

## Tratamento de erros

`GlobalExceptionHandler` (`@RestControllerAdvice`) converte exceções em JSON com formato uniforme:

```json
{ "error": "mensagem", "status": 400, "timestamp": "2026-08-07T10:00:00" }
```

| Exceção | HTTP |
| --- | --- |
| `ResourceNotFoundException` | 404 |
| `BadRequestException` | 400 |
| `MethodArgumentNotValidException` | 400 (inclui `details` com os campos inválidos) |
| `DataIntegrityViolationException` | 400 |
| `HttpMessageNotReadableException` | 400 |
| `BadCredentialsException` | 401 |

## Frontend — organização

Raiz: `frontend/src/app/`

| Pasta | Responsabilidade |
| --- | --- |
| `core/` | Guards, interceptors, modelos e serviços transversais |
| `shared/` | `ListPageComponent`, `FormDialogComponent`, `TimelineComponent` |
| `shell/` | Layout autenticado: sidebar, toolbar, notificações, cronômetro global |
| `features/` | Um diretório por módulo, com `*.routes.ts` e componentes lazy-loaded |

Todos os componentes são **standalone**; todas as rotas de módulo usam `loadChildren`/`loadComponent`, então cada módulo vira um chunk separado no build.

## Camada de dados do frontend

`BaseService<T>` centraliza as chamadas HTTP genéricas — `getPage`, `getById`, `create`, `update`, `delete` — sobre `environment.apiUrl`. Serviços de módulo herdam dele e passam o path do recurso. Fluxos específicos (timeline, detalhe de cliente, detalhe de lead) têm serviços dedicados em `core/services/`.

Dois interceptors funcionais são registrados em `app.config.ts`:

- `authInterceptor` — injeta `Authorization: Bearer <token>` e, em resposta 401, faz logout e redireciona para `/login`
- `tenantInterceptor` — injeta o header `X-Tenant-Id` com o `organizationId` armazenado

> O `X-Tenant-Id` é informativo: o backend **não** o utiliza. O tenant efetivo vem sempre do claim `organizationId` dentro do JWT.
