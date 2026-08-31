# 08 — Ambiente e deploy

## Pré-requisitos

| Ferramenta | Versão |
| --- | --- |
| Java (JDK) | 21 |
| Node.js | 20+ |
| PostgreSQL | 16+ |
| Maven | 3.9+ instalado — o repositório **não** traz o wrapper `mvnw` |

## Execução local

### Banco

```bash
createdb axelcrm
```

O `application.yml` aponta para `jdbc:postgresql://localhost:5432/axelcrm` com usuário `postgres`. Ajuste a senha ou sobrescreva via variável de ambiente conforme seu ambiente local.

### Backend

```bash
cd backend
mvn spring-boot:run
```

API em `http://localhost:8080`. O Flyway aplica as migrations na inicialização; não é necessário criar tabelas manualmente.

Para logs SQL e de segurança mais verbosos, use o perfil `dev`:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend

```bash
cd frontend
npm install
npm start        # equivale a ng serve
```

App em `http://localhost:4200`, apontando para a API conforme `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

### Primeiro acesso

Acesse `/register` e crie a primeira conta. O registro cria a organização e o usuário `ADMIN` dela.

## Documentação da API em execução

| Recurso | URL local |
| --- | --- |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| Health check | `http://localhost:8080/actuator/health` |

## Perfis de configuração

| Arquivo | Uso |
| --- | --- |
| `application.yml` | Padrão local: PostgreSQL em localhost, JWT com segredo de desenvolvimento, logs de segurança e web em `DEBUG` |
| `application-dev.yml` | Acrescenta `show-sql`, SQL formatado e log `DEBUG` de `com.axelcrm` |
| `application-render.yml` | Produção no Render: conexão e segredo via variáveis de ambiente, logs em `INFO` |

Configurações fixas em todos os perfis: `spring.jpa.hibernate.ddl-auto: none` e Flyway habilitado com `baseline-on-migrate: true`.

## Variáveis de ambiente

### Backend

| Variável | Perfil | Descrição |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | todos | Perfil ativo (`render` em produção) |
| `PORT` | render | Porta HTTP (padrão 8080) |
| `DB_HOST` | render | Host do PostgreSQL |
| `DB_PORT` | render | Porta do PostgreSQL |
| `DB_NAME` | render | Nome do banco |
| `DB_USER` | render | Usuário |
| `DB_PASSWORD` | render | Senha |
| `JWT_SECRET` | render | Segredo de assinatura HMAC256 — **obrigatório**, definido manualmente |
| `JWT_EXPIRATION` | render | Validade do token em ms (padrão `86400000`) |
| `google.client-id` / `google.client-secret` / `google.redirect-uri` | opcional | OAuth2 do Google (`GoogleIntegrationService`) |

> O `application.yml` traz um `jwt.secret` de desenvolvimento embutido no repositório. Ele nunca deve ser usado em produção — em produção, `JWT_SECRET` é obrigatório e não tem valor padrão.

### Frontend

| Variável | Descrição |
| --- | --- |
| `API_URL` | URL base da API; substitui o placeholder `__API_URL__` durante o build |

## Migrations

Local: `backend/src/main/resources/db/migration/`.

**Nomenclatura.** `V<n>__descricao_em_snake_case.sql` para migrations versionadas; `R__nome.sql` para repetíveis.

**Execução.** Além do Flyway automático do Spring Boot, `FlywayMigrationConfig` implementa `CommandLineRunner` e executa `flyway.repair()` seguido de `flyway.migrate()` na subida da aplicação. O `repair()` corrige checksums divergentes no histórico — o que também significa que alterações em migrations já aplicadas passam despercebidas em vez de falhar. Nunca edite uma migration já aplicada; crie uma nova.

**Ao criar uma migration:**

1. Use o próximo número de versão livre — duas migrations com a mesma versão impedem a aplicação de subir. A última versão em uso é a `V28`.
2. Inclua `organization_id UUID NOT NULL` com FK para `organizations` em toda tabela de negócio.
3. Inclua `created_at`, `updated_at` e `deleted_at`.
4. Crie índice em `organization_id` — todas as consultas filtram por ele.

## Deploy no Render

O `render.yaml` na raiz é um Blueprint que provisiona três recursos:

| Recurso | Nome | Tipo |
| --- | --- | --- |
| Banco | `axel-crm-db` | PostgreSQL (plano free) |
| API | `axel-crm-api` | Web service Docker, `rootDir: backend` |
| SPA | `axel-crm-app` | Static site, `rootDir: frontend` |

As credenciais do banco são injetadas automaticamente no serviço da API via `fromDatabase`. **`JWT_SECRET` está marcado como `sync: false`** e precisa ser preenchido manualmente no painel do Render — sem ele a aplicação não sobe.

O build do frontend é:

```bash
npm ci && sed -i "s|__API_URL__|$API_URL|g" src/environments/environment.ts \
  && npm run build -- --configuration production
```

O diretório publicado é `dist/crm-axel-frontend/browser`, com rewrite de `/*` para `/index.html` (necessário para o roteamento client-side do Angular).

### URLs esperadas

| Serviço | URL |
| --- | --- |
| API | `https://axel-crm-api.onrender.com` |
| Swagger UI | `https://axel-crm-api.onrender.com/swagger-ui.html` |
| Frontend | `https://axel-crm-app.onrender.com` |

### Imagem Docker do backend

`backend/Dockerfile` usa build multi-stage: `maven:3.9-eclipse-temurin-21` compila o JAR com testes desativados (`-DskipTests`), e `eclipse-temurin:21-jre` executa apenas o artefato final, expondo a porta 8080.
