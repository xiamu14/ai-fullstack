import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { customAlphabet } from "nanoid";
import { PAIRING_CODE_PATTERN } from "../protocol/messages.ts";

const generatePairingCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  6
);

export { PAIRING_CODE_PATTERN } from "../protocol/messages.ts";

export function loadBridgeToken(port: number): string {
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("桥接端口必须为 1–65535 的整数");
  }
  const directory = join(homedir(), ".cache", "figma-reader-bridge");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  chmodSync(directory, 0o700);
  const path = join(directory, `${port}.token`);

  try {
    const existing = readFileSync(path, "utf8").trim();
    if (PAIRING_CODE_PATTERN.test(existing)) {
      chmodSync(path, 0o600);
      return existing;
    }
  } catch {
    // Token file does not exist yet
  }

  const token = generatePairingCode();
  writeFileSync(path, token, { mode: 0o600 });
  chmodSync(path, 0o600);
  return token;
}
