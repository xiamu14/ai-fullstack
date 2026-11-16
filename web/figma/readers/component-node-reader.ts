import { queryFigma } from "../bridge/client.ts";
import {
  type CompactNode,
  compactNode,
} from "../compact/component-node-compact.ts";
import type { CssEntry, SerializedNode } from "../protocol/types.ts";

export interface ReadComponentNodeOptions {
  id?: string;
  query?: string;
  page?: string;
  depth?: number;
  includeCss?: boolean;
  raw?: boolean;
  port?: number;
}

function cssEntryToInstanceNode(entry: CssEntry): SerializedNode {
  const w = Number.parseFloat(entry.css.width ?? "0") || 20;
  const h = Number.parseFloat(entry.css.height ?? "0") || 20;
  return {
    id: entry.id,
    name: entry.name,
    type: entry.type,
    visible: true,
    bounds: { x: 0, y: 0, width: w, height: h },
    css: entry.css,
  };
}

async function populateChildrenFallback(
  parent: SerializedNode,
  depth: number,
  includeCss: boolean,
  port?: number
): Promise<{ node: SerializedNode; maxOffsetUsed: number }> {
  const childCount = parent.childCount ?? 0;
  if (depth <= 0 || childCount <= 0) {
    return { node: parent, maxOffsetUsed: 0 };
  }

  const colonIdx = parent.id.indexOf(":");
  if (colonIdx === -1) {
    return { node: parent, maxOffsetUsed: 0 };
  }
  const prefix = parent.id.slice(0, colonIdx);
  const startNum = Number.parseInt(parent.id.slice(colonIdx + 1), 10);
  if (Number.isNaN(startNum)) {
    return { node: parent, maxOffsetUsed: 0 };
  }

  const children: SerializedNode[] = [];
  let offset = 1;
  const maxProbe = Math.max(childCount * 4, 10);

  while (children.length < childCount && offset <= maxProbe) {
    const candidateId = `${prefix}:${startNum + offset}`;
    try {
      const cssEntries = await queryFigma<CssEntry[]>(
        "css",
        { id: candidateId },
        { port }
      );
      const entry = cssEntries[0];
      if (!entry) {
        offset += 1;
        continue;
      }

      if (entry.type === "INSTANCE") {
        children.push(cssEntryToInstanceNode(entry));
        offset += 1;
      } else {
        const subRoot = await queryFigma<SerializedNode>(
          "node",
          { id: candidateId, depth: 0, includeCss: false },
          { port }
        );
        subRoot.css = entry.css;
        const subResult = await populateChildrenFallback(
          subRoot,
          depth - 1,
          includeCss,
          port
        );
        children.push(subResult.node);
        offset += 1 + subResult.maxOffsetUsed;
      }
    } catch {
      offset += 1;
    }
  }

  parent.children = children;
  return { node: parent, maxOffsetUsed: offset - 1 };
}

export async function fetchSelectionNodes(
  options: ReadComponentNodeOptions = {}
): Promise<SerializedNode[] | CompactNode[]> {
  const depth = options.depth ?? 3;
  const includeCss = options.includeCss ?? true;
  let data: SerializedNode[];

  try {
    data = await queryFigma<SerializedNode[]>(
      "selection",
      { depth, includeCss },
      { port: options.port }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes("get_mainComponent")) {
      throw error;
    }
    const roots = await queryFigma<SerializedNode[]>(
      "selection",
      { depth: 0, includeCss },
      { port: options.port }
    );
    data = [];
    for (const root of roots) {
      const populated = await populateChildrenFallback(
        root,
        depth,
        includeCss,
        options.port
      );
      data.push(populated.node);
    }
  }

  return options.raw
    ? data
    : data
        .map((n) => compactNode(n))
        .filter((n): n is CompactNode => n !== null);
}

export async function fetchNodeById(
  options: ReadComponentNodeOptions & { id: string }
): Promise<SerializedNode | CompactNode | null> {
  const depth = options.depth ?? 3;
  const includeCss = options.includeCss ?? true;
  let data: SerializedNode;

  try {
    data = await queryFigma<SerializedNode>(
      "node",
      { id: options.id, depth, includeCss },
      { port: options.port }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes("get_mainComponent")) {
      throw error;
    }
    const root = await queryFigma<SerializedNode>(
      "node",
      { id: options.id, depth: 0, includeCss },
      { port: options.port }
    );
    const populated = await populateChildrenFallback(
      root,
      depth,
      includeCss,
      options.port
    );
    data = populated.node;
  }

  return options.raw ? data : compactNode(data);
}

export async function fetchMatchingNodes(
  options: ReadComponentNodeOptions & { query: string }
): Promise<SerializedNode[] | CompactNode[]> {
  const data = await queryFigma<SerializedNode[]>(
    "find",
    {
      query: options.query,
      page: options.page,
      depth: options.depth ?? 2,
      includeCss: options.includeCss ?? false,
    },
    { port: options.port }
  );
  return options.raw
    ? data
    : data
        .map((n) => compactNode(n))
        .filter((n): n is CompactNode => n !== null);
}

export async function fetchNodeCss(options: {
  id?: string;
  port?: number;
}): Promise<CssEntry[]> {
  return queryFigma<CssEntry[]>(
    "css",
    { id: options.id },
    { port: options.port }
  );
}
