# ADR-002: Autenticação stateless com JWT e BCrypt

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: autenticação, segurança, JWT

## Contexto e Problema

O produto é uma SPA Angular consumindo uma API REST, com login e registro próprios (sem provedor OAuth externo). A autenticação precisava ser stateless para escalar sem sessão compartilhada — o deploy é um único container no free tier do Render, e manter sessões em memória (ou um session store) adicionaria estado e pontos de falha. As credenciais precisavam ser armazenadas com hash seguro, e a API exposta em `/api/v1/**`.

## Drivers de Decisão

- API stateless: qualquer instância deve autenticar qualquer request, sem estado compartilhado.
- SPA não pode gerenciar cookies de sessão server-side com segurança simples.
- Senhas armazenadas com hash robusto (BCrypt).
- Caminhos públicos bem definidos (auth, propostas públicas, webhooks, Swagger, health).

## Opções Consideradas

- **JWT stateless (Auth0 java-jwt) + BCrypt para senhas**
- Sessões HTTP tradicionais (JSESSIONID) com armazenamento em memória/DB
- OAuth2/OIDC delegado a provedor externo (Google, Auth0, Keycloak)

## Resultado da Decisão

Opção escolhida: **"JWT stateless (Auth0 java-jwt) + BCrypt"**, porque elimina estado de sessão, funciona naturalmente com SPA + REST e se integra ao `SecurityFilterChain` com `SessionCreationPolicy.STATELESS`. O `JwtAuthenticationFilter` valida o token e popula o `SecurityContext`; o `TenantFilter` roda logo depois para resolver o tenant (ver ADR-001). Senhas usam `BCryptPasswordEncoder`. Tokens têm expiração configurável (`jwt.expiration`, 86.400.000 ms = 24h) e assinatura via `jwt.secret`.

### Consequências Positivas

- Autenticação sem estado — escala horizontalmente sem sessão compartilhada.
- Caminhos públicos declarados em `PUBLIC_PATHS` no `SecurityConfig` (`/api/v1/auth/**`, `/api/v1/proposals/public/**`, webhooks, Swagger, actuator health).
- Sem infraestrutura extra de sessão (Redis, cookie store).

### Consequências Negativas

- **Revogação de token é difícil**: um JWT válido continua válido até expirar — mitigação depende de expiração curta.
- `JWT_SECRET` é um segredo crítico: no Render ele é configurado manualmente (`sync: false` no `render.yaml`), e o `application.yml` traz um secret de desenvolvimento hardcoded — risco se vazar para produção.
- Sem refresh token implementado (não verificado no código) — o SPA precisa reautenticar após 24h.

## Prós e Contras das Opções

### JWT stateless + BCrypt ✅ Escolhida

- ✅ Stateless, simples, sem infraestrutura de sessão.
- ✅ Padrão bem estabelecido para SPA + REST.
- ✅ BCrypt é o hash de senha recomendado.
- ❌ Revogação/token blacklist não triviais.
- ❌ Gestão segura do secret é responsabilidade operacional.

### Sessões HTTP (JSESSIONID)

- ✅ Revogação imediata (derrubar a sessão).
- ❌ Exige armazenamento de sessão (memória quebra com múltiplas instâncias; DB adiciona latência).
- ❌ Mais complexo para SPA consumir via API (cookies + CSRF).
- ❌ Estado = mais pontos de falha no free tier.

### OAuth2/OIDC externo

- ✅ Não armazena credenciais próprias; delega a provedor maduro.
- ❌ Adiciona dependência externa e fluxo de login mais complexo.
- ❌ Provedor gerenciado custa dinheiro; self-hosted (Keycloak) pesa demais para o deploy atual.
- ❌ Não atendia à necessidade de login/registro simples e integrado ao produto.

## Links

- Código: `backend/src/main/java/com/axelcrm/auth/security/SecurityConfig.java`, `JwtAuthenticationFilter.java`, `auth/service/AuthService.java`
- Config: `application.yml` (`jwt.secret`, `jwt.expiration`)
- Documentação: `docs/03-seguranca-multitenancy.md`
- Relacionado: [ADR-001: Multi-tenancy por schema compartilhado](001-multi-tenancy-schema-compartilhado.md)
