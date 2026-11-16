import type { ServerWebSocket } from "bun";
import { isBridgeQuery, isBridgeResponse } from "../protocol/messages.ts";
import type { BridgeRequest, BridgeResponse, ReadAction, ReadRequestPayloadMap } from "../protocol/types.ts";
import { authorizeBridgeRequest, BRIDGE_PROTOCOL } from "./security.ts";
import { loadBridgeToken } from "./token.ts";

export const DEFAULT_BRIDGE_HOST = "127.0.0.1";
export const DEFAULT_BRIDGE_PORT = 38450;

interface PendingRequest {
  resolve: (response: BridgeResponse) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface BridgeHub {
  port: number;
  isPluginConnected: () => boolean;
  waitForPlugin: (timeoutMs?: number) => Promise<void>;
  request: <A extends ReadAction>(action: A, payload: ReadRequestPayloadMap[A], timeoutMs?: number) => Promise<BridgeResponse>;
  stop: () => void;
}

export function startBridgeServer(port = DEFAULT_BRIDGE_PORT): BridgeHub {
  const token = loadBridgeToken(port);
  let activeSocket: ServerWebSocket<unknown> | null = null;
  let seq = 0;
  const pending = new Map<string, PendingRequest>();
  const connectionWaiters = new Set<() => void>();

  function waitForPlugin(timeoutMs = 15_000): Promise<void> {
    if (activeSocket !== null) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        connectionWaiters.delete(onConnect);
        reject(new Error(`等待 Figma 本地插件连接超时 (${timeoutMs}ms)。请运行 bun figma/cli.ts pair，并在插件中输入配对码。`));
      }, timeoutMs);
      function onConnect() {
        clearTimeout(timer);
        connectionWaiters.delete(onConnect);
        resolve();
      }
      connectionWaiters.add(onConnect);
    });
  }

  async function dispatch<A extends ReadAction>(
    action: A,
    payload: ReadRequestPayloadMap[A],
    timeoutMs = 15_000
  ): Promise<BridgeResponse> {
    if (!activeSocket) await waitForPlugin(timeoutMs);
    seq += 1;
    const requestId = `req-${Date.now()}-${seq}`;
    const message: BridgeRequest<A> = { requestId, action, payload };
    return new Promise<BridgeResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`Figma 插件读取超时 (${timeoutMs}ms): ${action}`));
      }, timeoutMs);
      pending.set(requestId, { resolve, reject, timer });
      activeSocket?.send(JSON.stringify(message));
    });
  }

  const server = Bun.serve({
    port,
    hostname: DEFAULT_BRIDGE_HOST,
    idleTimeout: 255,
    async fetch(req, srv) {
      const denied = authorizeBridgeRequest(req, srv.port ?? port, token);
      if (denied) return denied;
      const url = new URL(req.url);
      if (url.pathname === "/ws") {
        const upgraded = srv.upgrade(req, {
          headers: { "Sec-WebSocket-Protocol": BRIDGE_PROTOCOL },
        });
        return upgraded ? undefined : new Response("WebSocket upgrade failed", { status: 400 });
      }
      if (url.pathname === "/status" && req.method === "GET") {
        return Response.json({ ok: true, connected: activeSocket !== null, protocol: BRIDGE_PROTOCOL });
      }
      if (url.pathname === "/query" && req.method === "POST") {
        try {
          const body: unknown = await req.json();
          if (!isBridgeQuery(body)) return new Response("Invalid query", { status: 400 });
          return Response.json(await dispatch(body.action, body.payload, body.timeoutMs));
        } catch (error) {
          return Response.json({
            requestId: "http",
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          } satisfies BridgeResponse, { status: 502 });
        }
      }
      return new Response("Not Found", { status: 404 });
    },
    websocket: {
      open(ws) {
        activeSocket?.close(1000, "Replaced by paired plugin");
        activeSocket = ws;
        for (const notify of connectionWaiters) notify();
        connectionWaiters.clear();
      },
      message(ws, rawMessage) {
        if (ws !== activeSocket) return;
        try {
          const parsed: unknown = JSON.parse(String(rawMessage));
          if (!isBridgeResponse(parsed)) return;
          const entry = pending.get(parsed.requestId);
          if (!entry) return;
          clearTimeout(entry.timer);
          pending.delete(parsed.requestId);
          entry.resolve(parsed);
        } catch {
          return;
        }
      },
      close(ws) {
        if (activeSocket === ws) activeSocket = null;
      },
    },
  });

  return {
    port: server.port ?? port,
    isPluginConnected: () => activeSocket !== null,
    waitForPlugin,
    request: dispatch,
    stop() {
      for (const item of pending.values()) {
        clearTimeout(item.timer);
        item.reject(new Error("Bridge server stopped"));
      }
      pending.clear();
      server.stop(true);
    },
  };
}
