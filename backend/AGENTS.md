# AGENTS.md

## Package management

- Use Bun exclusively for dependency management and package scripts: `bun install`, `bun add`, `bun remove`, `bun run <script>`, and `bunx`.
- Commit `bun.lock` and keep `packageManager` in `package.json` aligned with the Bun version used by the project. Do not generate npm, Yarn, or pnpm lockfiles.
- Keep exactly four package scripts: `dev`, `deploy`, `test`, and `db`. Each invokes a TypeScript entry under `scripts/` and supports `--help` / `-h` with no application or database side effects.
- Put command branches in script parameters, not additional package script aliases. Document defaults in help and README. Prompts require an explicit `--interactive`; explicit flags take precedence over prompted values.
- Use explicit imports from `zx` for subprocesses and `@clack/prompts` for terminal UI. Keep command-specific flow in its entry and share only cohesive CLI, prompt, process, and database helpers.
- `deploy` means build and run locally with Node.js in production mode; `--build-only` only creates build artifacts. It does not publish to a remote service.
- Run Vitest through `bun run test`; use `--scope all|check|unit|e2e` to select a branch. The built-in `bun test` runner is not configured for this project.
- `db` defaults to read-only `status`; SQL migrations use `node-pg-migrate`. Keep migrations in `database/migrations/`, idempotent development seeds in `database/seeds/`, and credentials in `DATABASE_URL`.
- Bun is the package manager; keep Node.js as the NestJS runtime unless a runtime migration is explicitly requested.
- Share Docker checks and Compose startup in `scripts/shared/docker.ts`. `dev` and development database write commands ensure local Compose PostgreSQL is healthy before proceeding; `db status`, production database commands, external database connections, and `--skip-docker` must not start containers.
- Require an already running Docker engine. If Docker CLI, Compose, the engine, or the cached image is unavailable, fail with a clear message; never launch Docker Desktop, install Docker, or pull images automatically. Leave PostgreSQL running when development stops.

## API contracts and authentication

- Follow `../spec/api.md`. Define application input, output, errors and REST routes in `src/contracts/` with ArkType and `@orpc/contract`; implement that contract with `@orpc/server` and retain runtime input/output validation.
- Generate application OpenAPI from the contract. Keep Better Auth's generated schema as a separate Scalar source; do not duplicate its endpoint definitions in application contracts.
- Follow `../spec/backend_structure.md`: top-level layers are `bootstrap`, `contracts`, `presentation`, `application`, and `infrastructure`. Add `domain` only when actual business rules require it. Group business capabilities inside each layer.
- Keep v1 contracts under `src/contracts/v1/`, shared contract primitives under `src/contracts/shared/`, HTTP setup under `src/presentation/http/`, RPC procedures under `src/presentation/rpc/`, and OpenAPI generation under `src/presentation/openapi/`.
- Expose application procedures only through `/rpc/v1`. Do not add parallel REST routes, unversioned RPC routes, or `/api` aliases. OpenAPI must describe the actual RPC POST paths and direct JSON payloads without a `json` wrapper.
- Keep Better Auth under `src/infrastructure/identity/` and its native endpoints under `/rpc/v1/auth`. Authenticate RPC procedures through the application-owned `SessionReader` port and propagate every renewed session cookie through oRPC response headers.
- Application and domain code must not import API contracts, protocol adapters, infrastructure implementations, or third-party authentication session types. Map application results to API outputs in presentation.
- Assemble providers and bind ports to adapters in `src/bootstrap/modules/`. Keep the root router limited to aggregating capability routers. Do not create empty business modules, generic base repositories, or fake use cases.
- Mount Better Auth before body parsing and retain Nest's `bodyParser: false` for the Node adapters. Apply CORS before the manually mounted HTTP handlers.
- Keep secrets in environment variables. Database changes require SQL migrations; application startup must not run migrations or seeds.
- Compose reuses the local `postgres:17-alpine` image with `pull_policy: never`; do not pull another PostgreSQL image as part of ordinary setup.

## NestJS

This app's version of NestJS is likely newer than what you know. https://docs.nestjs.com/llms.txt indexes its documentation, with a markdown page per chapter.

Nest has first-party packages for these, so check them before adding another library or writing your own:

- Databases: [`@nestjs/typeorm`](https://docs.nestjs.com/data/typeorm.md), [`@nestjs/drizzle`](https://docs.nestjs.com/data/drizzle.md), [`@nestjs/mongoose`](https://docs.nestjs.com/data/mongodb.md), [`@nestjs/sequelize`](https://docs.nestjs.com/data/sequelize.md).
- OpenAPI: [`@nestjs/swagger`](https://docs.nestjs.com/openapi/introduction.md). GraphQL: [`@nestjs/graphql`](https://docs.nestjs.com/graphql/quick-start.md). WebSockets: [`@nestjs/websockets`](https://docs.nestjs.com/websockets/gateways.md). Microservices: [`@nestjs/microservices`](https://docs.nestjs.com/microservices/basics.md).
- Sign-in: [`@nestjs/authentication`](https://docs.nestjs.com/security/authentication.md). Permissions: [`@nestjs/authorization`](https://docs.nestjs.com/security/authorization.md). Rate limiting: [`@nestjs/throttler`](https://docs.nestjs.com/security/rate-limiting.md).
- Configuration: [`@nestjs/config`](https://docs.nestjs.com/application/configuration.md). Caching: [`@nestjs/cache-manager`](https://docs.nestjs.com/data/caching.md). Health checks: [`@nestjs/terminus`](https://docs.nestjs.com/reliability/terminus.md). Events inside the app: [`@nestjs/event-emitter`](https://docs.nestjs.com/application/events.md).
- Email: [`@nestjs/mail`](https://docs.nestjs.com/application/mail.md). Files, S3 included: [`@nestjs/storage`](https://docs.nestjs.com/application/file-storage.md). Translations: [`@nestjs/i18n`](https://docs.nestjs.com/application/i18n.md).
- Retries, timeouts and circuit breakers: [`@nestjs/resilience`](https://docs.nestjs.com/reliability/resilience.md).
- Idempotency keys: [`@nestjs/idempotency`](https://docs.nestjs.com/reliability/idempotency.md). Transactional outbox: [`@nestjs/outbox`](https://docs.nestjs.com/reliability/outbox.md). Sending and receiving webhooks: [`@nestjs/webhooks`](https://docs.nestjs.com/http/webhooks.md).
- Queues: [`@nestjs/bullmq`](https://docs.nestjs.com/application/queues.md). Scheduled jobs: [`@nestjs/schedule`](https://docs.nestjs.com/application/task-scheduling.md).
- Running a scheduled job on one instance, and locks: [`@nestjs/locks`](https://docs.nestjs.com/reliability/locks.md). Processes that take days: [`@nestjs/workflows`](https://docs.nestjs.com/reliability/workflows.md).
- Language models, tools and agents: [`@nestjs/ai`](https://docs.nestjs.com/ai/overview.md). MCP servers: [`@nestjs/mcp`](https://docs.nestjs.com/mcp/overview.md).

Validation works with Zod, Valibot, ArkType or any other Standard Schema library, with no classes or decorator metadata: `StandardSchemaValidationPipe` with `@Body({ schema })` or `@Param('id', { schema })` (https://docs.nestjs.com/application/validation.md). `class-validator` still works, through `ValidationPipe`.

`NodeAdapter` from `@nestjs/platform-node` is the fastest HTTP adapter, ahead of Fastify (https://docs.nestjs.com/http/performance.md).

Nest's packages are ESM only, and this project is ESM too: relative imports end in `.js`, `__dirname` doesn't exist (use `import.meta.dirname`), and tests run on Vitest, so mocks are `vi.fn()`, not `jest.fn()`.

## Production data: NestJS Observe

This app's production telemetry - traces, errors, logs and metrics - goes to [NestJS Observe](https://observe.nestjs.com). Until `ObserveModule` is registered in `src/bootstrap/app.module.ts`, nothing is sent: `npx @nestjs/observe link` sets it up in one step - it installs `@nestjs/observe`, wires it into the app, and writes the key pair (`OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET`) to `.env`.

When a task depends on how the app behaves in production - an error users hit, a slow endpoint, a failing job, whether a release made things worse - work from that data, not from the code alone:

- The Observe MCP server answers those questions directly: errors with their traces and logs, slow operations, jobs, and what a release changed (`find_regressions`, `diff_release`). It is included on the Pro plan and above. In Claude Code: `claude mcp add observe --transport http https://observe-api.nestjs.com/mcp`, and the client opens a browser to approve. Other clients: https://www.observe.nestjs.com/documentation/mcp
- Without it, the user can open the request or error in the Observe dashboard and click **Copy agent prompt**, which hands over that page's trace, stack and logs as text.
