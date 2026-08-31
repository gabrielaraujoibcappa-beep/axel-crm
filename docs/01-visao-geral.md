# 01 — Visão geral

## O que é o Axel CRM

O Axel CRM é uma plataforma multi-tenant que reúne, num único workspace autenticado, três domínios que normalmente ficam em sistemas separados:

- **Comercial** — prospecção, parceiros, clientes, contatos, leads, negócios e pipelines
- **Operacional** — projetos, produtos, contratos, processos jurídicos, tarefas, propostas, campanhas, tickets, documentos e agenda
- **Financeiro** — faturamento, transações, plano de contas, contas bancárias, apontamento de horas, comissões e relatórios

O objetivo é permitir que um operador percorra o ciclo completo — prospect → lead → negócio → proposta → contrato → projeto → faturamento → relatório — sem trocar de sistema.

## Usuários

**Operadores internos (uso primário).** Times mistos de vendas, operações e financeiro compartilhando a mesma organização. Uso desktop-first, diário e prolongado.

**Superfícies secundárias:**

| Superfície | Rota | Autenticação |
| --- | --- | --- |
| Portal do cliente | `/portal/client` | Sessão do portal |
| Portal do parceiro | `/portal/partner` | Sessão do portal |
| Proposta pública | `/public/proposals/:token` | Token UUID na URL, sem login |

## Papéis

O enum `Role` define sete papéis: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SALES`, `SUPPORT`, `USER` e `VIEWER`.

Hoje o controle efetivo de acesso por papel acontece no frontend, através do `adminGuard`, que restringe as áreas **Usuários** (`/users`) e **Integrações** (`/integrations`) a `ADMIN` e `SUPER_ADMIN`. A API autentica todas as rotas privadas, mas não aplica autorização por papel — veja [Pontos de atenção](10-pontos-de-atencao.md).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | Angular 18 (standalone components), Angular Material 18, Chart.js 4, RxJS 7 |
| Backend | Spring Boot 4.0.7, Spring Security, Spring Data JPA, Lombok |
| Banco | PostgreSQL, migrations via Flyway |
| Autenticação | JWT assinado com HMAC256 (biblioteca Auth0 `java-jwt`) |
| PDF | OpenPDF (propostas e faturas) |
| Documentação de API | SpringDoc OpenAPI / Swagger UI |
| Runtime | Java 21, Node.js 20+ |
| Deploy | Render (Blueprint `render.yaml`), backend em Docker |

## Números do sistema

| Item | Quantidade |
| --- | --- |
| Controllers REST | 43 |
| Services de domínio | 42 |
| Entidades JPA | 38 |
| Migrations Flyway | 28 versionadas + 1 repetível (seed) |
| Tabelas | 38 |
| Views analíticas | 6 |
| Módulos de frontend (rotas) | 30 |

## Idioma e formatação

A interface é integralmente pt-BR: moeda em BRL, datas em `dd/mm/aaaa` e terminologia de negócio brasileira. Mensagens de erro da API misturam português e inglês conforme o ponto do código — as validações de regra de negócio (`BadRequestException`) estão em português.
