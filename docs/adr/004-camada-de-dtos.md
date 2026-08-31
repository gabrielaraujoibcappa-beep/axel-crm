# ADR-004: Camada de DTOs — entidades nunca saem pela API

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: API, DTO, acoplamento, validação

## Contexto e Problema

As entidades JPA carregam relacionamentos lazy, campos de infraestrutura (auditoria, tenant) e detalhes de persistência que não devem ser expostos na API REST. Serializar entidades diretamente causa erros de lazy-loading fora da sessão (o projeto roda com `open-in-view: true`, mas isso não resolve todos os casos), expõe campos desnecessários (incluindo `organizationId` e dados internos) e acopla o contrato público à estrutura do banco. O contrato da API precisava ser estável e explícito.

## Drivers de Decisão

- Contrato de API estável, independente do modelo de persistência.
- Não expor campos internos (tenant, auditoria, dados sensíveis desnecessários).
- Validação de entrada em ponto único (Jakarta Validation).
- Evitar N+1/lazy-loading na serialização.

## Opções Consideradas

- **Records DTO (`XxxRequest`/`XxxResponse`) com validação Jakarta, mapeados manualmente no service**
- Serializar entidades JPA diretamente (com `@JsonIgnore` pontual)
- MapStruct/ModelMapper para o mapeamento

## Resultado da Decisão

Opção escolhida: **"Records DTO mapeados manualmente"**, porque dá contrato explícito por endpoint, validação declarativa (`@Valid` + Jakarta Validation nos `XxxRequest`) e zero dependência de gerador de código. Todo controller responde `XxxResponse` e recebe `XxxRequest`; o mapeamento entidade↔DTO acontece no service (convenção do projeto). Não há interface no repositório para isso — é prática de código, uniforme em todos os 30+ módulos.

### Consequências Positivas

- Contrato da API desacoplado do schema; renomear coluna não muda a API.
- Nada de tenant/auditoria/dados internos vazando na resposta.
- Validação centralizada e tipada nos requests.

### Consequências Negativas

- **Boilerplate de mapeamento** em cada módulo (records + conversão manual).
- Risco de drift: campos novos na entidade esquecidos no DTO (ou vice-versa).
- Duas "visões" de cada conceito para manter sincronizadas.

## Prós e Contras das Opções

### Records DTO mapeados manualmente ✅ Escolhida

- ✅ Contrato explícito e estável; validação declarativa.
- ✅ Sem dependência de gerador; fácil de debugar.
- ❌ Boilerplate; risco de drift entre entidade e DTO.

### Serialização direta da entidade

- ✅ Zero código de mapeamento.
- ❌ Vaza `organizationId`, auditoria e campos internos.
- ❌ Lazy-loading quebra fora do contexto de persistência.
- ❌ Contrato acoplado ao banco; renomear coluna muda a API.
- ❌ Validação espalhada/ausente.

### MapStruct/ModelMapper

- ✅ Remove boa parte do boilerplate.
- ❌ Dependência de geração de código (MapStruct) ou reflection em runtime (ModelMapper) — mais difícil de debugar e configurar por módulo.
- ❌ O ganho não justificava a dependência para o time.

## Links

- Código: `backend/src/main/java/com/axelcrm/dto/` (records `XxxRequest`/`XxxResponse`), `controller/ClientController.java` (exemplo canônico)
- Documentação: `docs/05-api-rest.md`, `docs/09-guia-de-desenvolvimento.md`
- Relacionado: [ADR-003: Exclusão sempre lógica](003-exclusao-sempre-logica.md) (entidade carrega `deleted_at`, ausente dos DTOs)
