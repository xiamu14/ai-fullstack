import { spawn } from "node:child_process";
import { resolve } from "node:path";
import type {
  BridgeResponse,
  ReadAction,
  ReadRequestPayloadMap,
} from "../protocol/types.ts";
import { BRIDGE_PROTOCOL } from "../protocol/messages.ts";
import { DEFAULT_BRIDGE_HOST, DEFAULT_BRIDGE_PORT } from "./server.ts";
import { loadBridgeToken } from "./token.ts";

export interface QueryOptions {
  port?: number;
  timeoutMs?: number;
}

async function isDaemonAlive(port: number): Promise<boolean> {
  const baseUrl = `http://${DEFAULT_BRIDGE_HOST}:${port}`;
  const res = await fetch(`${baseUrl}/status`, {
    headers: { authorization: `Bearer ${loadBridgeToken(port)}` },
    signal: AbortSignal.timeout(600),
  }).catch(() => null);
  if (!res) return false;
  const status = await res.json().catch(() => null);
  if (!res.ok || status?.protocol !== BRIDGE_PROTOCOL) {
    throw new Error("本地端口运行着旧版或未配对的桥接，请停止旧服务后重试。");
  }
  return true;
}

export async function ensureDaemonRunning(port: number): Promise<void> {
  if (await isDaemonAlive(port)) {
    return;
  }

  const cliEntry = resolve(import.meta.dirname, "../cli.ts");
  const child = spawn(
    process.execPath,
    [cliEntry, "serve", "--port", String(port)],
    {
      detached: true,
      stdio: "ignore",
    }
  );
  child.unref();

  for (let i = 0; i < 25; i += 1) {
    await Bun.sleep(100);
    if (await isDaemonAlive(port)) {
      return;
    }
  }
  throw new Error("本机桥接未能启动，请运行 bun figma/cli.ts serve 查看原因。");
}

export async function queryFigma<
  T = unknown,
  A extends ReadAction = ReadAction,
>(
  action: A,
  payload: ReadRequestPayloadMap[A],
  options: QueryOptions = {}
): Promise<T> {
  const port = options.port ?? DEFAULT_BRIDGE_PORT;
  const timeoutMs = options.timeoutMs ?? 20_000;

  // 自动确保后台常驻桥接服务已启动，使 Figma 插件保持长连接不掉线
  await ensureDaemonRunning(port);

  const baseUrl = `http://${DEFAULT_BRIDGE_HOST}:${port}`;
  const queryRes = await fetch(`${baseUrl}/query`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${loadBridgeToken(port)}`,
    },
    body: JSON.stringify({ action, payload, timeoutMs }),
    signal: AbortSignal.timeout(timeoutMs + 2000),
  });

  const result = (await queryRes.json()) as BridgeResponse;
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.data as T;
}
