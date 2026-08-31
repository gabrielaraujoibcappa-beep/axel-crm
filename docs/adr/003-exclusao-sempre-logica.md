# ADR-003: Exclusão sempre lógica (soft delete)

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: banco de dados, auditoria, integridade de dados

## Contexto e Problema

Em um CRM, registros de clientes, negócios, propostas e transações financeiras têm valor histórico, fiscal e comercial. Exclusões físicas (DELETE) destruiriam trilhas de auditoria e quebrariam referências entre entidades (histórico de pipeline, contratos vinculados a clientes, propostas a negócios). Era preciso um padrão uniforme de exclusão que preservasse os dados e fosse fácil de aplicar em 30+ módulos.

## Drivers de Decisão

- Preservar histórico e referências entre entidades.
- Padrão único e simples de aplicar em todos os módulos.
- Compatível com o esquema de auditoria (created_at/updated_at por auditoria JPA).
- Atender à LGPD: direito ao esquecimento exige um caminho de apagamento real (o `LgpdService` implementa erasure).

## Opções Consideradas

- **Soft delete com coluna `deleted_at` (timestamp)**
- Hard delete (DELETE físico)
- Soft delete com flag booleana `is_active`

## Resultado da Decisão

Opção escolhida: **"Soft delete com coluna `deleted_at` (timestamp)"**, porque preserva o histórico e o `when` da exclusão num único campo, é o padrão adotado em toda a base (`BaseEntity` carrega `deleted_at`, todas as migrations criam a coluna) e os repositórios filtram por `...AndDeletedAtIsNull` em todas as leituras. O método `delete()` nos services preenche `deletedAt` e nunca remove a linha. O `LgpdService` provê os endpoints de exportação e erasure (LGPD), que são o contraponto de apagamento real quando a lei exige.

### Consequências Positivas

- Histórico e referências preservados; auditoria completa de "quando excluiu".
- Padrão uniforme: `BaseEntity` + convenção de repositório.
- Recuperação de dados acidentalmente excluídos.

### Consequências Negativas

- **Toda consulta precisa filtrar `DeletedAtIsNull`** — esquecer o filtro devolve registros "excluídos" (e, combinado com ADR-001, vaza dados).
- Tabelas crescem indefinidamente; registros excluídos acumulam.
- LGPD/erasure exige caminho de hard delete em paralelo (`LgpdService`) — dois caminhos de exclusão convivendo.

## Prós e Contras das Opções

### Soft delete com `deleted_at` ✅ Escolhida

- ✅ Preserva histórico e data da exclusão em um campo.
- ✅ Uniforme, via `BaseEntity` e convenção de repositório.
- ❌ Exige disciplina: toda leitura filtra `DeletedAtIsNull`.
- ❌ Crescimento de dados; precisa de política de retenção/limpeza.

### Hard delete (DELETE físico)

- ✅ Banco enxuto; simples de entender.
- ❌ Destrói histórico e quebra referências/relatórios históricos.
- ❌ Irrecuperável — risco alto para um CRM com dados fiscais.
- ❌ Não suporta o requisito de auditoria do produto.

### Soft delete com flag `is_active`

- ✅ Mesmo benefício de preservação.
- ❌ Não registra quando nem por quem foi excluído (perde a dimensão temporal).
- ❌ Atualizar a flag conflita com "exclusão é evento", não "estado mutável".
- ❌ Sem vantagem sobre `deleted_at` e com menos informação.

## Links

- Código: `backend/src/main/java/com/axelcrm/commons/entity/BaseEntity.java`, services (`delete()`), repositórios (`findByOrganization_IdAndDeletedAtIsNull`)
- Migrations: `backend/src/main/resources/db/migration/V1__init_schema.sql` em diante (coluna `deleted_at`)
- Documentação: `docs/04-modelo-de-dados.md`, `docs/09-guia-de-desenvolvimento.md`
- Relacionado: [ADR-001: Multi-tenancy por schema compartilhado](001-multi-tenancy-schema-compartilhado.md)
