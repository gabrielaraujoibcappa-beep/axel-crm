# Documentação — Axel CRM

Documentação do Axel CRM: plataforma multi-tenant de gestão comercial, operacional e financeira, composta por uma SPA Angular e uma API REST Spring Boot sobre PostgreSQL.

A documentação está dividida em dois conjuntos:

- **Documentação técnica** (esta pasta) — para quem desenvolve, integra ou opera a infraestrutura
- **[Manual do usuário](manual-do-usuario/README.md)** — para quem usa o sistema no dia a dia, sem pré-requisito técnico

## Índice técnico

| Documento | Conteúdo |
| --- | --- |
| [**DOCUMENTAÇÃO COMPLETA**](DOCUMENTACAO_COMPLETA.md) | **Documento único consolidado — todos os capítulos abaixo em um só arquivo** |
| [01 — Visão geral](01-visao-geral.md) | O que é o produto, usuários, escopo funcional e stack |
| [02 — Arquitetura](02-arquitetura.md) | Camadas, fluxo de requisição, padrões de código |
| [03 — Segurança e multi-tenancy](03-seguranca-multitenancy.md) | JWT, papéis, isolamento por organização, LGPD |
| [04 — Modelo de dados](04-modelo-de-dados.md) | Tabelas, entidades, enums, views analíticas |
| [05 — API REST](05-api-rest.md) | Convenções, endpoints por módulo, erros, paginação |
| [06 — Frontend](06-frontend.md) | Rotas, shell, componentes compartilhados, serviços |
| [07 — Regras de negócio](07-regras-de-negocio.md) | Pipeline de negócios, scoring, conversões, propostas |
| [08 — Ambiente e deploy](08-ambiente-e-deploy.md) | Execução local, variáveis, migrations, Render |
| [09 — Guia de desenvolvimento](09-guia-de-desenvolvimento.md) | Como adicionar um módulo, testes, convenções |
| [10 — Pontos de atenção](10-pontos-de-atencao.md) | Riscos conhecidos e pendências verificadas no código |
| [Onboarding](onboarding.md) | Guia rápido de onboarding: stack, arquitetura, convenções e onde procurar |
| [ADRs](adr/README.md) | Decisões de arquitetura e seu racional (formato MADR) |

## Versões em PDF

| PDF | Conteúdo | Páginas |
| --- | --- | --- |
| [`axel-crm-documentacao.pdf`](axel-crm-documentacao.pdf) | Documentação técnica completa (10 capítulos) | 42 |
| [`axel-crm-documentacao-completa.pdf`](axel-crm-documentacao-completa.pdf) | **Documentação completa consolidada** — 12 capítulos + onboarding + anexos (gerado de `DOCUMENTACAO_COMPLETA.md`) | ~65 |
| [`axel-crm-manual-do-usuario.pdf`](axel-crm-manual-do-usuario.pdf) | Manual do usuário completo | 31 |

Ambos têm capa e sumário navegável. Para regerar depois de editar os capítulos (requer Node.js, Pandoc e Google Chrome):

```powershell
powershell -File docs\pdf\gerar-pdf.ps1               # gera os dois
powershell -File docs\pdf\gerar-pdf.ps1 -Only manual  # apenas o manual
```

O script concatena os capítulos de cada conjunto, converte os links entre documentos em âncoras internas e renderiza via Chrome headless. Os arquivos de apoio ficam em [`pdf/`](pdf/).

## Documentos relacionados

- [`../README.md`](../README.md) — instruções rápidas de execução e deploy
- [`../PRODUCT.md`](../PRODUCT.md) — definição de produto, posicionamento e princípios
- [`../DESIGN.md`](../DESIGN.md) — design system (tokens de cor, tipografia, componentes)
- Swagger UI — `http://localhost:8080/swagger-ui.html` com a API em execução

## Como manter esta documentação

Esta documentação descreve o comportamento **verificado no código**. Ao alterar contratos de API, o modelo de dados ou regras de negócio, atualize o documento correspondente no mesmo commit. Se algo estiver incompleto ou mockado, registre em [Pontos de atenção](10-pontos-de-atencao.md) em vez de descrever a intenção como se estivesse pronta.
