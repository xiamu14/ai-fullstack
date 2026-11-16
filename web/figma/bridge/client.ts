import { spawn } from "node:child_process";
import { resolve } from "node:path";
import type {
  BridgeResponse,
  ReadAction,
  ReadRequestPayloadMap,
} from "../protocol/types.ts";
import { DEFAULT_BRIDGE_HOST, DEFAULT_BRIDGE_PORT } from "./server.ts";

export interface QueryOptions {
  port?: number;
  timeoutMs?: number;
}

async function isDaemonAlive(port: number): Promise<boolean> {
  const baseUrl = `http://${DEFAULT_BRIDGE_HOST}:${port}`;
  try {
    const res = await fetch(`${baseUrl}/status`, {
      signal: AbortSignal.timeout(600),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureDaemonRunning(port: number): Promise<void> {
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
}

export async function queryFigma<T = unknown, A extends ReadAction = ReadAction>(
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
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, payload, timeoutMs }),
    signal: AbortSignal.timeout(timeoutMs + 2000),
  });

  const result = (await queryRes.json()) as BridgeResponse;
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.data as T;
}
