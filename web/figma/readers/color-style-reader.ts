import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { queryFigma } from "../bridge/client.ts";
import {
  type CompactStylesOutput,
  compactLocalStyles,
} from "../compact/styles-compact.ts";
import type { LocalStylesSummary } from "../protocol/types.ts";

const STYLES_CACHE_PATH = resolve(import.meta.dirname, "../.cache/styles.json");

export interface ReadStylesOptions {
  filter?: string;
  raw?: boolean;
  refresh?: boolean;
  port?: number;
}

async function readCachedStyles(): Promise<LocalStylesSummary | null> {
  try {
    const content = await readFile(STYLES_CACHE_PATH, "utf8");
    return JSON.parse(content) as LocalStylesSummary;
  } catch {
    return null;
  }
}

async function writeCachedStyles(data: LocalStylesSummary): Promise<void> {
  try {
    await mkdir(dirname(STYLES_CACHE_PATH), { recursive: true });
    await writeFile(STYLES_CACHE_PATH, JSON.stringify(data), "utf8");
  } catch {
    // Ignore cache write errors
  }
}

export async function fetchRawLocalStyles(options: {
  refresh?: boolean;
  port?: number;
}): Promise<LocalStylesSummary> {
  if (!options.refresh) {
    const cached = await readCachedStyles();
    if (cached) {
      return cached;
    }
  }
  const fresh = await queryFigma<LocalStylesSummary>(
    "styles",
    {},
    { port: options.port }
  );
  await writeCachedStyles(fresh);
  return fresh;
}

export async function fetchLocalStyles(
  options: ReadStylesOptions = {}
): Promise<LocalStylesSummary | CompactStylesOutput> {
  const rawData = await fetchRawLocalStyles({
    refresh: options.refresh,
    port: options.port,
  });
  return options.raw ? rawData : compactLocalStyles(rawData, options.filter);
}
