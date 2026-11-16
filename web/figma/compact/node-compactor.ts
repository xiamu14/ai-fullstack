import type {
  SerializedLayout,
  SerializedNode,
  SerializedTextProps,
} from "../protocol/types.ts";
import { compactEffects, compactPaints, roundNumber } from "./color.ts";
import { formatLetterSpacing, formatLineHeight } from "./typography.ts";

export interface CompactNode {
  id: string;
  name?: string;
  type: string;
  slot?: "icon" | "text" | "container";
  variants?: Record<string, string>;
  size?: string;
  opacity?: number;
  layout?: Record<string, unknown>;
  bg?: string | string[];
  border?: string;
  radius?: number | "mixed";
  shadow?: string | string[];
  text?: Record<string, unknown>;
  tokens?: Record<string, string>;
  children?: CompactNode[];
  childCount?: number;
}

function parseVariantProps(name: string): Record<string, string> | undefined {
  if (!name.includes("=")) {
    return undefined;
  }
  const pairs = name.split(",").map((part) => part.trim());
  const variants: Record<string, string> = {};
  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) {
      return undefined;
    }
    const key = pair.slice(0, eqIdx).trim();
    const val = pair.slice(eqIdx + 1).trim();
    if (!key || !val) {
      return undefined;
    }
    variants[key] = val;
  }
  return Object.keys(variants).length > 0 ? variants : undefined;
}

function cleanCssTokens(
  css?: Record<string, string>
): Record<string, string> | undefined {
  if (!css) {
    return undefined;
  }
  const out: Record<string, string> = {};
  for (const [key, rawVal] of Object.entries(css)) {
    // 剔除无意义的默认 CSS 属性
    if (
      (key === "font-style" && rawVal === "normal") ||
      (key === "letter-spacing" &&
        (rawVal === "0" || rawVal.endsWith(", 0)") || rawVal === "0px"))
    ) {
      continue;
    }
    // 去除 Figma 附带的 /* 142.857% */ 注释噪音
    const cleaned = rawVal.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    // 仅保留带有 CSS 变量 var(--...) 的关键设计 Token 映射，避免与基础属性重复
    if (cleaned.includes("var(--")) {
      out[key] = cleaned;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
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

  const variants = parseVariantProps(node.name);
  const out: CompactNode = {
    id: node.id,
    type: node.type,
  };

  if (variants) {
    out.variants = variants;
  } else {
    out.name = node.name;
  }

  if (node.type === "INSTANCE") {
    out.slot = "icon";
  } else if (node.type === "TEXT") {
    out.slot = "text";
  }

  // 文本节点的宽高由内容自适应，省略固定像素尺寸防止 AI 误写死 width/height
  if (node.bounds && node.type !== "TEXT") {
    out.size = `${Math.round(node.bounds.width)}x${Math.round(node.bounds.height)}`;
  }

  if (typeof node.opacity === "number" && node.opacity < 1) {
    out.opacity = roundNumber(node.opacity, 2);
  }

  const layout = node.type === "TEXT" ? undefined : compactLayout(node.layout);
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

  const tokens = cleanCssTokens(node.css);
  if (tokens) {
    out.tokens = tokens;
  }

  // 对图标实例节点 (INSTANCE) 不再展开底层 Vector 路径，减少无意义噪音
  if (node.type !== "INSTANCE" && Array.isArray(node.children)) {
    const children = node.children
      .map((child) => compactNode(child))
      .filter((child): child is CompactNode => child !== null);
    if (children.length > 0) {
      out.children = children;
    }
  } else if (
    node.type !== "INSTANCE" &&
    typeof node.childCount === "number" &&
    node.childCount > 0
  ) {
    out.childCount = node.childCount;
  }

  return out;
}
