## Good API Rules

- Runtime input + ouput validation
- Contract-first: schema as are the single source of truth
- OpenAPI spec auto-generated from the contract
- Consistent erro reponse (401,403, 404, 409, etc.)
- Clear separation of layers
- Extensibility (auth , rate limiting, etc.)

## Transport and Versioning

- Expose application procedures only through oRPC at `/rpc/v1`.
- Do not mount a parallel REST API, an unversioned RPC endpoint, or `/api` aliases.
- Mount Better Auth's native login, session, and OAuth endpoints at `/rpc/v1/auth`; use oRPC middleware to authenticate application procedures and forward renewed session cookies.
- Generate OpenAPI from the versioned contract and describe the actual RPC paths and direct JSON payloads without a `json` wrapper.

## Backend Structure

Follow [Backend Structure](./backend_structure.md) for top-level layers, business capabilities, dependency rules, authentication integration, and versioned contracts.
