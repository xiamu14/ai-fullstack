import { isBridgeRequest } from "../protocol/messages.ts";
import type { BridgeRequest, BridgeResponse } from "../protocol/types.ts";
import { exportAssets } from "./readers/asset-reader.ts";
import {
  findNodes,
  readDocumentSummary,
  readNodeById,
  readSelection,
} from "./readers/document-reader.ts";
import { readCss, readLocalStyles } from "./readers/style-reader.ts";

figma.showUI(__html__, {
  width: 320,
  height: 200,
  themeColors: true,
});

async function handleReadRequest(
  request: BridgeRequest
): Promise<BridgeResponse> {
  const { requestId, action, payload } = request;
  try {
    switch (action) {
      case "document":
        return { requestId, ok: true, data: readDocumentSummary() };
      case "selection":
        return {
          requestId,
          ok: true,
          data: await readSelection(
            payload as BridgeRequest<"selection">["payload"]
          ),
        };
      case "node":
        return {
          requestId,
          ok: true,
          data: await readNodeById(payload as BridgeRequest<"node">["payload"]),
        };
      case "find":
        return {
          requestId,
          ok: true,
          data: await findNodes(payload as BridgeRequest<"find">["payload"]),
        };
      case "css":
        return {
          requestId,
          ok: true,
          data: await readCss(payload as BridgeRequest<"css">["payload"]),
        };
      case "styles":
        return {
          requestId,
          ok: true,
          data: await readLocalStyles(),
        };
      case "export":
        return {
          requestId,
          ok: true,
          data: await exportAssets(
            payload as BridgeRequest<"export">["payload"]
          ),
        };
      default:
        return {
          requestId,
          ok: false,
          error: `未知读取指令: ${String(action)}`,
        };
    }
  } catch (error) {
    return {
      requestId,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

figma.ui.onmessage = async (rawMessage: unknown) => {
  if (!isBridgeRequest(rawMessage)) return;
  const response = await handleReadRequest(rawMessage);
  figma.ui.postMessage(response);
};
