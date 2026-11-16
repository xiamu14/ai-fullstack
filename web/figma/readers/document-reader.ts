import { queryFigma } from "../bridge/client.ts";
import type { DocumentSummary } from "../protocol/types.ts";

export interface ReadDocumentOptions {
  port?: number;
}

export async function fetchDocumentSummary(
  options: ReadDocumentOptions = {}
): Promise<DocumentSummary> {
  return queryFigma<DocumentSummary>(
    "document",
    {},
    { port: options.port }
  );
}
