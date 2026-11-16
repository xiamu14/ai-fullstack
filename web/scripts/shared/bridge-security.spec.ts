import { describe, expect, it } from "vitest";
import { authorizeBridgeRequest, BRIDGE_PROTOCOL } from "../../figma/bridge/security.ts";
import { isBridgeQuery, isBridgeRequest, readParentResponse } from "../../figma/protocol/messages.ts";

const token = "Ab3xY9";
const port = 38450;
function request(path = "/query", headers: Record<string, string> = {}) {
  return new Request(`http://127.0.0.1:${port}${path}`, {
    headers: { host: `127.0.0.1:${port}`, authorization: `Bearer ${token}`, ...headers },
  });
}

describe("local bridge access", () => {
  it("allows the paired command-line client", () => {
    expect(authorizeBridgeRequest(request(), port, token)).toBeNull();
  });
  it("rejects DNS rebinding even with a valid credential", () => {
    expect(authorizeBridgeRequest(request("/query", { host: `attacker.example:${port}` }), port, token)?.status).toBe(403);
  });
  it("rejects browser-origin HTTP requests", () => {
    expect(authorizeBridgeRequest(request("/query", { origin: "https://attacker.example" }), port, token)?.status).toBe(403);
  });
  it.each(["", "Bearer invalid", "Bearer Bb3xY9", `Bearer ${"b".repeat(64)}`, token, `Bearer ${"é".repeat(6)}`])("rejects invalid credentials without throwing", (authorization) => {
    expect(authorizeBridgeRequest(request("/query", { authorization }), port, token)?.status).toBe(401);
  });
  it("requires a token even for an opaque Figma WebSocket origin", () => {
    expect(authorizeBridgeRequest(request("/ws", { origin: "null", "sec-websocket-protocol": BRIDGE_PROTOCOL }), port, token)?.status).toBe(401);
  });
  it("accepts a paired Figma socket without URL credentials", () => {
    const socket = request("/ws", { origin: "null", "sec-websocket-protocol": `${BRIDGE_PROTOCOL}, ${token}` });
    expect(authorizeBridgeRequest(socket, port, token)).toBeNull();
    expect(new URL(socket.url).search).toBe("");
  });
  it("rejects a foreign WebSocket origin even with the right token", () => {
    expect(authorizeBridgeRequest(request("/ws", { origin: "https://attacker.example", "sec-websocket-protocol": `${BRIDGE_PROTOCOL}, ${token}` }), port, token)?.status).toBe(403);
  });
});

describe("bridge messages", () => {
  it("rejects unsupported commands and malformed payloads", () => {
    expect(isBridgeRequest({ requestId: "1", action: "delete", payload: {} })).toBe(false);
    expect(isBridgeRequest({ requestId: "1", action: "node", payload: {} })).toBe(false);
    expect(isBridgeQuery({ action: "document", payload: {}, timeoutMs: -1 })).toBe(false);
    expect(isBridgeRequest({ requestId: "1", action: "node", payload: { id: "1:2" } })).toBe(true);
  });
  it("rejects non-string export formats", () => {
    expect(isBridgeQuery({ action: "export", payload: { format: ["SVG"] } })).toBe(false);
    expect(isBridgeQuery({ action: "export", payload: { format: "SVG" } })).toBe(true);
  });
  it("accepts responses only from the expected parent window", () => {
    const parent = {} as Window;
    const response = { requestId: "1", ok: true, data: {} };
    expect(readParentResponse({ source: parent, data: { pluginMessage: response } }, parent)).toEqual(response);
    expect(readParentResponse({ source: {} as Window, data: { pluginMessage: response } }, parent)).toBeNull();
  });
  it("rejects malformed parent responses", () => {
    const parent = {} as Window;
    expect(readParentResponse({ source: parent, data: { pluginMessage: { requestId: "1", ok: true } } }, parent)).toBeNull();
    expect(readParentResponse({ source: parent, data: { pluginMessage: { requestId: "1", ok: false, error: 42 } } }, parent)).toBeNull();
  });
});
