# ADR-008: Erros de negócio em português com exceções mapeadas

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: API, erros, i18n, experiência do usuário

## Contexto e Problema

O produto é usado por equipes comerciais, operacionais e financeiras que falam português. Quando uma regra de negócio é violada (ex.: "cliente já existe", "negócio não pode voltar de estágio"), a mensagem de erro chega direto ao usuário na SPA. Se a API devolvesse mensagens em inglês ou códigos opacos, o frontend teria que traduzir cada caso — duplicação e drift. A decisão foi definir um padrão único de exceções que mapeasse regra violada e recurso não encontrado para status HTTP corretos, com mensagens prontas para exibição.

## Drivers de Decisão

- Mensagens exibidas diretamente ao usuário final (pt-BR).
- Padrão único e consistente em 30+ módulos.
- Mapeamento correto para status HTTP (400 vs 404).
- Controllers finos: regra de negócio no service, exceção declarada lá.

## Opções Consideradas

- **Exceções de negócio em pt-BR (`BadRequestException`, `ResourceNotFoundException`) + `GlobalExceptionHandler`**
- Mensagens em inglês + códigos de erro (frontend traduz)
- Mensagens em inglês sem códigos (frontend exibe texto cru)

## Resultado da Decisão

Opção escolhida: **"Exceções de negócio em pt-BR + `GlobalExceptionHandler`"**, porque o service lança `BadRequestException` (regra violada → 400) ou `ResourceNotFoundException` (não encontrado → 404) com a mensagem em português, e o `GlobalExceptionHandler` mapeia para o status HTTP e formato de resposta padrão. O frontend exibe a mensagem diretamente — sem camada de tradução. Controllers continuam finos, apenas orquestrando; a regra vive no service (convenção do projeto).

### Consequências Positivas

- Mensagens prontas para exibição, sem tradução no frontend.
- Status HTTP corretos e consistentes (400/404) em toda a API.
- Padrão simples e repetível em qualquer módulo novo.

### Consequências Negativas

- **Idioma acoplado à API**: integrações externas recebem mensagens em pt-BR.
- Sem códigos de erro estruturados — clientes não conseguem tratar casos programaticamente (só por texto).
- Mensagens duplicadas entre módulos se não houver centralização (risco de drift de texto).

## Prós e Contras das Opções

### Exceções pt-BR + GlobalExceptionHandler ✅ Escolhida

- ✅ Zero tradução no frontend; mensagens diretas ao usuário.
- ✅ Padrão único e simples; status HTTP corretos.
- ❌ Idioma acoplado à API; sem códigos de erro estruturados.

### Inglês + códigos de erro

- ✅ Integrações podem tratar erros programaticamente.
- ❌ Frontend precisa de tabela de tradução por código — duplicação e drift.
- ❌ Mais infraestrutura (catálogo de códigos) sem necessidade real hoje.

### Inglês sem códigos

- ✅ Simples.
- ❌ Usuário final recebe mensagem em inglês (má experiência).
- ❌ Sem códigos nem tradução — o pior dos dois mundos.

## Links

- Código: `backend/src/main/java/com/axelcrm/commons/exception/` (`BadRequestException`, `ResourceNotFoundException`, `GlobalExceptionHandler`)
- Documentação: `docs/05-api-rest.md` (seção de erros), `docs/09-guia-de-desenvolvimento.md`
- Relacionado: [ADR-004: Camada de DTOs](004-camada-de-dtos.md) (formato de resposta padrão nos DTOs)