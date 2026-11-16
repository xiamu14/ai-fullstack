import type { BridgeRequest, BridgeResponse, ReadAction, ReadRequestPayloadMap } from "./types.ts";

export const BRIDGE_PROTOCOL = "figma-reader-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isReadAction(value: unknown): value is ReadAction {
  return typeof value === "string" && ["document", "selection", "node", "find", "css", "styles", "export"].includes(value);
}

export function isReadPayload(action: ReadAction, value: unknown): value is ReadRequestPayloadMap[ReadAction] {
  if (!isRecord(value)) return false;
  for (const key of ["id", "query", "page"]) {
    if (value[key] !== undefined && typeof value[key] !== "string") return false;
  }
  for (const key of ["depth", "scale"]) {
    if (value[key] !== undefined && (typeof value[key] !== "number" || !Number.isFinite(value[key]))) return false;
  }
  for (const key of ["includeCss", "keepSets", "exact"]) {
    if (value[key] !== undefined && typeof value[key] !== "boolean") return false;
  }
  if (value.format !== undefined && !["SVG", "PNG", "JPG"].includes(String(value.format))) return false;
  if (action === "node" && (typeof value.id !== "string" || !value.id.trim())) return false;
  if (action === "find" && (typeof value.query !== "string" || !value.query.trim())) return false;
  return true;
}

export function isBridgeQuery(value: unknown): value is { action: ReadAction; payload: ReadRequestPayloadMap[ReadAction]; timeoutMs?: number } {
  return isRecord(value) && isReadAction(value.action) && isReadPayload(value.action, value.payload) && (value.timeoutMs === undefined || (typeof value.timeoutMs === "number" && Number.isFinite(value.timeoutMs) && value.timeoutMs > 0));
}

export function isBridgeRequest(value: unknown): value is BridgeRequest {
  return isRecord(value) && typeof value.requestId === "string" && value.requestId.length > 0 && isReadAction(value.action) && isReadPayload(value.action, value.payload);
}

export function isBridgeResponse(value: unknown): value is BridgeResponse {
  return isRecord(value) && typeof value.requestId === "string" && value.requestId.length > 0 && (value.ok === true ? "data" in value : value.ok === false && typeof value.error === "string");
}

export function readParentResponse(event: Pick<MessageEvent, "source" | "data">, expectedParent: Window): BridgeResponse | null {
  if (event.source !== expectedParent || !isRecord(event.data)) return null;
  return isBridgeResponse(event.data.pluginMessage) ? event.data.pluginMessage : null;
}
