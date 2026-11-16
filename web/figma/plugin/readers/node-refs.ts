import type {
  SerializedComponentRef,
  SerializedStyleRefs,
} from "../../protocol/types.ts";
import type { FigmaNode } from "./figma-types.ts";

const styleNameCache = new Map<string, string | null>();

async function resolveStyleName(
  styleId: string | symbol | undefined
): Promise<string | undefined> {
  if (typeof styleId !== "string" || styleId.length === 0) {
    return undefined;
  }
  if (!styleNameCache.has(styleId)) {
    try {
      const style = await figma.getStyleByIdAsync(styleId);
      styleNameCache.set(styleId, style?.name ?? null);
    } catch {
      styleNameCache.set(styleId, null);
    }
  }
  return styleNameCache.get(styleId) ?? undefined;
}

export async function readStyleRefs(
  node: FigmaNode
): Promise<SerializedStyleRefs | undefined> {
  const [fill, stroke, text, effect] = await Promise.all([
    resolveStyleName(node.fillStyleId),
    resolveStyleName(node.strokeStyleId),
    resolveStyleName(node.textStyleId),
    resolveStyleName(node.effectStyleId),
  ]);
  const refs: SerializedStyleRefs = {};
  if (fill) refs.fill = fill;
  if (stroke) refs.stroke = stroke;
  if (text) refs.text = text;
  if (effect) refs.effect = effect;
  return Object.keys(refs).length > 0 ? refs : undefined;
}

export async function readComponentRef(
  node: FigmaNode
): Promise<SerializedComponentRef | undefined> {
  if (node.type !== "INSTANCE" || !node.getMainComponentAsync) {
    return undefined;
  }
  try {
    const main = await node.getMainComponentAsync();
    if (!main) {
      return undefined;
    }
    const parent = main.parent;
    if (parent && parent.type === "COMPONENT_SET") {
      return { name: parent.name, variant: main.name };
    }
    return { name: main.name };
  } catch {
    return undefined;
  }
}
