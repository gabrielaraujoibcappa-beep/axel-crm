# 06 — Frontend

SPA Angular 18 com componentes standalone, Angular Material 18 e Chart.js. Todo o conteúdo é lazy-loaded por módulo.

## Estrutura de rotas

```
/login                         público
/register                      público
/public/proposals/:token       público — proposta enviada ao cliente
/portal/**                     portais de cliente e parceiro
/                              ShellComponent — protegido por authGuard
  ├── dashboard                (rota padrão)
  ├── profile
  ├── 28 módulos de negócio
  ├── users                    + adminGuard
  └── integrations             + adminGuard
**                             redireciona para /
```

## Shell

`ShellComponent` é o layout do workspace autenticado: sidebar recolhível, toolbar com breadcrumbs, notificações com polling, alternância de tema claro/escuro, menu do usuário e cronômetro global (`TimerComponent`) para apontamento de horas.

A navegação é agrupada em quatro seções:

| Seção | Itens |
| --- | --- |
| **(topo)** | Dashboard |
| **CRM** | Prospecção, Agenda, Parceiros / Indicadores, Clientes, Contatos, Leads, Negócios, Pipelines |
| **Operações** | Projetos, Produtos, Contratos, Processos, Tarefas, Propostas, Campanhas, Tickets, Documentos |
| **Financeiro** | Faturamento, Transações, Plano de Contas, Relatórios, Contas Bancárias, Horas, Comissões |
| **Admin** | Usuários, Integrações |

O shell também traz um tour de onboarding com passos guiados (boas-vindas, menu de módulos, notificações, tema, menu do usuário).

> O rótulo do produto no shell é "IBCAPPA CRM"; o nome oficial é **Axel CRM** (ver `PRODUCT.md`).

## Componentes compartilhados

### `ListPageComponent`

Base de praticamente todas as telas de listagem. Recebe dados via `@Input` e emite intenções via `@Output` — não conhece nenhum módulo específico.

| Entrada | Função |
| --- | --- |
| `title` | Título da página |
| `columns` | `ColumnDef[]` — `{ key, label }` |
| `data` | Linhas da página atual |
| `totalElements`, `pageSize` | Paginação server-side |
| `loading`, `error` | Estados de carregamento e falha |
| `emptyMessage`, `emptyIcon`, `emptyActionLabel` | Estado vazio |
| `kpis` | `KpiDef[]` — `{ label, value, icon, color }` |

| Saída | Disparo |
| --- | --- |
| `pageChange`, `sortChange` | Paginação e ordenação |
| `add`, `edit`, `remove`, `view` | Ações de linha e da página |
| `retry` | Nova tentativa após erro |

A coluna `actions` é anexada automaticamente ao fim das colunas declaradas.

### `FormDialogComponent`

Diálogo genérico de formulário usado para criar e editar registros, dirigido por configuração de campos.

### `TimelineComponent`

Renderiza a linha do tempo de leads e clientes, alimentada por `TimelineService`.

## Camada core

| Arquivo | Função |
| --- | --- |
| `core/guards/auth.guard.ts` | Exige token; redireciona para `/login` |
| `core/guards/admin.guard.ts` | Exige papel `ADMIN` ou `SUPER_ADMIN`; redireciona para `/dashboard` |
| `core/interceptors/auth.interceptor.ts` | Injeta o Bearer token; em 401 faz logout |
| `core/interceptors/tenant.interceptor.ts` | Injeta o header `X-Tenant-Id` |
| `core/services/auth.service.ts` | Login, registro, logout, usuário corrente (`BehaviorSubject`) |
| `core/services/base.service.ts` | CRUD HTTP genérico sobre `environment.apiUrl` |
| `core/services/client-detail.service.ts` | Agregação da tela de detalhe do cliente |
| `core/services/lead-detail.service.ts` | Agregação da tela de detalhe do lead |
| `core/services/timeline.service.ts` | Timeline de leads e clientes |
| `core/models/models.ts` | Interfaces compartilhadas (`Page<T>`, `User`, DTOs) |

### `BaseService<T>`

```ts
getPage(path, page = 0, size = 10, sort = 'id,asc'): Observable<Page<T>>
getById(path, id): Observable<T>
create(path, body): Observable<T>
update(path, id, body): Observable<T>
delete(path, id): Observable<void>
```

Serviços de módulo estendem essa classe e fixam o path do recurso, o que mantém as chamadas HTTP em um único ponto.

## Telas com layout próprio

A maioria dos módulos usa o par lista + diálogo. Estas fogem do padrão:

| Tela | Particularidade |
| --- | --- |
| `dashboard` | KPIs, gráficos Chart.js, funil de leads, tarefas e comissões recentes |
| `clients/client-detail` | Abas com notas, anexos, contatos e timeline |
| `leads/lead-detail` | Detalhe com score, timeline e comunicações |
| `projects/project-detail` | Detalhe com dados de entrega e financeiro |
| `proposals/public-proposal` | Visualização pública por token, fora do shell |
| `portal/client-portal`, `portal/partner-portal` | Portais externos |
| `reports` | Relatórios DRE e DFC |
| `integrations` | Configuração de integrações (área admin) |
| `profile` | Perfil do usuário |

## Configuração de ambiente

`src/environments/environment.ts` (produção) e `environment.development.ts` (local) expõem `apiUrl`. No deploy do Render, o build substitui o placeholder `__API_URL__` pelo valor da variável `API_URL` antes de compilar.

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

## Design system

Tokens de cor, tipografia, raios e espaçamentos estão em [`../DESIGN.md`](../DESIGN.md). Em resumo: tema escuro por padrão (`:root`), tema claro em `[data-theme="light"]`, laranja `#FC6E20` como única cor de ação da marca, tipografia Outfit (estrutura) + Inter (dados), Material Icons Round.
