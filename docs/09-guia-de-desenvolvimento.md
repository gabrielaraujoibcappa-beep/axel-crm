# 09 — Guia de desenvolvimento

## Como adicionar um módulo CRUD completo

O sistema tem mais de 30 módulos que seguem o mesmo caminho. Use `Client` como referência viva — ele é o exemplo mais limpo do padrão.

### Backend

**1. Migration.** Crie `V<n>__create_<tabela>.sql` com `id UUID PK`, `organization_id UUID NOT NULL` (FK para `organizations`), as colunas do domínio, `created_at`, `updated_at`, `deleted_at` e índice em `organization_id`.

**2. Entidade.** Em `entity/`, estenda `BaseEntity`:

```java
@Entity
@Table(name = "widgets")
@Data
@EqualsAndHashCode(callSuper = true)
public class Widget extends BaseEntity {
    @Column(nullable = false)
    private String name;
}
```

**3. Repositório.** Em `repository/`, com o filtro de tenant no nome dos métodos:

```java
public interface WidgetRepository extends JpaRepository<Widget, UUID> {
    Page<Widget> findByOrganization_IdAndDeletedAtIsNull(UUID organizationId, Pageable pageable);
    Optional<Widget> findByIdAndOrganization_IdAndDeletedAtIsNull(UUID id, UUID organizationId);
}
```

**4. DTOs.** Em `dto/`, dois records: `WidgetRequest` (com Jakarta Validation) e `WidgetResponse`.

**5. Service.** Em `service/`, com `@Transactional`, recebendo `organizationId` como primeiro parâmetro em toda operação. `delete` preenche `deletedAt` — nunca remove a linha.

**6. Controller.** Em `controller/`, fino, extraindo o tenant do `TenantContext` e anotado para o Swagger:

```java
@RestController
@RequestMapping("/api/v1/widgets")
@RequiredArgsConstructor
@Tag(name = "Widgets", description = "Endpoints for managing widgets")
public class WidgetController { ... }
```

### Frontend

**7. Service.** Estenda `BaseService<Widget>` e fixe o path `widgets`.

**8. Componente de lista.** Componente standalone que usa `ListPageComponent`, declarando `columns`, `kpis` e ligando os outputs a chamadas do service e ao `FormDialogComponent`.

**9. Rotas do módulo.** `features/widgets/widgets.routes.ts` exportando `WIDGETS_ROUTES`.

**10. Registro.** Adicione a rota lazy em `app.routes.ts` e o item de navegação na seção correta de `shell.component.ts`.

## Convenções obrigatórias

**Toda consulta filtra por organização.** Um repositório sem o filtro de `organization_id` vaza dados entre tenants. Não há rede de proteção no banco.

**Toda exclusão é lógica.** Preencha `deletedAt` e filtre por `DeletedAtIsNull` em todas as leituras.

**Entidade nunca sai pela API.** Controllers respondem DTOs; a serialização de entidades JPA com relacionamentos lazy quebra ou expõe dados demais.

**O tenant vem do token.** Nunca aceite `organizationId` vindo do corpo da requisição ou de query string.

**Regra de negócio fica no service.** Controllers só orquestram; repositórios só consultam.

**Mensagens de erro de negócio em português.** Elas chegam ao operador. Use `BadRequestException` para violação de regra e `ResourceNotFoundException` para registro inexistente — o `GlobalExceptionHandler` cuida do status HTTP.

## Testes

### Backend

```bash
cd backend
mvn test
```

Stack: JUnit 5 (`spring-boot-starter-test`), Mockito, `spring-security-test` e H2 em memória.

São **144 testes** em 23 classes: testes de controller (autenticação, usuários, clientes, negócios, projetos, propostas, dashboard, financeiro) e testes unitários de service (`ProposalService`, `PipelineEngine`, `AnalyticsService`, `DealService`, `LeadService`, `ProjectService`, `ClientService`, `LegalProcessService`, entre outros), apoiados em `config/BaseServiceTest.java`.

Ainda sem cobertura: `LeadScoringService`, `CommissionService`, `LgpdService`, `CampaignService` e a maior parte dos módulos de CRUD simples.

O build Docker roda com `-DskipTests`; os testes precisam ser executados no CI ou localmente.

### Frontend

```bash
cd frontend
npm test         # Karma + Jasmine
```

Não há specs relevantes no repositório no momento.

## Build

```bash
# backend — JAR executável em target/
cd backend && mvn package

# frontend — bundle em dist/crm-axel-frontend/browser
cd frontend && npm run build -- --configuration production
```

## Commits

Formato convencional: `<tipo>: <descrição>`, com tipos `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`. Descrição no imperativo, explicando o efeito da mudança.

## Onde procurar cada coisa

| Preciso de… | Vá para |
| --- | --- |
| Contrato de um endpoint | Swagger UI, ou `controller/` + `dto/` |
| Regra de negócio | `service/` |
| Estrutura de tabela | `resources/db/migration/` |
| Isolamento de tenant | `auth/security/TenantFilter`, `TenantContext`, `commons/entity/BaseEntity` |
| Autenticação | `auth/security/`, `auth/service/AuthService` |
| Tela de listagem | `shared/list-page/`, mais o componente do módulo |
| Navegação | `app.routes.ts`, `shell/shell.component.ts` |
| Tokens visuais | [`../DESIGN.md`](../DESIGN.md) |
