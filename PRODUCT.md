# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are internal mixed teams operating the business day to day: sales, finance, and operations roles sharing one authenticated workspace. Situations are desktop-first, full-screen, recurring daily use — not one-off marketing visits.

Secondary surfaces (confirmed in code, not primary operators of the shell):

- Clients and partners via portal routes (`/portal/client`, `/portal/partner`)
- Proposal recipients via public token links (`/public/proposals/:token`)

Roles in the system include SUPER_ADMIN, ADMIN, MANAGER, SALES, SUPPORT, USER, and VIEWER. Admin-only areas cover users and integrations.

## Product Purpose

Axel CRM is a multi-tenant business management platform that unifies commercial pipeline work, delivery operations, and financial control in a single authenticated SPA.

Success means an internal operator can move from prospect or lead through deal, proposal, contract, project work, billing, and reporting without leaving the product for another system of record for those flows.

## Positioning

One multi-tenant product that combines CRM (prospects → leads → deals → pipelines), operations (projects, tasks, proposals, contracts, legal processes, tickets, documents, campaigns), and finance (invoices, transactions, chart of accounts, bank accounts, time entries, commissions, reports) under organization-scoped isolation — rather than a sales-only CRM or a finance-only back office.

## Operating Context

- Authenticated shell with sectioned navigation: CRM, Operações, Financeiro, Admin
- Shared list/dialog patterns for most CRUD modules (table list, form dialog, row actions)
- Dashboard KPIs, financial trend charts, lead funnel, recent tasks and commissions
- Global time tracking in the shell; notifications with polling
- JWT auth; register/login outside the shell
- Brazilian locale in the UI: Portuguese (pt-BR), BRL currency formatting, dd/mm/yyyy dates
- Local stack for development: Angular SPA + Spring Boot API + PostgreSQL; deploy blueprint for Render

## Capabilities and Constraints

**Confirmed capabilities (implemented or present as product surface):**

- Multi-tenant data isolation by organization
- JWT authentication and role-based access (including admin guards)
- CRM: prospects, partners, clients, contacts, leads, deals, pipelines
- Operations: projects, products, contracts, legal processes, tasks, proposals (incl. public view), campaigns, tickets, documents, calendar
- Finance: invoices, transactions, chart of accounts, bank accounts, time entries, commissions, reports
- Client and partner portals; LGPD-related API surface
- Dashboard analytics and notifications

**Constraints and open product facts:**

- Official product name is **Axel CRM**. The shell currently labels the product “IBCAPPA CRM” with a gavel icon; treat that as a UI placeholder/legacy, not the brand commitment.
- UI language and business formatting are pt-BR / BRL; LGPD obligations are in scope for privacy-related work.
- Email integration and some README checklist items may still be incomplete relative to marketing claims; do not invent shipping status.
- Pricing, customer logos, case studies, and third-party endorsements are **undecided / not on hand** — future work must not fabricate them.

## Brand Commitments

- **Name:** Axel CRM (repo, API title, and product identity). Do not rebrand to IBCAPPA without an explicit decision.
- **Voice:** Portuguese brasileiro, direct and professional business terminology. Action verbs such as Cadastrar, Editar, Visualizar, Excluir. Errors neutral and informative (not cutesy). Confirmations explicit when destructive.
- **Personality (product, not visual recipe):** confident and professional; prioritize trust, predictable actions, and clear navigation over novelty.
- **Assets:** no confirmed logo pack or marketing brand book in-repo beyond the SPA shell and favicon; do not invent corporate claims or external brand marks.

## Evidence on Hand

- Runnable full-stack codebase (`frontend/` Angular 18 + Material; `backend/` Spring Boot + PostgreSQL + Flyway)
- Seed/demo data and sample organizations in backend bootstrap (synthetic — not real customer proof)
- `frontend/PRODUCT.md` and `frontend/DESIGN.md` (legacy combined product/design notes; design tokens live there — not re-documented here)
- README deploy/feature list; OpenAPI/Swagger for the API
- **Absence:** no real testimonials, press, production metrics, or licensed brand assets for marketing claims. Do not invent them.

## Product Principles

1. **One system of work** — commercial, operational, and financial records belong in the same tenant workspace.
2. **Operator clarity** — every screen should answer “what is the number / what is the next action?” for daily internal use.
3. **Consistency over novelty** — shared list, form, and shell patterns reduce training cost across 20+ modules.
4. **Trust and compliance** — accurate multi-tenant isolation, honest empty/error states, and LGPD-aware handling of personal data.
5. **Brazilian business reality** — pt-BR copy, BRL and local date formats, and workflows that match local ops language.

## Accessibility & Inclusion

No product-specific WCAG target was confirmed in this init. Default expectation for future UI work: keyboard-usable Material patterns already used in the shell (menus, dialogs, sidenav), clear labels, and non-color-only status where metrics use semantic colors. Raise the formal standard only when the user sets one.
