import type {
  SerializedLayout,
  SerializedNode,
  SerializedTextProps,
} from "../../protocol/types.ts";
import type { FigmaNode, FigmaPageNode } from "./figma-types.ts";

export interface SerializeOptions {
  depth: number;
  includeCss: boolean;
}

function normalizeMixed<T>(value: unknown): T | "mixed" | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "symbol" || value === figma.mixed) {
    return "mixed";
  }
  return value as T;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (value === undefined || typeof value === "symbol") {
    return typeof value === "symbol" ? "mixed" : undefined;
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonValue(item));
  }
  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== "function" && typeof entry !== "symbol") {
      output[key] = sanitizeJsonValue(entry);
    }
  }
  return output;
}

function extractLayout(node: FigmaNode): SerializedLayout | undefined {
  if (!node.layoutMode || node.layoutMode === "NONE") {
    if (!node.layoutSizingHorizontal && !node.layoutSizingVertical) {
      return undefined;
    }
  }
  return {
    mode: node.layoutMode,
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    itemSpacing: node.itemSpacing,
    counterAxisSpacing: node.counterAxisSpacing,
    layoutSizingHorizontal: node.layoutSizingHorizontal,
    layoutSizingVertical: node.layoutSizingVertical,
  };
}

function extractText(node: FigmaNode): SerializedTextProps | undefined {
  if (node.type !== "TEXT" || typeof node.characters !== "string") {
    return undefined;
  }
  return {
    characters: node.characters,
    fontSize: normalizeMixed<number>(node.fontSize),
    fontName: normalizeMixed<{ family: string; style: string }>(node.fontName),
    fontWeight: normalizeMixed<number>(node.fontWeight),
    lineHeight: sanitizeJsonValue(node.lineHeight),
    letterSpacing: sanitizeJsonValue(node.letterSpacing),
    textAlignHorizontal: node.textAlignHorizontal,
    textAlignVertical: node.textAlignVertical,
  };
}

export async function serializeNode(
  node: FigmaNode,
  options: SerializeOptions
): Promise<SerializedNode> {
  const serialized: SerializedNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible ?? true,
    opacity: node.opacity,
    bounds: node.absoluteBoundingBox ?? null,
    layout: extractLayout(node),
    fills: sanitizeJsonValue(node.fills),
    strokes: sanitizeJsonValue(node.strokes),
    strokeWeight: normalizeMixed<number>(node.strokeWeight),
    cornerRadius: normalizeMixed<number>(node.cornerRadius),
    effects: sanitizeJsonValue(node.effects),
    text: extractText(node),
  };

  if (node.type === "INSTANCE") {
    try {
      serialized.componentProperties = sanitizeJsonValue(
        node.componentProperties
      );
    } catch {
      // Ignore component property errors on broken/unloaded instances
    }
  }

  if (options.includeCss && typeof node.getCSSAsync === "function") {
    try {
      serialized.css = await node.getCSSAsync();
    } catch {
      // Ignore nodes that do not support CSS extraction
    }
  }

  if (node.type === "PAGE" && options.depth > 0) {
    const pageNode = node as FigmaPageNode;
    if (typeof pageNode.loadAsync === "function") {
      await pageNode.loadAsync();
    }
  }

  if (node.type !== "PAGE" || options.depth > 0) {
    if (Array.isArray(node.children)) {
      serialized.childCount = node.children.length;
      if (options.depth > 0) {
        const nextOptions: SerializeOptions = {
          depth: options.depth - 1,
          includeCss: options.includeCss,
        };
        serialized.children = await Promise.all(
          node.children.map((child) => serializeNode(child, nextOptions))
        );
      }
    }
  }

  return serialized;
}
