# 10 — Pontos de atenção

Itens verificados diretamente no código em 07/08/2026. Não são especulações: cada um aponta o arquivo onde o comportamento está. A ordem é por severidade.

**Resolvido desde a primeira versão deste documento:** a duplicidade de versão entre `V26__create_google_tokens.sql` e `V26__proposals_link_and_deal_stage_history.sql`, que impedia o Flyway de subir. O primeiro passou a ser `V27`. Ao provisionar um ambiente que já tinha a versão antiga aplicada, confira `flyway_schema_history` antes.

## Crítico

### A API não aplica autorização por papel

Nenhum controller usa `@PreAuthorize`, `@Secured` ou regras por papel no `SecurityConfig` — a única condição é `anyRequest().authenticated()`. O papel entra no token como authority, mas nada o consome no backend.

O `adminGuard` do frontend esconde `/users` e `/integrations` de não-administradores, mas isso é apenas navegação: qualquer usuário autenticado pode chamar `POST /api/v1/users` ou os endpoints de integração diretamente e criar contas, alterar papéis ou alterar configurações.

**Correção:** aplicar `@PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")` nos controllers administrativos e habilitar `@EnableMethodSecurity`.

### Segredo JWT de desenvolvimento versionado

`application.yml` traz `jwt.secret` embutido no repositório. Ele é o padrão do perfil local; o perfil `render` exige `JWT_SECRET` por variável de ambiente. Ainda assim, um deploy que suba sem o perfil `render` ativo usaria um segredo público, permitindo forjar tokens de qualquer organização.

**Correção:** remover o valor padrão e falhar na inicialização quando `JWT_SECRET` não estiver definido.

## Alto

### `JWT_EXPIRATION` não tem efeito

`JwtUtil` injeta `@Value("${jwt.expiration-ms:86400000}")`, mas os arquivos de configuração definem `jwt.expiration`. A propriedade lida não existe, então o valor usado é sempre o default de 24 h — inclusive no Render, onde `JWT_EXPIRATION` está declarado no `render.yaml`.

**Correção:** alinhar os nomes (`jwt.expiration` no `@Value`, ou renomear a chave nos YAMLs).

### CORS aberto com credenciais

`CorsConfig` combina `allowedOriginPatterns("*")` com `allowCredentials(true)` e `allowedHeaders("*")`. Qualquer origem pode chamar a API. Como a autenticação é por header `Authorization` (e não cookie), o risco imediato é menor, mas a configuração não deveria chegar a produção assim.

**Correção:** restringir a lista de origens à URL do frontend por perfil.

### Integrações do Google são mocks no controller

`IntegrationController` responde `/google/status`, `/google/connect`, `/google/disconnect` e `/google/calendar` com dados fixos em memória — inclusive um e-mail hard-coded (`contato@axelpro.com.br`) e uma lista estática de eventos. `/ai/generate` devolve texto pré-fabricado.

Existe um `GoogleIntegrationService` funcional, com fluxo OAuth2 completo (authorization URL, troca de código, refresh token, leitura de Calendar e Contacts, envio via Gmail) e persistência em `google_tokens` — mas **o controller não o utiliza**.

**Correção:** ligar o controller ao service e configurar `google.client-id` / `google.client-secret` / `google.redirect-uri`. O endpoint de callback do OAuth2 (`/api/v1/integrations/google/callback`, referenciado como redirect URI) também não está implementado no controller.

### Envio de campanha carrega todos os clientes do banco

`CampaignService.sendCampaign` usa `clientRepository.findAll()` e filtra a organização **em memória**, enquanto para leads usa a consulta filtrada correta. Não há vazamento de dados na resposta, mas a query traz clientes de todos os tenants para a JVM — o custo cresce com a base inteira, não com a organização.

Além disso, a campanha inclui **todos** os leads e clientes com e-mail ou telefone, sem qualquer segmentação, e o envio é simulado: os destinatários são gravados em `campaign_recipients` e a campanha é marcada como enviada, mas nenhuma mensagem sai.

**Correção:** trocar por `findByOrganization_IdAndDeletedAtIsNull` e deixar explícito na UI que o envio é simulado enquanto não houver provedor conectado.

## Médio

### Logs em DEBUG na configuração padrão

`application.yml` define `org.springframework.security` e `org.springframework.web` em `DEBUG`. É útil no desenvolvimento e ruidoso (e potencialmente revelador de detalhes de requisição) em qualquer outro lugar. O perfil `render` corrige para `INFO`.

### `open-in-view` habilitado

`spring.jpa.open-in-view: true` mantém a sessão do Hibernate aberta durante a renderização da resposta. Isso mascara `LazyInitializationException` e favorece consultas N+1 disparadas na serialização.

### `flyway.repair()` a cada inicialização

`FlywayMigrationConfig` executa `repair()` antes de `migrate()` toda vez que a aplicação sobe. Isso reescreve checksums divergentes em vez de falhar — ou seja, uma migration já aplicada que for editada passa despercebida, e os ambientes divergem silenciosamente.

### Status como string livre

`Project.status`, `Invoice.status` e `Contract.status` são `String` sem validação, enquanto domínios equivalentes (`LeadStage`, `ProposalStatus`, `TaskStatus`) usam enums. Valores são gravados como vierem do cliente, sem garantia de consistência.

### Cobertura de testes parcial

São 144 testes em 23 classes, cobrindo controllers dos fluxos principais e boa parte dos services de maior risco (`ProposalService`, `PipelineEngine`, `AnalyticsService`, `DealService`, `ProjectService`). Seguem sem cobertura `LeadScoringService`, `CommissionService`, `LgpdService` e `CampaignService` — todos com regra de negócio relevante. O build Docker roda com `-DskipTests`.

### Exceções fora do padrão do handler

`ProspectService.promoteToLead` e `CampaignService.sendCampaign` lançam `IllegalStateException`, que não é tratada pelo `GlobalExceptionHandler` e vira `500 Internal Server Error` em vez de `400` com mensagem legível. As demais regras usam `BadRequestException` corretamente.

## Baixo

### Marca inconsistente na interface

O nome oficial do produto é **Axel CRM** (repositório, título da API, `PRODUCT.md`), mas o shell exibe "IBCAPPA CRM". `PRODUCT.md` classifica o rótulo como placeholder legado. Alinhar antes de qualquer material voltado a usuário.

### Header `X-Tenant-Id` sem uso

O `tenantInterceptor` envia `X-Tenant-Id` em toda requisição, e o `CorsConfig` o expõe, mas o backend nunca o lê — o tenant vem exclusivamente do claim do JWT. O header é inofensivo, porém sugere um mecanismo de isolamento que não existe. Removê-lo evita que alguém confie nele no futuro.

### Token de proposta pública sem expiração

`publicToken` é um UUID permanente. Quem obtiver o link acessa a proposta e o PDF indefinidamente, mesmo depois de expirada ou rejeitada. Considere data de validade ou revogação do token.

### README desatualizado

O `README.md` marca "Calendar & tasks" e "File attachments" como pendentes, mas ambos existem (`/api/v1/calendar-events`, `/api/v1/tasks`, `/api/v1/clients/{id}/attachments`).
