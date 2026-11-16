import type { ServerWebSocket } from "bun";
import type {
  BridgeRequest,
  BridgeResponse,
  ReadAction,
  ReadRequestPayloadMap,
} from "../protocol/types.ts";

export const DEFAULT_BRIDGE_HOST = "localhost";
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
  request: <A extends ReadAction>(
    action: A,
    payload: ReadRequestPayloadMap[A],
    timeoutMs?: number
  ) => Promise<BridgeResponse>;
  stop: () => void;
}

export function startBridgeServer(port = DEFAULT_BRIDGE_PORT): BridgeHub {
  let activeSocket: ServerWebSocket<unknown> | null = null;
  let seq = 0;
  const pending = new Map<string, PendingRequest>();
  const connectionWaiters = new Set<() => void>();

  function waitForPlugin(timeoutMs = 15_000): Promise<void> {
    if (activeSocket !== null) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        connectionWaiters.delete(onConnect);
        reject(
          new Error(
            `等待 Figma 本地插件连接超时 (${timeoutMs}ms)。请确认已在 Figma Desktop 运行插件 Local Figma Reader Bridge。`
          )
        );
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
    if (!activeSocket) {
      await waitForPlugin(timeoutMs);
    }

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
    idleTimeout: 255,
    async fetch(req, srv) {
      const url = new URL(req.url);

      if (url.pathname === "/ws") {
        const upgraded = srv.upgrade(req);
        if (upgraded) {
          return undefined;
        }
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      if (url.pathname === "/status" && req.method === "GET") {
        return Response.json({
          ok: true,
          connected: activeSocket !== null,
        });
      }

      if (url.pathname === "/query" && req.method === "POST") {
        try {
          const body = (await req.json()) as {
            action: ReadAction;
            payload: ReadRequestPayloadMap[ReadAction];
            timeoutMs?: number;
          };
          const response = await dispatch(
            body.action,
            body.payload,
            body.timeoutMs
          );
          return Response.json(response);
        } catch (error) {
          return Response.json(
            {
              requestId: "http",
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            } satisfies BridgeResponse,
            { status: 502 }
          );
        }
      }

      return new Response("Not Found", { status: 404 });
    },
    websocket: {
      open(ws) {
        activeSocket = ws;
        for (const notify of connectionWaiters) {
          notify();
        }
        connectionWaiters.clear();
      },
      message(_ws, rawMessage) {
        try {
          const parsed = JSON.parse(String(rawMessage)) as BridgeResponse;
          const entry = pending.get(parsed.requestId);
          if (!entry) {
            return;
          }
          clearTimeout(entry.timer);
          pending.delete(parsed.requestId);
          entry.resolve(parsed);
        } catch {
          // Ignore malformed messages
        }
      },
      close(ws) {
        if (activeSocket === ws) {
          activeSocket = null;
        }
      },
    },
  });

  return {
    port: server.port ?? port,
    isPluginConnected: () => activeSocket !== null,
    waitForPlugin,
    request: dispatch,
    stop() {
      for (const [, item] of pending) {
        clearTimeout(item.timer);
        item.reject(new Error("Bridge server stopped"));
      }
      pending.clear();
      server.stop(true);
    },
  };
}
