# Discoveries, Research & Constraints (Axel CRM)

## 1. Stack & Tech Specifications
- **Backend**: Java 21, Spring Boot 4.0.0, Spring Security, Spring Data JPA, Flyway migration, PostgreSQL, Auth0 `java-jwt` 4.4.0.
- **Frontend**: Angular 18 (Standalone components, Lazy routes), Angular Material 18, Chart.js, Lucide/Material icons, SCSS + Tailwind.
- **Database**: PostgreSQL 16 with 38 tables, 6 analytical views (`analytics_views`), Flyway migrations (30 migrations V1..V29 + R__seed_data).

## 2. Architectural Invariants
1. **Multi-Tenancy**:
   - Organization isolation is enforced at the JWT claim level (`organizationId`).
   - Request processing uses `JwtAuthenticationFilter` -> `TenantFilter` -> `TenantContext (ThreadLocal<UUID>)`.
   - Data access strictly filters by `organization_id` and `deletedAt IS NULL`.
   - `BaseEntity` provides UUID generation, `@ManyToOne Organization`, `createdAt`, `updatedAt`, `deletedAt`, and auto-populates organization via `@PrePersist` hook if null.
2. **Soft Deletion**:
   - No physical deletions for business entities. Everything sets `deletedAt = Instant.now()`.
   - Repository queries include `...AndDeletedAtIsNull`.
3. **DTO / Record Pattern**:
   - All controller requests/responses use Java records (`*Request`, `*Response`), validated with `@Valid` (Jakarta Validation).
   - No raw JPA entities exposed over REST API.
4. **Frontend Architecture**:
   - 100% Standalone Angular components with standalone routing.
   - Generic `BaseService<T>` for standard CRUD operations.
   - Functional interceptors: `authInterceptor` (JWT injection & 401 handling) and `tenantInterceptor`.
   - Central shell layout (`frontend/src/app/shell`) with global timer, persistent notifications, and responsive sidebar.

## 3. Notable Gotchas & Known Limitations (from docs/10-pontos-de-atencao.md)
- Role-based authorization: Roles exist (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SALES`, `SUPPORT`, `USER`, `VIEWER`), but many controllers currently check authentication without granular `@PreAuthorize` method security.
- Integrations: Google & Email services have backend scaffolding, but some controller endpoints return mock data or require full OAuth token refresh setup.
- Client/Partner Portals: Specialized portal routes (`/portal/client`, `/portal/partner`) and public proposal token viewing (`/public/proposals/:token`).
