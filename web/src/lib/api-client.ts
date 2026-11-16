import { apiContract } from '@backend/contracts/v1/api.contract.js';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import type { JsonifiedClient } from '@orpc/openapi-client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

function resolveApiUrl(): string {
  const configured = import.meta.env.VITE_API_URL ?? '/rpc/v1';
  if (configured.startsWith('http://') || configured.startsWith('https://')) {
    return configured;
  }
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:5173';
  return new URL(configured, origin).toString();
}

const link = new OpenAPILink(apiContract, {
  url: resolveApiUrl,
  fetch: (request, init) =>
    fetch(request, {
      ...init,
      credentials: 'include',
    }),
});

export type ApiClient = JsonifiedClient<
  ContractRouterClient<typeof apiContract>
>;

export const apiClient: ApiClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(apiClient);
