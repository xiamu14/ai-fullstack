import { randomBytes } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function loadBridgeToken(port: number): string {
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("桥接端口必须为 1–65535 的整数");
  }
  const directory = join(homedir(), ".cache", "figma-reader-bridge");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  chmodSync(directory, 0o700);
  const path = join(directory, `${port}.token`);
  try {
    writeFileSync(path, randomBytes(32).toString("hex"), { flag: "wx", mode: 0o600 });
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") {
      throw error;
    }
  }
  chmodSync(path, 0o600);
  const token = readFileSync(path, "utf8").trim();
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new Error(`桥接配对码文件格式错误：${path}`);
  }
  return token;
}
