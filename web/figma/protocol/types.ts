export type ReadAction =
  | "document"
  | "selection"
  | "node"
  | "find"
  | "css"
  | "styles"
  | "export";

export type ExportFormat = "SVG" | "PNG" | "JPG";

export interface ReadRequestPayloadMap {
  document: Record<string, never>;
  selection: {
    depth?: number;
    includeCss?: boolean;
  };
  node: {
    id: string;
    depth?: number;
    includeCss?: boolean;
  };
  find: {
    query: string;
    page?: string;
    depth?: number;
    includeCss?: boolean;
  };
  css: {
    id?: string;
  };
  styles: Record<string, never>;
  export: {
    id?: string;
    format?: ExportFormat;
    scale?: number;
  };
}

export interface BridgeRequest<A extends ReadAction = ReadAction> {
  requestId: string;
  action: A;
  payload: ReadRequestPayloadMap[A];
}

export interface BridgeSuccessResponse<T = unknown> {
  requestId: string;
  ok: true;
  data: T;
}

export interface BridgeErrorResponse {
  requestId: string;
  ok: false;
  error: string;
}

export type BridgeResponse<T = unknown> =
  | BridgeSuccessResponse<T>
  | BridgeErrorResponse;

export interface SerializedBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SerializedLayout {
  mode?: "NONE" | "HORIZONTAL" | "VERTICAL" | "GRID";
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
}

export interface SerializedTextProps {
  characters: string;
  fontSize?: number | "mixed";
  fontName?: { family: string; style: string } | "mixed";
  fontWeight?: number | "mixed";
  lineHeight?: unknown;
  letterSpacing?: unknown;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
}

export interface SerializedNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  opacity?: number;
  bounds?: SerializedBoundingBox | null;
  layout?: SerializedLayout;
  fills?: unknown;
  strokes?: unknown;
  strokeWeight?: number | "mixed";
  cornerRadius?: number | "mixed";
  effects?: unknown;
  text?: SerializedTextProps;
  componentId?: string;
  componentProperties?: unknown;
  css?: Record<string, string>;
  children?: SerializedNode[];
  childCount?: number;
}

export interface DocumentSummary {
  documentName: string;
  fileKey: string | null;
  currentPage: {
    id: string;
    name: string;
    selectionCount: number;
  };
  pages: Array<{
    id: string;
    name: string;
    current?: boolean;
  }>;
}

export interface CssEntry {
  id: string;
  name: string;
  type: string;
  css: Record<string, string>;
}

export interface LocalStylesSummary {
  paintStyles: Array<{
    id: string;
    name: string;
    description: string;
    paints: unknown;
  }>;
  textStyles: Array<{
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
  }>;
  effectStyles: Array<{
    id: string;
    name: string;
    description: string;
    effects: unknown;
  }>;
  variableCollections: Array<{
    id: string;
    name: string;
    modes: Array<{ modeId: string; name: string }>;
    variableIds: string[];
  }>;
  variables: Array<{
    id: string;
    name: string;
    resolvedType: string;
    description: string;
    valuesByMode: Record<string, unknown>;
  }>;
}

export interface ExportedAssetItem {
  id: string;
  name: string;
  format: ExportFormat;
  base64: string;
}
