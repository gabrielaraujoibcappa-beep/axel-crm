# ADR-001: Multi-tenancy por schema compartilhado

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: arquitetura, multi-tenancy, segurança, banco de dados

## Contexto e Problema

O Axel CRM atende múltiplas organizações no mesmo produto, e o isolamento de dados entre tenants é um requisito de segurança crítico. Era preciso escolher uma estratégia de multi-tenancy que se encaixasse na operação simples (PostgreSQL único no free tier do Render) sem exigir infraestrutura de orquestração complexa. A decisão também precisava ser consistente com um time pequeno e com a regra de "nenhuma rede de proteção no banco".

## Drivers de Decisão

- Deve rodar em um único PostgreSQL (plano gratuito do Render).
- Isolamento de dados entre organizações é requisito de segurança (LGPD, dados comerciais).
- Operação simples: um único schema a migrar, um único banco a administrar.
- Consultas uniformes em todos os módulos (30+ entidades).

## Opções Consideradas

- **Schema compartilhado com coluna `organization_id`** (tenant por linha)
- Schema por tenant (um schema por organização)
- Banco por tenant (um database por organização)

## Resultado da Decisão

Opção escolhida: **"Schema compartilhado com coluna `organization_id`"**, porque é a única viável no plano free do Render, mantém as migrações Flyway únicas e torna todas as consultas uniformes (`findByOrganization_IdAndDeletedAtIsNull`). O `TenantFilter` (registrado após o `JwtAuthenticationFilter` no `SecurityConfig`) resolve a organização a partir do token e popula o `TenantContext` (uma `ThreadLocal`), que os controllers leem via `TenantContext.getOrganizationId()`.

### Consequências Positivas

- Um único banco, schema e conjunto de migrações — operação trivial.
- Custo zero extra de infraestrutura por tenant.
- Consultas uniformes em todos os módulos; `BaseEntity` carrega `organizationId` automaticamente.

### Consequências Negativas

- **Sem rede de proteção no banco**: um repositório sem filtro de `organization_id` vaza dados entre tenants — a segurança depende de convenção e revisão.
- Todas as tabelas e queries carregam a coluna de tenant (ruído em todo o schema).
- `TenantContext` (ThreadLocal) exige disciplina no ciclo de vida da request; código assíncrono precisaria propagar o contexto manualmente.

## Prós e Contras das Opções

### Schema compartilhado com coluna `organization_id` ✅ Escolhida

- ✅ Custo operacional mínimo; migrações únicas; consultas uniformes.
- ✅ Sem infraestrutura por tenant.
- ❌ Isolamento depende de convenção (nenhuma proteção no banco).
- ❌ Dados de todos os tenants vivem nas mesmas tabelas (capacidade máxima é a do banco único).

### Schema por tenant

- ✅ Isolamento físico em nível de schema.
- ✅ Drop de schema = exclusão total do tenant.
- ❌ Migrações precisam rodar N vezes (uma por tenant).
- ❌ Conexão/filtro por schema complica pooling e as queries.
- ❌ Não cabe no free tier do Render com muitos tenants.

### Banco por tenant

- ✅ Isolamento máximo.
- ❌ Inviável no plano gratuito (um banco por tenant).
- ❌ Provisionamento e backup por tenant inviáveis para o time.
- ❌ Migrações e deploys ficam exponencialmente mais complexos.

## Links

- Código: `backend/src/main/java/com/axelcrm/auth/security/TenantFilter.java`, `TenantContext.java`, `commons/entity/BaseEntity.java`
- Documentação: `docs/03-seguranca-multitenancy.md`
- Convenção obrigatória: `docs/09-guia-de-desenvolvimento.md` (todo repositório filtra por organização)
- Relacionado: [ADR-003: Exclusão sempre lógica](003-exclusao-sempre-logica.md)
