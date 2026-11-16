import {
  type CompactStylesOutput,
  compactLocalStyles,
} from "../compact/styles-compact.ts";
import type { LocalStylesSummary } from "../protocol/types.ts";
import {
  fetchRawLocalStyles,
  type ReadStylesOptions,
} from "./color-style-reader.ts";

export async function fetchTypographyStyles(
  options: ReadStylesOptions = {}
): Promise<LocalStylesSummary | CompactStylesOutput> {
  const rawData = await fetchRawLocalStyles({
    refresh: options.refresh,
    port: options.port,
  });
  if (options.raw) {
    return rawData;
  }
  return compactLocalStyles(rawData, options.filter ?? "typography");
}
