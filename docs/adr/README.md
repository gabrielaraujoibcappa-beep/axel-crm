# Architecture Decision Records — Axel CRM

Registros de Decisão de Arquitetura (ADRs) documentam **decisões já tomadas** e seu racional, para que quem entrar no projeto depois entenda *por que* o código é como é.

**Regras:**

- ADRs são **imutáveis** — nunca edite a decisão. Se mudar, crie um ADR novo com `Status: Superseded by ADR-NNN` no antigo.
- Cada ADR segue o formato **MADR** (contexto, drivers, opções, decisão, consequências).
- Numeração sequencial: o próximo ADR é o `009`.

## Índice

| ADR | Decisão | Status |
| --- | --- | --- |
| [001](001-multi-tenancy-schema-compartilhado.md) | Multi-tenancy por schema compartilhado (`organization_id` + `TenantFilter`/`TenantContext`) | Accepted |
| [002](002-autenticacao-jwt-stateless.md) | Autenticação stateless com JWT (Auth0 java-jwt) e BCrypt | Accepted |
| [003](003-exclusao-sempre-logica.md) | Exclusão sempre lógica (`deleted_at`, nunca remove linha) | Accepted |
| [004](004-camada-de-dtos.md) | Camada de DTOs — entidades nunca saem pela API | Accepted |
| [005](005-flyway-migrations-ddl-auto-none.md) | Flyway para migrations com `ddl-auto: none` | Accepted |
| [006](006-frontend-angular-standalone-lazy-loading.md) | Frontend Angular 18 standalone com lazy loading | Accepted |
| [007](007-deploy-render-blueprint-docker.md) | Deploy via Render Blueprint com Docker | Accepted |
| [008](008-erros-negocio-portugues.md) | Erros de negócio em português com exceções mapeadas | Accepted |
| [009](009-aceitacao-proposta-na-pagina-publica.md) | Aceitação da proposta na página pública, não por texto no WhatsApp | Accepted |

## Relações entre ADRs

- **001** (multi-tenancy) é a base de **003** (exclusão lógica) e **005** (Flyway): toda tabela carrega `organization_id` + `deleted_at`, criados via migration.
- **002** (JWT) alimenta **001**: o `TenantFilter` roda logo após o `JwtAuthenticationFilter`.
- **004** (DTOs) e **008** (erros) definem o contrato da API: DTOs na entrada/saída, exceções pt-BR mapeadas para status HTTP.
- **005** (Flyway) e **007** (Render) garantem que o schema e o deploy sejam reproduzíveis.

## Como criar um ADR novo

1. Verifique o maior número existente (hoje: `009`).
2. Crie `docs/adr/NNN-titulo-kebab-case.md` no formato MADR (veja [001](001-multi-tenancy-schema-compartilhado.md) como exemplo).
3. Adicione a linha no índice acima.
4. Se o ADR substitui uma decisão anterior, marque o antigo com `Status: Superseded by ADR-NNN`.