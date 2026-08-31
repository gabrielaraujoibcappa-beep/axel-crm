# ADR-005: Flyway para migrations com `ddl-auto: none`

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: banco de dados, migrations, deploy

## Contexto e Problema

O schema do banco é o contrato mais sensível do produto: 30+ entidades, multi-tenancy (coluna `organization_id` em toda tabela, ver ADR-001) e dados financeiros. Deixar o Hibernate criar/alterar o schema automaticamente (`ddl-auto: update`) funciona em desenvolvimento, mas em produção altera tabelas sem controle, sem histórico e sem rollback — inaceitável para um CRM com dados fiscais. Era preciso versionar o schema de forma determinística, aplicável em qualquer ambiente (local, Render).

## Drivers de Decisão

- Schema versionado e reproduzível em qualquer ambiente.
- Migrações revisáveis em PR e aplicadas na ordem correta.
- Compatível com multi-tenancy (schema único compartilhado).
- Dados de seed para desenvolvimento sem poluir produção.

## Opções Consideradas

- **Flyway com `ddl-auto: none`** (migrations SQL versionadas `V<n>__descricao.sql` + seed repetível `R__seed_data.sql`)
- Hibernate `ddl-auto: update` (auto-DDL)
- Liquibase (migrations em XML/YAML)

## Resultado da Decisão

Opção escolhida: **"Flyway com `ddl-auto: none`"**, porque versiona o schema em SQL explícito, roda automaticamente no boot (`FlywayMigrationConfig`), e o `application.yml` fixa `ddl-auto: none` — o Hibernate nunca altera o schema. As migrations seguem a convenção `V<n>__descricao.sql` (V1–V29 hoje) com `id UUID PK`, `organization_id UUID NOT NULL`, `created_at`, `updated_at`, `deleted_at` e índice em `organization_id`. O seed é repetível (`R__seed_data.sql`) e precisa de ordem de cleanup corrigida para evitar erro `session_replication_role` (commit `b995a34`).

### Consequências Positivas

- Schema versionado, auditável e aplicado deterministicamente em qualquer ambiente.
- Migrations revisáveis em PR; nunca editar uma migration já aplicada.
- Seed isolado em script repetível, fora das migrations versionadas.

### Consequências Negativas

- **SQL duplicado**: o schema vive em SQL (Flyway) e em anotações JPA — mudanças precisam ser feitas nos dois lugares.
- Migrations aplicadas são imutáveis; corrigir exige nova migration (disciplina).
- Seed repetível exige cuidado com ordem de execução (FKs, `session_replication_role`).

## Prós e Contras das Opções

### Flyway + `ddl-auto: none` ✅ Escolhida

- ✅ SQL explícito e versionado; histórico completo.
- ✅ Roda no boot sem passo manual; suporta o deploy do Render.
- ✅ Convenção simples (`V<n>__descricao.sql`) já consolidada no projeto.
- ❌ Duplicação SQL/JPA; migrations imutáveis exigem disciplina.

### Hibernate `ddl-auto: update`

- ✅ Zero trabalho de migration no dia a dia.
- ❌ Altera tabelas em produção sem controle nem histórico.
- ❌ Difícil reproduzir o schema em outro ambiente (depende do estado atual).
- ❌ Sem rollback; risco alto para dados financeiros.

### Liquibase

- ✅ Versionamento equivalente ao Flyway, com changelogs XML/YAML.
- ❌ Mais verboso e com curva de aprendizado maior que SQL puro.
- ❌ Sem vantagem real sobre Flyway para este projeto (PostgreSQL único, time pequeno).

## Links

- Código: `backend/src/main/resources/db/migration/` (V1–V29 + `R__seed_data.sql`), `config/FlywayMigrationConfig.java`, `application.yml` (`ddl-auto: none`)
- Documentação: `docs/08-ambiente-e-deploy.md`, `docs/09-guia-de-desenvolvimento.md`
- Relacionado: [ADR-001: Multi-tenancy por schema compartilhado](001-multi-tenancy-schema-compartilhado.md), [ADR-003: Exclusão sempre lógica](003-exclusao-sempre-logica.md)