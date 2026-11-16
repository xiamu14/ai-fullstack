import type {
  BridgeResponse,
  ReadAction,
  ReadRequestPayloadMap,
} from "../protocol/types.ts";
import {
  DEFAULT_BRIDGE_HOST,
  DEFAULT_BRIDGE_PORT,
  startBridgeServer,
} from "./server.ts";

export interface QueryOptions {
  port?: number;
  timeoutMs?: number;
}

async function tryDaemonQuery<A extends ReadAction>(
  action: A,
  payload: ReadRequestPayloadMap[A],
  port: number,
  timeoutMs: number
): Promise<BridgeResponse | null> {
  const baseUrl = `http://${DEFAULT_BRIDGE_HOST}:${port}`;
  try {
    const statusRes = await fetch(`${baseUrl}/status`, {
      signal: AbortSignal.timeout(800),
    });
    if (!statusRes.ok) {
      return null;
    }
  } catch {
    return null;
  }

  const queryRes = await fetch(`${baseUrl}/query`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, payload, timeoutMs }),
    signal: AbortSignal.timeout(timeoutMs + 1000),
  });
  return (await queryRes.json()) as BridgeResponse;
}

export async function queryFigma<T = unknown, A extends ReadAction = ReadAction>(
  action: A,
  payload: ReadRequestPayloadMap[A],
  options: QueryOptions = {}
): Promise<T> {
  const port = options.port ?? DEFAULT_BRIDGE_PORT;
  const timeoutMs = options.timeoutMs ?? 15_000;

  // 1. 优先复用已后台运行的 bridge 服务
  const daemonResult = await tryDaemonQuery(action, payload, port, timeoutMs);
  if (daemonResult) {
    if (!daemonResult.ok) {
      throw new Error(daemonResult.error);
    }
    return daemonResult.data as T;
  }

  // 2. 无常驻服务时，启动单次临时 WebSocket 桥接，等待 Figma 插件自动重连后读取并退出
  const hub = startBridgeServer(port);
  try {
    await hub.waitForPlugin(timeoutMs);
    const response = await hub.request(action, payload, timeoutMs);
    if (!response.ok) {
      throw new Error(response.error);
    }
    return response.data as T;
  } finally {
    hub.stop();
  }
}
