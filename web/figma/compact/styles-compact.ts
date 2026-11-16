import type { LocalStylesSummary } from "../protocol/types.ts";
import {
  compactEffects,
  compactPaints,
  formatColor,
  type RgbaColor,
  roundNumber,
} from "./color-compact.ts";
import {
  type CompactTypographySummary,
  compactTextStyles,
} from "./typography-compact.ts";

export interface CompactStylesOutput {
  colors?: Record<
    string,
    Record<string, string | string[]> | string | string[]
  >;
  typography?: CompactTypographySummary;
  effects?: Record<string, string | string[]>;
  variables?: Record<string, Record<string, unknown>>;
}

function createFilterMatcher(filter?: string): (name: string) => boolean {
  if (!filter) {
    return () => true;
  }
  const normalized = filter.toLowerCase().trim();
  if (normalized === "typography" || normalized === "type") {
    return (name: string) => {
      const lower = name.toLowerCase();
      return lower.startsWith("typography/") || lower.startsWith("type/");
    };
  }
  const keywords = normalized.split(/[\s,/]+/).filter(Boolean);
  return (name: string) => {
    const lower = name.toLowerCase();
    return keywords.every((kw) => lower.includes(kw));
  };
}

function setGroupedEntry(
  target: Record<string, Record<string, string | string[]> | string | string[]>,
  fullName: string,
  value: string | string[]
): void {
  const slashIndex = fullName.indexOf("/");
  if (slashIndex === -1) {
    target[fullName] = value;
    return;
  }
  const group = fullName.slice(0, slashIndex).trim();
  const key = fullName.slice(slashIndex + 1).trim();
  const existing = target[group];
  if (!existing || typeof existing === "string" || Array.isArray(existing)) {
    target[group] = { [key]: value };
  } else {
    existing[key] = value;
  }
}

function setNestedVariable(
  target: Record<string, unknown>,
  name: string,
  value: unknown
): void {
  const slashIndex = name.indexOf("/");
  if (slashIndex === -1) {
    target[name] = value;
    return;
  }
  const group = name.slice(0, slashIndex).trim();
  const key = name.slice(slashIndex + 1).trim();
  const existing = target[group];
  if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
    target[group] = { [key]: value };
  } else {
    (existing as Record<string, unknown>)[key] = value;
  }
}

function formatVariableValue(value: unknown): unknown {
  if (typeof value === "number") {
    return roundNumber(value, 2);
  }
  if (
    value &&
    typeof value === "object" &&
    "r" in value &&
    "g" in value &&
    "b" in value
  ) {
    return formatColor(value as RgbaColor);
  }
  return value;
}

export function compactLocalStyles(
  raw: LocalStylesSummary,
  filter?: string
): CompactStylesOutput {
  const matchesFilter = createFilterMatcher(filter);

  const colors: NonNullable<CompactStylesOutput["colors"]> = {};
  for (const style of raw.paintStyles) {
    if (!matchesFilter(`colors/${style.name}`)) {
      continue;
    }
    const painted = compactPaints(style.paints);
    if (painted !== undefined) {
      setGroupedEntry(colors, style.name, painted);
    }
  }

  const typography = compactTextStyles(raw.textStyles, matchesFilter);

  const effects: Record<string, string | string[]> = {};
  for (const style of raw.effectStyles) {
    if (!matchesFilter(`effects/${style.name}`)) {
      continue;
    }
    const compacted = compactEffects(style.effects);
    if (compacted !== undefined) {
      effects[style.name] = compacted;
    }
  }

  const collectionByVarId = new Map<string, string>();
  const modeNameById = new Map<string, string>();
  for (const col of raw.variableCollections) {
    for (const mode of col.modes) {
      modeNameById.set(mode.modeId, mode.name);
    }
    for (const varId of col.variableIds) {
      collectionByVarId.set(varId, col.name);
    }
  }

  const variables: Record<string, Record<string, unknown>> = {};
  for (const variable of raw.variables) {
    const colName = collectionByVarId.get(variable.id) ?? "Default";
    const fullPath = `${colName}/${variable.name}`;
    if (!matchesFilter(fullPath)) {
      continue;
    }
    const modeEntries = Object.entries(variable.valuesByMode);
    let resolved: unknown;
    if (modeEntries.length === 1 && modeEntries[0]) {
      resolved = formatVariableValue(modeEntries[0][1]);
    } else {
      const byModeName: Record<string, unknown> = {};
      for (const [modeId, val] of modeEntries) {
        const modeName = modeNameById.get(modeId) ?? modeId;
        byModeName[modeName] = formatVariableValue(val);
      }
      resolved = byModeName;
    }

    if (!variables[colName]) {
      variables[colName] = {};
    }
    setNestedVariable(variables[colName], variable.name, resolved);
  }

  const result: CompactStylesOutput = {};
  if (Object.keys(colors).length > 0) {
    result.colors = colors;
  }
  if (typography) {
    result.typography = typography;
  }
  if (Object.keys(effects).length > 0) {
    result.effects = effects;
  }
  if (Object.keys(variables).length > 0) {
    result.variables = variables;
  }
  return result;
}
