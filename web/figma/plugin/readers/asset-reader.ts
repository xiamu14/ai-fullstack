import type {
  ExportedAssetItem,
  ReadRequestPayloadMap,
} from "../../protocol/types.ts";
import { resolveTargetNodes } from "./style-reader.ts";

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64(bytes: Uint8Array): string {
  let result = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = i + 1 < len ? (bytes[i + 1] ?? 0) : 0;
    const b2 = i + 2 < len ? (bytes[i + 2] ?? 0) : 0;

    result += BASE64_ALPHABET[b0 >> 2];
    result += BASE64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    result +=
      i + 1 < len ? BASE64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
    result += i + 2 < len ? BASE64_ALPHABET[b2 & 0x3f] : "=";
  }
  return result;
}

export async function exportAssets(
  payload: ReadRequestPayloadMap["export"]
): Promise<ExportedAssetItem[]> {
  const nodes = await resolveTargetNodes(payload.id);
  const format = payload.format ?? "SVG";
  const scale = payload.scale ?? 1;

  return Promise.all(
    nodes.map(async (node) => {
      if (typeof node.exportAsync !== "function") {
        throw new Error(`节点 ${node.id} (${node.type}) 不支持导出`);
      }
      const bytes = await node.exportAsync(
        format === "SVG"
          ? { format }
          : { format, constraint: { type: "SCALE", value: scale } }
      );
      return {
        id: node.id,
        name: node.name,
        format,
        base64: bytesToBase64(bytes),
      };
    })
  );
}
