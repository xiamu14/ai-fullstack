import type {
  SerializedLayout,
  SerializedNode,
  SerializedTextProps,
} from "../protocol/types.ts";
import { compactEffects, compactPaints, roundNumber } from "./color.ts";
import { formatLetterSpacing, formatLineHeight } from "./typography.ts";

export interface CompactNode {
  id: string;
  name: string;
  type: string;
  size?: string;
  opacity?: number;
  layout?: Record<string, unknown>;
  bg?: string | string[];
  border?: string;
  radius?: number | "mixed";
  shadow?: string | string[];
  text?: Record<string, unknown>;
  css?: Record<string, string>;
  children?: CompactNode[];
  childCount?: number;
}

function formatPadding(layout: SerializedLayout): string | number | undefined {
  const t = roundNumber(layout.paddingTop ?? 0);
  const r = roundNumber(layout.paddingRight ?? 0);
  const b = roundNumber(layout.paddingBottom ?? 0);
  const l = roundNumber(layout.paddingLeft ?? 0);
  if (t === 0 && r === 0 && b === 0 && l === 0) {
    return undefined;
  }
  if (t === r && r === b && b === l) {
    return t;
  }
  if (t === b && l === r) {
    return `${t}px ${r}px`;
  }
  return `${t}px ${r}px ${b}px ${l}px`;
}

function compactLayout(
  layout?: SerializedLayout
): Record<string, unknown> | undefined {
  if (!layout) {
    return undefined;
  }
  const out: Record<string, unknown> = {};
  if (layout.mode && layout.mode !== "NONE") {
    out.dir =
      layout.mode === "HORIZONTAL"
        ? "row"
        : layout.mode === "VERTICAL"
          ? "col"
          : layout.mode.toLowerCase();
  }
  if (
    (layout.primaryAxisAlignItems && layout.primaryAxisAlignItems !== "MIN") ||
    (layout.counterAxisAlignItems && layout.counterAxisAlignItems !== "MIN")
  ) {
    out.align = `${layout.primaryAxisAlignItems ?? "MIN"}/${layout.counterAxisAlignItems ?? "MIN"}`;
  }
  if (typeof layout.itemSpacing === "number" && layout.itemSpacing > 0) {
    out.gap = roundNumber(layout.itemSpacing);
  }
  const pad = formatPadding(layout);
  if (pad !== undefined) {
    out.pad = pad;
  }
  if (
    (layout.layoutSizingHorizontal &&
      layout.layoutSizingHorizontal !== "FIXED") ||
    (layout.layoutSizingVertical && layout.layoutSizingVertical !== "FIXED")
  ) {
    out.sizing = `${layout.layoutSizingHorizontal ?? "FIXED"}/${layout.layoutSizingVertical ?? "FIXED"}`;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function compactText(
  text?: SerializedTextProps,
  fills?: unknown
): Record<string, unknown> | undefined {
  if (!text) {
    return undefined;
  }
  const out: Record<string, unknown> = {
    content: text.characters,
  };
  const family =
    text.fontName && typeof text.fontName === "object"
      ? text.fontName.family
      : undefined;
  const size =
    typeof text.fontSize === "number"
      ? `${roundNumber(text.fontSize)}px`
      : text.fontSize;
  const weight = text.fontWeight;
  out.font = [family, size, weight].filter(Boolean).join(" · ");

  const lineHeight = formatLineHeight(text.lineHeight);
  if (lineHeight) {
    out.lineHeight = lineHeight;
  }
  const letterSpacing = formatLetterSpacing(text.letterSpacing);
  if (letterSpacing) {
    out.letterSpacing = letterSpacing;
  }

  const color = compactPaints(fills);
  if (color) {
    out.color = color;
  }
  if (text.textAlignHorizontal && text.textAlignHorizontal !== "LEFT") {
    out.align = text.textAlignHorizontal.toLowerCase();
  }
  return out;
}

export function compactNode(node: SerializedNode): CompactNode | null {
  if (node.visible === false) {
    return null;
  }

  const out: CompactNode = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  if (node.bounds) {
    out.size = `${Math.round(node.bounds.width)}x${Math.round(node.bounds.height)}`;
  }

  if (typeof node.opacity === "number" && node.opacity < 1) {
    out.opacity = roundNumber(node.opacity, 2);
  }

  const layout = compactLayout(node.layout);
  if (layout) {
    out.layout = layout;
  }

  if (node.type === "TEXT") {
    const text = compactText(node.text, node.fills);
    if (text) {
      out.text = text;
    }
  } else {
    const bg = compactPaints(node.fills);
    if (bg) {
      out.bg = bg;
    }
  }

  const strokeColor = compactPaints(node.strokes);
  if (strokeColor && node.strokeWeight && node.strokeWeight !== 0) {
    const weight =
      typeof node.strokeWeight === "number"
        ? `${roundNumber(node.strokeWeight)}px`
        : "mixed";
    const colorStr = Array.isArray(strokeColor)
      ? strokeColor.join(", ")
      : strokeColor;
    out.border = `${weight} solid ${colorStr}`;
  }

  if (
    node.cornerRadius !== undefined &&
    node.cornerRadius !== 0 &&
    node.cornerRadius !== "mixed"
  ) {
    out.radius = roundNumber(node.cornerRadius);
  } else if (node.cornerRadius === "mixed") {
    out.radius = "mixed";
  }

  const shadow = compactEffects(node.effects);
  if (shadow) {
    out.shadow = shadow;
  }

  if (node.css && Object.keys(node.css).length > 0) {
    out.css = node.css;
  }

  if (Array.isArray(node.children)) {
    const children = node.children
      .map((child) => compactNode(child))
      .filter((child): child is CompactNode => child !== null);
    if (children.length > 0) {
      out.children = children;
    }
  } else if (typeof node.childCount === "number" && node.childCount > 0) {
    out.childCount = node.childCount;
  }

  return out;
}
