import type { LocalStylesSummary } from "../protocol/types.ts";
import { roundNumber } from "./color.ts";

const STYLE_WEIGHT_MAP: Record<string, number> = {
  thin: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  book: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
};

export function resolveFontWeight(fontName?: {
  style?: string;
  variationSettings?: Record<string, number>;
}): number | string {
  const wght = fontName?.variationSettings?.wght;
  if (typeof wght === "number") {
    return roundNumber(wght, 0);
  }
  const rawStyle = fontName?.style ?? "";
  const normalized = rawStyle.toLowerCase().replace(/[\s_-]+/g, "");
  for (const [key, val] of Object.entries(STYLE_WEIGHT_MAP)) {
    if (normalized === key) {
      return val;
    }
  }
  return rawStyle || 400;
}

export function formatLineHeight(lineHeight: unknown): string | undefined {
  if (!lineHeight || typeof lineHeight !== "object") {
    return undefined;
  }
  const lh = lineHeight as { unit?: string; value?: number };
  if (!lh.unit || lh.unit === "AUTO" || typeof lh.value !== "number") {
    return undefined;
  }
  const val = roundNumber(lh.value, 2);
  if (val <= 0) {
    return undefined;
  }
  return lh.unit === "PERCENT" ? `${val}%` : `${val}px`;
}

export function formatLetterSpacing(
  letterSpacing: unknown
): string | undefined {
  if (!letterSpacing || typeof letterSpacing !== "object") {
    return undefined;
  }
  const ls = letterSpacing as { unit?: string; value?: number };
  if (typeof ls.value !== "number") {
    return undefined;
  }
  const val = roundNumber(ls.value, 2);
  if (val === 0) {
    return undefined;
  }
  return ls.unit === "PERCENT" ? `${val}%` : `${val}px`;
}

export function formatTextCase(textCase?: string): string | undefined {
  if (!textCase || textCase === "ORIGINAL") {
    return undefined;
  }
  const map: Record<string, string> = {
    UPPER: "uppercase",
    LOWER: "lowercase",
    TITLE: "capitalize",
  };
  return map[textCase] ?? textCase.toLowerCase();
}

export function formatTextDecoration(
  textDecoration?: string
): string | undefined {
  if (!textDecoration || textDecoration === "NONE") {
    return undefined;
  }
  return textDecoration === "STRIKETHROUGH"
    ? "line-through"
    : textDecoration.toLowerCase();
}

export interface CompactTypographyScale {
  fontSize: string;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  textDecoration?: string;
  weights: Array<number | string>;
  overrides?: Record<string, Record<string, string>>;
}

export interface CompactTypographySummary {
  baseFontFamily?: string;
  scales: Record<string, CompactTypographyScale>;
}

export function compactTextStyles(
  styles: LocalStylesSummary["textStyles"],
  matchesFilter: (name: string) => boolean
): CompactTypographySummary | undefined {
  const filtered = styles.filter(
    (s) => matchesFilter(s.name) || matchesFilter(`typography/${s.name}`)
  );
  if (filtered.length === 0) {
    return undefined;
  }

  const familyCounts = new Map<string, number>();
  for (const s of filtered) {
    const fam = s.fontName?.family;
    if (fam) {
      familyCounts.set(fam, (familyCounts.get(fam) ?? 0) + 1);
    }
  }

  let baseFontFamily: string | undefined;
  let maxCount = 0;
  for (const [fam, count] of familyCounts) {
    if (count > maxCount) {
      maxCount = count;
      baseFontFamily = fam;
    }
  }

  const scales: Record<string, CompactTypographyScale> = {};

  for (const style of filtered) {
    const lastSlash = style.name.lastIndexOf("/");
    const scaleKey =
      lastSlash !== -1 ? style.name.slice(0, lastSlash) : style.name;
    const variantKey =
      lastSlash !== -1 ? style.name.slice(lastSlash + 1) : "default";

    const weight = resolveFontWeight(style.fontName);
    const family = style.fontName?.family;
    const lineHeight = formatLineHeight(style.lineHeight);
    const letterSpacing = formatLetterSpacing(style.letterSpacing);
    const textTransform = formatTextCase(style.textCase);
    const textDecoration = formatTextDecoration(style.textDecoration);

    let scale = scales[scaleKey];
    if (!scale) {
      scale = {
        fontSize: `${roundNumber(style.fontSize, 2)}px`,
        weights: [],
      };
      if (family && family !== baseFontFamily) {
        scale.fontFamily = family;
      }
      if (lineHeight) {
        scale.lineHeight = lineHeight;
      }
      if (letterSpacing) {
        scale.letterSpacing = letterSpacing;
      }
      if (textTransform) {
        scale.textTransform = textTransform;
      }
      if (textDecoration) {
        scale.textDecoration = textDecoration;
      }
      scales[scaleKey] = scale;
    }

    if (!scale.weights.includes(weight)) {
      scale.weights.push(weight);
    }

    const expectedFamily = scale.fontFamily ?? baseFontFamily;
    if (family && family !== expectedFamily) {
      if (!scale.overrides) {
        scale.overrides = {};
      }
      scale.overrides[variantKey] = { fontFamily: family };
    }
  }

  return {
    baseFontFamily,
    scales,
  };
}
