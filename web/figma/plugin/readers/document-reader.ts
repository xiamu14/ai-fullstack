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

function normalizeSearchKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b([a-z]{3,})s\b/g, "$1")
    .trim();
}

function collectMatchingNodes(
  root: FigmaNode,
  segments: string[],
  ancestors: string[],
  matches: FigmaNode[]
): void {
  if (root.visible === false) {
    return;
  }
  const normalizedName = normalizeSearchKey(root.name);
  const nextAncestors = [...ancestors, normalizedName];
  const fullPath = nextAncestors.join("/");
  const leafTarget = segments[segments.length - 1] ?? "";

  const isLeafMatch =
    normalizedName.includes(leafTarget) &&
    segments.every((seg) => fullPath.includes(seg));

  if (isLeafMatch) {
    // 如果命中了 COMPONENT_SET（变体集合），优先取其第一个默认子 COMPONENT
    if (
      root.type === "COMPONENT_SET" &&
      Array.isArray(root.children) &&
      root.children.length > 0 &&
      root.children[0]
    ) {
      matches.push(root.children[0]);
      return;
    }
    matches.push(root);
    return;
  }

  if (Array.isArray(root.children)) {
    for (const child of root.children) {
      collectMatchingNodes(child, segments, nextAncestors, matches);
    }
  }
}

export async function searchFigmaNodes(
  query: string,
  pageFilter?: string
): Promise<FigmaNode[]> {
  const segments = query
    .split("/")
    .map((s) => normalizeSearchKey(s))
    .filter(Boolean);
  if (segments.length === 0) {
    throw new Error("请提供非空的搜索关键词 --query");
  }

  const normalizedPageFilter = pageFilter?.toLowerCase().trim();
  const initialPages: FigmaPageNode[] = normalizedPageFilter
    ? figma.root.children.filter((p) =>
        p.name.toLowerCase().includes(normalizedPageFilter)
      )
    : [figma.currentPage];

  const matches: FigmaNode[] = [];

  async function searchPages(pages: readonly FigmaPageNode[]): Promise<void> {
    for (const page of pages) {
      if (typeof page.loadAsync === "function") {
        await page.loadAsync();
      }
      if (Array.isArray(page.children)) {
        for (const child of page.children) {
          collectMatchingNodes(
            child,
            segments,
            [normalizeSearchKey(page.name)],
            matches
          );
        }
      }
    }
  }

  await searchPages(initialPages);

  // 当前页未找到且未限定页面时，自动遍历其余页面查找
  if (matches.length === 0 && !normalizedPageFilter) {
    const remainingPages = figma.root.children.filter(
      (p) => p.id !== figma.currentPage.id
    );
    await searchPages(remainingPages);
  }

  // 精确名称匹配优先排序
  const leafTarget = segments[segments.length - 1] ?? "";
  matches.sort((a, b) => {
    const aExact = normalizeSearchKey(a.name) === leafTarget ? 0 : 1;
    const bExact = normalizeSearchKey(b.name) === leafTarget ? 0 : 1;
    return aExact - bExact;
  });

  return matches;
}

export async function findNodes(
  payload: ReadRequestPayloadMap["find"]
): Promise<SerializedNode[]> {
  const matches = await searchFigmaNodes(payload.query, payload.page);
  const depth = payload.depth ?? 2;
  const includeCss = payload.includeCss ?? false;
  return Promise.all(
    matches
      .slice(0, 20)
      .map((node) => serializeNode(node, { depth, includeCss }))
  );
}
