# 03 — Segurança e multi-tenancy

## Autenticação

A API é **stateless** (`SessionCreationPolicy.STATELESS`), sem sessão HTTP e com CSRF desabilitado — coerente com autenticação por token em SPA.

### Token JWT

Gerado por `JwtUtil` com algoritmo **HMAC256**. Claims:

| Claim | Conteúdo |
| --- | --- |
| `userId` | UUID do usuário |
| `email` | E-mail do usuário |
| `role` | Nome do papel (`ADMIN`, `SALES`, …) |
| `organizationId` | UUID da organização (tenant) |
| `iat` / `exp` | Emissão e expiração |

Validade padrão: **86.400.000 ms (24 h)**, configurável por `JWT_EXPIRATION`.

### Registro e login

`POST /api/v1/auth/register` cria **uma nova organização** e o primeiro usuário dela com papel `ADMIN`. Não existe fluxo de convite de usuário para organização existente via `/auth/register`; usuários adicionais são criados pelo módulo administrativo `/api/v1/users`.

`POST /api/v1/auth/login` valida e-mail e senha (BCrypt), recusa usuário inativo e devolve o token junto dos dados de sessão.

Ambos respondem com `LoginResponse`: `token`, `userId`, `userName`, `email`, `role`, `organizationId`, `organizationName`.

Senhas são gravadas com `BCryptPasswordEncoder`.

## Rotas públicas

Declaradas em `SecurityConfig.PUBLIC_PATHS`:

```
/                            /api/v1/auth/**
/api/v1/proposals/public/**  /swagger-ui/**   /swagger-ui.html
/v3/api-docs   /v3/api-docs/**
/actuator/health   /actuator/info   /error
```

`/error` é público de propósito: sem essa liberação, erros do servidor eram mascarados como falha de CORS na SPA.

Todas as demais rotas exigem token válido (`anyRequest().authenticated()`).

## Isolamento multi-tenant

O isolamento é **em nível de aplicação**, não de banco (não há Row Level Security nem schema por tenant). A garantia depende de três mecanismos combinados:

1. **`TenantContext`** — `ThreadLocal<UUID>` populado pelo `TenantFilter` a partir do claim do JWT e limpo ao fim da requisição.
2. **Passagem explícita** — o `organizationId` é passado do controller ao service e do service ao repositório em toda operação de leitura e escrita.
3. **Consultas filtradas** — os métodos de repositório carregam o filtro no nome, por exemplo:
   ```java
   findByIdAndOrganization_IdAndDeletedAtIsNull(UUID id, UUID organizationId)
   ```

Além disso, `BaseEntity.prePersist()` atribui a organização a partir do `TenantContext` quando a entidade é persistida sem organização explícita, evitando registros órfãos.

> **Consequência prática:** um repositório novo que exponha um `findById` sem o filtro de organização abre um vazamento entre tenants. Toda consulta nova precisa do filtro por `organization_id`.

## Autorização por papel

O enum `Role` tem sete valores: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SALES`, `SUPPORT`, `USER`, `VIEWER`. O papel entra no token como authority do Spring Security.

No **frontend**, `adminGuard` bloqueia `/users` e `/integrations` para quem não é `ADMIN` ou `SUPER_ADMIN`, redirecionando ao dashboard.

No **backend**, não há `@PreAuthorize` nem `hasRole` em nenhum controller: qualquer usuário autenticado da organização pode chamar qualquer endpoint privado dela. Guard de frontend não é controle de acesso — está registrado em [Pontos de atenção](10-pontos-de-atencao.md).

## CORS

`CorsConfig` permite qualquer origem (`allowedOriginPatterns: *`), os métodos `GET, POST, PUT, DELETE, PATCH, OPTIONS`, qualquer header, com `allowCredentials: true` e cache de preflight de 1 h. Expõe `Authorization` e `X-Tenant-Id`.

## Armazenamento de sessão no cliente

`AuthService` grava em `localStorage`:

| Chave | Conteúdo |
| --- | --- |
| `crm_token` | JWT |
| `crm_user` | JSON com id, nome, e-mail, papel e organização |
| `crm_tenant` | `organizationId` |

O logout remove as três chaves e redireciona para `/login`. Não há refresh token: expirado o JWT, a próxima chamada retorna 401 e o `authInterceptor` força novo login.

## LGPD

`LgpdService` e `LgpdController` (`/api/v1/lgpd`) cobrem três obrigações:

| Endpoint | Função |
| --- | --- |
| `POST /consent` | Registra ou atualiza consentimento por e-mail e tipo (tabela `lgpd_consents`) |
| `GET /export` | Portabilidade: exporta os dados pessoais de um titular (leads, clientes, contatos, consentimentos) |
| `DELETE /forget` | Direito ao esquecimento: exclusão / anonimização dos dados do titular |

O consentimento é único por combinação de e-mail + tipo dentro da organização: um novo registro do mesmo par atualiza o existente.

## Trilha de auditoria

`AuditLogService` grava em `audit_logs` a organização, o usuário, a ação, a entidade afetada, o valor anterior e o novo. É acionado em operações sensíveis do domínio comercial — transição de estágio (`STAGE_TRANSITION`), perda (`DEAL_LOST`), reabertura (`DEAL_REOPENED`) e conversão de lead (`CONVERT`). A leitura é exposta em `/api/v1/audit-logs`.
