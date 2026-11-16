export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  opacity?: number;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL" | "GRID";
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  itemSpacing?: number;
  counterAxisSpacing?: number | null;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  fills?: unknown;
  strokes?: unknown;
  strokeWeight?: unknown;
  cornerRadius?: unknown;
  effects?: unknown;
  characters?: string;
  fontSize?: unknown;
  fontName?: unknown;
  fontWeight?: unknown;
  lineHeight?: unknown;
  letterSpacing?: unknown;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  mainComponent?: { id: string } | null;
  componentProperties?: unknown;
  children?: readonly FigmaNode[];
  parent?: FigmaNode | null;
  fillStyleId?: string | symbol;
  strokeStyleId?: string | symbol;
  textStyleId?: string | symbol;
  effectStyleId?: string | symbol;
  getMainComponentAsync?: () => Promise<FigmaNode | null>;
  getCSSAsync?: () => Promise<Record<string, string>>;
  exportAsync?: (settings: {
    format: "SVG" | "PNG" | "JPG";
    constraint?: { type: "SCALE"; value: number };
  }) => Promise<Uint8Array>;
}

export interface FigmaPageNode extends FigmaNode {
  selection: readonly FigmaNode[];
  loadAsync?: () => Promise<void>;
}

export interface FigmaRootNode extends FigmaNode {
  children: readonly FigmaPageNode[];
}

export interface FigmaGlobal {
  root: FigmaRootNode;
  fileKey?: string;
  currentPage: FigmaPageNode;
  mixed: symbol;
  showUI: (
    html: string,
    options?: { width?: number; height?: number; themeColors?: boolean }
  ) => void;
  ui: {
    postMessage: (pluginMessage: unknown) => void;
    onmessage?: (pluginMessage: unknown) => void;
  };
  getNodeByIdAsync: (id: string) => Promise<FigmaNode | null>;
  getStyleByIdAsync: (id: string) => Promise<{ name: string } | null>;
  getLocalPaintStylesAsync: () => Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      paints: unknown;
    }>
  >;
  getLocalTextStylesAsync: () => Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      fontSize: number;
      fontName: {
        family: string;
        style: string;
        variationSettings?: Record<string, number>;
      };
      lineHeight?: unknown;
      letterSpacing?: unknown;
      textCase?: string;
      textDecoration?: string;
    }>
  >;
  getLocalEffectStylesAsync: () => Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      effects: unknown;
    }>
  >;
  variables?: {
    getLocalVariableCollectionsAsync: () => Promise<
      Array<{
        id: string;
        name: string;
        modes: Array<{ modeId: string; name: string }>;
        variableIds: string[];
      }>
    >;
    getLocalVariablesAsync: () => Promise<
      Array<{
        id: string;
        name: string;
        resolvedType: string;
        description: string;
        valuesByMode: Record<string, unknown>;
      }>
    >;
  };
}

declare global {
  const figma: FigmaGlobal;
  const __html__: string;
}
