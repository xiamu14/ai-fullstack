import type {
  CssEntry,
  LocalStylesSummary,
  ReadRequestPayloadMap,
} from "../../protocol/types.ts";
import type { FigmaNode } from "./figma-types.ts";

export async function resolveTargetNodes(id?: string): Promise<FigmaNode[]> {
  if (id) {
    const normalizedId = id.replace("-", ":");
    const node =
      (await figma.getNodeByIdAsync(id)) ??
      (await figma.getNodeByIdAsync(normalizedId));
    if (!node) {
      throw new Error(`未找到节点: ${id}`);
    }
    return [node];
  }

  const selection = [...figma.currentPage.selection];
  if (selection.length === 0) {
    throw new Error("当前未在 Figma 中选中任何节点，且未指定 --id");
  }
  return selection;
}

export async function readCss(
  payload: ReadRequestPayloadMap["css"]
): Promise<CssEntry[]> {
  const nodes = await resolveTargetNodes(payload.id);
  return Promise.all(
    nodes.map(async (node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      css:
        typeof node.getCSSAsync === "function" ? await node.getCSSAsync() : {},
    }))
  );
}

export async function readLocalStyles(): Promise<LocalStylesSummary> {
  const [paintStyles, textStyles, effectStyles, collections, variables] =
    await Promise.all([
      figma.getLocalPaintStylesAsync(),
      figma.getLocalTextStylesAsync(),
      figma.getLocalEffectStylesAsync(),
      figma.variables
        ? figma.variables.getLocalVariableCollectionsAsync()
        : Promise.resolve([]),
      figma.variables
        ? figma.variables.getLocalVariablesAsync()
        : Promise.resolve([]),
    ]);

  return {
    paintStyles: paintStyles.map((style) => ({
      id: style.id,
      name: style.name,
      description: style.description,
      paints: style.paints,
    })),
    textStyles: textStyles.map((style) => ({
      id: style.id,
      name: style.name,
      description: style.description,
      fontSize: style.fontSize,
      fontName: style.fontName,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textCase: style.textCase,
      textDecoration: style.textDecoration,
    })),
    effectStyles: effectStyles.map((style) => ({
      id: style.id,
      name: style.name,
      description: style.description,
      effects: style.effects,
    })),
    variableCollections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      modes: collection.modes,
      variableIds: collection.variableIds,
    })),
    variables: variables.map((variable) => ({
      id: variable.id,
      name: variable.name,
      resolvedType: variable.resolvedType,
      description: variable.description,
      valuesByMode: variable.valuesByMode,
    })),
  };
}
