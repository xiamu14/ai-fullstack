import type {
  RequestHeadersPluginContext,
  ResponseHeadersPluginContext,
} from '@orpc/server/plugins';

export interface ApiContext
  extends RequestHeadersPluginContext, ResponseHeadersPluginContext {
  requestId: string;
}
