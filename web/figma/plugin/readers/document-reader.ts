import type {
  DocumentSummary,
  ReadRequestPayloadMap,
  SerializedNode,
} from "../../protocol/types.ts";
import type { FigmaNode, FigmaPageNode } from "./figma-types.ts";
import { serializeNode } from "./node-serializer.ts";

export function readDocumentSummary(): DocumentSummary {
  const currentPage = figma.currentPage;
  return {
    documentName: figma.root.name,
    fileKey: figma.fileKey ?? null,
    currentPage: {
      id: currentPage.id,
      name: currentPage.name,
      selectionCount: currentPage.selection.length,
    },
    pages: figma.root.children.map((page) => ({
      id: page.id,
      name: page.name,
      current: page.id === currentPage.id ? true : undefined,
    })),
  };
}

export async function readSelection(
  payload: ReadRequestPayloadMap["selection"]
): Promise<SerializedNode[]> {
  const depth = payload.depth ?? 2;
  const includeCss = payload.includeCss ?? false;
  const selection = figma.currentPage.selection;
  return Promise.all(
    selection.map((node) => serializeNode(node, { depth, includeCss }))
  );
}

export async function readNodeById(
  payload: ReadRequestPayloadMap["node"]
): Promise<SerializedNode> {
  const normalizedId = payload.id.replace("-", ":");
  const node =
    (await figma.getNodeByIdAsync(payload.id)) ??
    (await figma.getNodeByIdAsync(normalizedId));

  if (!node) {
    throw new Error(`未找到节点: ${payload.id}`);
  }

  return serializeNode(node, {
    depth: payload.depth ?? 2,
    includeCss: payload.includeCss ?? false,
  });
}

function collectMatchingNodes(
  root: FigmaNode,
  segments: string[],
  ancestors: string[],
  matches: FigmaNode[]
): void {
  const nextAncestors = [...ancestors, root.name.toLowerCase()];
  const fullPath = nextAncestors.join("/");
  const isLeafMatch =
    root.name.toLowerCase().includes(segments[segments.length - 1] ?? "") &&
    segments.every((seg) => fullPath.includes(seg));

  if (isLeafMatch) {
    matches.push(root);
    return;
  }

  if (Array.isArray(root.children)) {
    for (const child of root.children) {
      collectMatchingNodes(child, segments, nextAncestors, matches);
    }
  }
}

export async function findNodes(
  payload: ReadRequestPayloadMap["find"]
): Promise<SerializedNode[]> {
  const segments = payload.query
    .toLowerCase()
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) {
    throw new Error("请提供非空的搜索关键词 --query");
  }

  const pageFilter = payload.page?.toLowerCase().trim();
  const targetPages: FigmaPageNode[] = pageFilter
    ? figma.root.children.filter((p) =>
        p.name.toLowerCase().includes(pageFilter)
      )
    : [figma.currentPage];

  const matches: FigmaNode[] = [];
  for (const page of targetPages) {
    if (typeof page.loadAsync === "function") {
      await page.loadAsync();
    }
    if (Array.isArray(page.children)) {
      for (const child of page.children) {
        collectMatchingNodes(
          child,
          segments,
          [page.name.toLowerCase()],
          matches
        );
      }
    }
  }

  const depth = payload.depth ?? 2;
  const includeCss = payload.includeCss ?? false;
  return Promise.all(
    matches
      .slice(0, 20)
      .map((node) => serializeNode(node, { depth, includeCss }))
  );
}
