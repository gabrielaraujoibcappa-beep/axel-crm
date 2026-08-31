# ADR-006: Frontend Angular 18 standalone com lazy loading

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: frontend, angular, arquitetura

## Contexto e Problema

O frontend é uma SPA Angular com 31 módulos de negócio (leads, pipeline, propostas, financeiro, LGPD, WhatsApp...). Com NgModules tradicionais, cada módulo adiciona boilerplate (declarations, imports, exports) e o bundle inicial cresce sem controle. Era preciso uma estrutura que escalasse com muitos módulos, carregasse apenas o necessário por rota e mantivesse convenções simples de adicionar um módulo novo.

## Drivers de Decisão

- Muitos módulos de negócio (31) — estrutura previsível e de baixo boilerplate.
- Bundle inicial pequeno — carregar código apenas quando a rota é acessada.
- Convenção simples para adicionar módulo novo (padrão repetível).
- Stack consolidada: Angular + Angular Material + Chart.js.

## Opções Consideradas

- **Standalone components + lazy loading (`loadComponent`/`loadChildren`)**
- NgModules tradicionais com `loadChildren`
- Framework alternativo (React/Next.js, Vue)

## Resultado da Decisão

Opção escolhida: **"Standalone components + lazy loading"**, porque elimina o boilerplate de NgModule, mantém o bundle inicial enxuto e padroniza a estrutura: cada módulo vive em `features/<nome>/` com `<nome>.routes.ts` exportando `<NOME>_ROUTES`, registrado em `app.routes.ts` via `loadComponent`/`loadChildren`. Services estendem `BaseService<T>` (`core/services/base.service.ts`) fixando o path do recurso; listas usam `shared/list-page/` (declarando `columns`, `kpis`) + `FormDialogComponent`; o shell (`shell/`) registra os itens de navegação; guards (`authGuard`, `adminGuard`) ficam em `core/guards/`.

### Consequências Positivas

- Bundle inicial menor; módulos carregam sob demanda.
- Menos boilerplate por módulo; convenção clara e repetível.
- Angular Material + Chart.js integrados sem fricção.

### Consequências Negativas

- **Autorização por papel só no frontend** (gap conhecido): `adminGuard` esconde rotas, mas a API não valida papéis — ver `docs/10-pontos-de-atencao.md`.
- Lazy loading exige disciplina de roteamento (tudo passa por `app.routes.ts`).
- Sem SSR — SEO/primeira pintura não são prioridade para CRM interno, mas limitam casos de uso.

## Prós e Contras das Opções

### Standalone + lazy loading ✅ Escolhida

- ✅ Baixo boilerplate; carregamento sob demanda; convenção simples.
- ✅ Alinhado ao Angular 18 (standalone é o padrão recomendado).
- ❌ Autorização de rotas não é segurança real (só UX) — gap conhecido.

### NgModules tradicionais

- ✅ Mecanismo maduro e conhecido.
- ❌ Boilerplate alto (declarations/imports/exports por módulo).
- ❌ Migração futura para standalone seria retrabalho.
- ❌ Sem vantagem real sobre standalone no Angular 18.

### Framework alternativo (React/Next.js)

- ✅ Ecossistema grande; SSR disponível.
- ❌ Reescrita completa do frontend (31 módulos).
- ❌ Time já consolidado em Angular + Material; custo de troca alto sem ganho claro para CRM interno.

## Links

- Código: `frontend/src/app/app.routes.ts`, `features/<nome>/<nome>.routes.ts`, `core/services/base.service.ts`, `shared/list-page/`, `shell/shell.component.ts`, `core/guards/`
- Documentação: `docs/06-frontend.md`, `docs/09-guia-de-desenvolvimento.md`
- Gap conhecido: `docs/10-pontos-de-atencao.md` (autorização por papel não aplicada na API)