# Backend Structure

Organize source code by top-level layer, then by business capability within each layer. This document defines directory placement, layer responsibilities, and source dependency boundaries.

## Directory Layout

```text
backend/
  src/
    main.ts
    bootstrap/
      app.module.ts
      configure-application.ts
      modules/
        configuration.module.ts
        database.module.ts
        identity.module.ts
        rpc.module.ts
    contracts/
      shared/
        procedure.ts
      v1/
        api.contract.ts
        identity/
          identity.contract.ts
        health/
          health.contract.ts
    presentation/
      http/
        configure-http.ts
        documentation.controller.ts
      rpc/
        api.context.ts
        api-router.service.ts
        api-transport.service.ts
        auth.middleware.ts
        identity/
          identity-router.service.ts
          current-account.presenter.ts
        health/
          health.router.ts
      openapi/
        api-documentation.service.ts
    application/
      identity/
        session-identity.ts
        session-reader.ts
    infrastructure/
      config/
        configuration.service.ts
      postgres/
        database.service.ts
        schema/
          auth.schema.ts
          index.ts
      identity/
        better-auth.factory.ts
        better-auth.service.ts
      mail/
        mail.service.ts
  database/
    migrations/
    seeds/
  scripts/
  test/
  compose.yaml
```

Add `src/domain/` when business rules require it. Create capability directories only when they contain an implementation; do not add empty layers, placeholder repositories, or artificial use cases.

## Layer Responsibilities

| Directory | Contents |
| --- | --- |
| `bootstrap/` | Application assembly, Nest module definitions, and provider bindings |
| `contracts/` | Versioned API schemas, error declarations, procedure metadata, and contract aggregation |
| `presentation/` | HTTP and RPC entry points, middleware, response mapping, documentation generation, and worker entry points |
| `application/` | Business use cases, application-owned types, and ports required by those use cases |
| `domain/` | Business entities, value objects, policies, and state transition rules |
| `infrastructure/` | Database access, repository implementations, authentication adapters, mail, queues, and external service integrations |

`main.ts` is the executable entry point. Keep application assembly in `bootstrap/` rather than distributing module wiring across the other layers.

## Dependency Rules

- `contracts` may depend on schema and contract libraries and other contracts.
- `presentation` may depend on contracts, application boundaries, and protocol libraries.
- `application` may depend on domain code and other application boundaries. Nest dependency injection decorators are allowed.
- `domain` uses plain TypeScript and may depend on other domain code.
- `infrastructure` may depend on application ports, domain code, and infrastructure libraries.
- `bootstrap` may depend on all layers to assemble the application.

Application and domain code must not import API contracts, presentation code, infrastructure implementations, or external authentication, HTTP, database, and queue SDK types.

Define ports in the application capability that needs them, implement them in infrastructure, and bind them in `bootstrap/modules/`. Keep API response mapping in presentation.

## File Placement and Grouping

- Use consistent capability names across layers, such as `identity`, `organizations`, `social-accounts`, and `publishing`.
- Keep version-specific contracts under `contracts/v1/` and reusable contract definitions under `contracts/shared/`.
- Keep the root version contract and root RPC router limited to aggregating capability contracts and routers.
- Keep each capability's procedures and presenters together under `presentation/rpc/<capability>/`.
- Place future worker entry points under `presentation/workers/`; place queue adapters under `infrastructure/queue/`.
- Keep Nest module definitions under `bootstrap/modules/`, grouped by the capability or infrastructure responsibility they assemble.
- Keep SQL migrations and seed files under `database/`, command scripts under `scripts/`, and end-to-end tests under `test/`, outside `src/`.
- Name files by responsibility. Split files along cohesive boundaries and create shared utilities only for actual reuse.

API behavior is specified separately in [API Spec](./api.md).
