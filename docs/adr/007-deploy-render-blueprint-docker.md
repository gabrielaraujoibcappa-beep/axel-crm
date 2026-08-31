# ADR-007: Deploy via Render Blueprint com Docker

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: deploy, infraestrutura, docker

## Contexto e Problema

O projeto precisava de deploy com custo zero e manutenção mínima para um time pequeno, com três componentes: API Spring Boot, SPA Angular e PostgreSQL. Gerenciar servidores (VPS, EC2) ou múltiplos provedores adicionaria carga operacional incompatível com o estágio do produto. A infraestrutura deveria ser declarada como código e reproduzível com um clique.

## Drivers de Decisão

- Custo zero (free tier) e operação mínima.
- Infraestrutura declarada como código (reproduzível).
- Três componentes (API, SPA, PostgreSQL) provisionados juntos.
- Segredos (JWT_SECRET) fora do repositório.

## Opções Consideradas

- **Render Blueprint (`render.yaml`) + Docker** (PostgreSQL + Web Service + Static Site)
- Cloud tradicional (AWS EC2/RDS, GCP) com Docker Compose
- Vercel/Netlify para o frontend + provedor separado para API/DB

## Resultado da Decisão

Opção escolhida: **"Render Blueprint + Docker"**, porque o `render.yaml` provisiona os três serviços de uma vez (PostgreSQL free, Web Service `axel-crm-api` via Dockerfile, Static Site `axel-crm-app`), com o frontend substituindo `__API_URL__` pelo endereço real da API no build (`sed` no `render.yaml`). O `JWT_SECRET` é configurado manualmente no dashboard (`sync: false`) — nunca versionado. O perfil `application-render.yml` lê `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` do ambiente.

### Consequências Positivas

- Deploy com um clique (botão "Deploy to Render" no README).
- Infra como código: `render.yaml` + `Dockerfile` versionados.
- Custo zero no free tier; sem administração de servidor.

### Consequências Negativas

- **Lock-in de plataforma**: migrar para outro provedor exige reescrever o blueprint.
- Free tier do Render: cold starts, limites de recursos e de uptime.
- `JWT_SECRET` manual (`sync: false`) é passo operacional que pode ser esquecido.
- Sem CI/CD pipeline (`.github/workflows/` vazio) — deploy depende de push + rebuild manual.

## Prós e Contras das Opções

### Render Blueprint + Docker ✅ Escolhida

- ✅ Provisionamento declarado e reproduzível; custo zero.
- ✅ Dockerfile único para a API; SPA servida como static site.
- ❌ Lock-in; cold starts; sem CI automatizado.

### Cloud tradicional (AWS/GCP + Docker Compose)

- ✅ Controle total; sem lock-in de PaaS.
- ❌ Custo e complexidade operacional altos para o estágio atual.
- ❌ Provisionamento manual ou via IaC (Terraform) que o time não mantém hoje.

### Vercel/Netlify + provedor separado

- ✅ Frontend com CDN e deploys simples.
- ❌ API e banco continuariam precisando de outro provedor — dois pontos de operação.
- ❌ Sem ganho real sobre o Blueprint único do Render.

## Links

- Código: `render.yaml`, `backend/Dockerfile`, `backend/src/main/resources/application-render.yml`
- Documentação: `docs/08-ambiente-e-deploy.md`, `README.md` (seção Deploy)
- Relacionado: [ADR-005: Flyway para migrations](005-flyway-migrations-ddl-auto-none.md) (migrations rodam no boot do container)