(() => {
  // figma/plugin/readers/node-refs.ts
  var styleNameCache = new Map;
  async function resolveStyleName(styleId) {
    if (typeof styleId !== "string" || styleId.length === 0) {
      return;
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
  async function readStyleRefs(node) {
    const [fill, stroke, text, effect] = await Promise.all([
      resolveStyleName(node.fillStyleId),
      resolveStyleName(node.strokeStyleId),
      resolveStyleName(node.textStyleId),
      resolveStyleName(node.effectStyleId)
    ]);
    const refs = {};
    if (fill)
      refs.fill = fill;
    if (stroke)
      refs.stroke = stroke;
    if (text)
      refs.text = text;
    if (effect)
      refs.effect = effect;
    return Object.keys(refs).length > 0 ? refs : undefined;
  }
  async function readComponentRef(node) {
    if (node.type !== "INSTANCE" || !node.getMainComponentAsync) {
      return;
    }
    try {
      const main = await node.getMainComponentAsync();
      if (!main) {
        return;
      }
      const parent = main.parent;
      if (parent && parent.type === "COMPONENT_SET") {
        return { name: parent.name, variant: main.name };
      }
      return { name: main.name };
    } catch {
      return;
    }
  }

  // figma/plugin/readers/node-serializer.ts
  var VECTOR_LEAF_TYPES = new Set([
    "VECTOR",
    "BOOLEAN_OPERATION",
    "STAR",
    "LINE",
    "ELLIPSE",
    "POLYGON"
  ]);
  function normalizeMixed(value) {
    if (value === undefined) {
      return;
    }
    if (typeof value === "symbol" || value === figma.mixed) {
      return "mixed";
    }
    return value;
  }
  function sanitizeJsonValue(value) {
    if (value === undefined || typeof value === "symbol") {
      return typeof value === "symbol" ? "mixed" : undefined;
    }
    if (value === null || typeof value !== "object") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeJsonValue(item));
    }
    const output = {};
    for (const [key, entry] of Object.entries(value)) {
      if (typeof entry !== "function" && typeof entry !== "symbol") {
        output[key] = sanitizeJsonValue(entry);
      }
    }
    return output;
  }
  function extractLayout(node) {
    if (!node.layoutMode || node.layoutMode === "NONE") {
      if (!node.layoutSizingHorizontal && !node.layoutSizingVertical) {
        return;
      }
    }
    return {
      mode: node.layoutMode,
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      counterAxisAlignItems: node.counterAxisAlignItems,
      paddingTop: node.paddingTop,
      paddingRight: node.paddingRight,
      paddingBottom: node.paddingBottom,
      paddingLeft: node.paddingLeft,
      itemSpacing: node.itemSpacing,
      counterAxisSpacing: node.counterAxisSpacing,
      layoutSizingHorizontal: node.layoutSizingHorizontal,
      layoutSizingVertical: node.layoutSizingVertical
    };
  }
  function extractText(node) {
    if (node.type !== "TEXT" || typeof node.characters !== "string") {
      return;
    }
    return {
      characters: node.characters,
      fontSize: normalizeMixed(node.fontSize),
      fontName: normalizeMixed(node.fontName),
      fontWeight: normalizeMixed(node.fontWeight),
      lineHeight: sanitizeJsonValue(node.lineHeight),
      letterSpacing: sanitizeJsonValue(node.letterSpacing),
      textAlignHorizontal: node.textAlignHorizontal,
      textAlignVertical: node.textAlignVertical
    };
  }
  async function serializeNode(node, options) {
    const serialized = {
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible ?? true,
      opacity: node.opacity,
      bounds: node.absoluteBoundingBox ?? null,
      layout: extractLayout(node),
      fills: sanitizeJsonValue(node.fills),
      strokes: sanitizeJsonValue(node.strokes),
      strokeWeight: normalizeMixed(node.strokeWeight),
      cornerRadius: normalizeMixed(node.cornerRadius),
      effects: sanitizeJsonValue(node.effects),
      text: extractText(node)
    };
    if (node.type === "INSTANCE") {
      try {
        serialized.componentProperties = sanitizeJsonValue(node.componentProperties);
      } catch {}
      serialized.component = await readComponentRef(node);
    }
    serialized.styles = await readStyleRefs(node);
    if (options.includeCss && typeof node.getCSSAsync === "function") {
      try {
        serialized.css = await node.getCSSAsync();
      } catch {}
    }
    if (node.type === "PAGE" && options.depth > 0) {
      const pageNode = node;
      if (typeof pageNode.loadAsync === "function") {
        await pageNode.loadAsync();
      }
    }
    const isVectorLeaf = VECTOR_LEAF_TYPES.has(node.type);
    const isHidden = node.visible === false;
    if (!isVectorLeaf && !isHidden && (node.type !== "PAGE" || options.depth > 0)) {
      if (Array.isArray(node.children)) {
        serialized.childCount = node.children.length;
        if (options.depth > 0) {
          const nextOptions = {
            depth: options.depth - 1,
            includeCss: options.includeCss
          };
          serialized.children = await Promise.all(node.children.map((child) => serializeNode(child, nextOptions)));
        }
      }
    }
    return serialized;
  }

  // figma/plugin/readers/document-reader.ts
  function readDocumentSummary() {
    const currentPage = figma.currentPage;
    return {
      documentName: figma.root.name,
      fileKey: figma.fileKey ?? null,
      currentPage: {
        id: currentPage.id,
        name: currentPage.name,
        selectionCount: currentPage.selection.length
      },
      pages: figma.root.children.map((page) => ({
        id: page.id,
        name: page.name,
        current: page.id === currentPage.id ? true : undefined
      }))
    };
  }
  async function readSelection(payload) {
    const depth = payload.depth ?? 2;
    const includeCss = payload.includeCss ?? false;
    const selection = figma.currentPage.selection;
    return Promise.all(selection.map((node) => serializeNode(node, { depth, includeCss })));
  }
  async function readNodeById(payload) {
    const normalizedId = payload.id.replace("-", ":");
    const node = await figma.getNodeByIdAsync(payload.id) ?? await figma.getNodeByIdAsync(normalizedId);
    if (!node) {
      throw new Error(`未找到节点: ${payload.id}`);
    }
    return serializeNode(node, {
      depth: payload.depth ?? 2,
      includeCss: payload.includeCss ?? false
    });
  }
  function normalizeSearchKey(text) {
    return text.toLowerCase().replace(/[\s_-]+/g, " ").replace(/\b([a-z]{3,})s\b/g, "$1").trim();
  }
  function collectMatchingNodes(root, segments, ancestors, matches, options) {
    if (root.visible === false) {
      return;
    }
    const normalizedName = normalizeSearchKey(root.name);
    const nextAncestors = [...ancestors, normalizedName];
    const fullPath = nextAncestors.join("/");
    const leafTarget = segments[segments.length - 1] ?? "";
    const leafHit = options.exact ? normalizedName === leafTarget : normalizedName.includes(leafTarget);
    const isLeafMatch = leafHit && segments.every((seg) => fullPath.includes(seg));
    if (isLeafMatch) {
      if (!options.keepSets && root.type === "COMPONENT_SET" && Array.isArray(root.children) && root.children[0]) {
        matches.push(root.children[0]);
        return;
      }
      matches.push(root);
      return;
    }
    if (root.type !== "INSTANCE" && Array.isArray(root.children)) {
      for (const child of root.children) {
        collectMatchingNodes(child, segments, nextAncestors, matches, options);
      }
    }
  }
  async function searchFigmaNodes(query, pageFilter, options = {}) {
    const segments = query.split("/").map((s) => normalizeSearchKey(s)).filter(Boolean);
    if (segments.length === 0) {
      throw new Error("请提供非空的搜索关键词 --query");
    }
    const normalizedPageFilter = pageFilter?.toLowerCase().trim();
    const initialPages = normalizedPageFilter ? figma.root.children.filter((p) => p.name.toLowerCase().includes(normalizedPageFilter)) : [figma.currentPage];
    const matches = [];
    async function searchPages(pages) {
      for (const page of pages) {
        if (typeof page.loadAsync === "function") {
          await page.loadAsync();
        }
        if (Array.isArray(page.children)) {
          for (const child of page.children) {
            collectMatchingNodes(child, segments, [normalizeSearchKey(page.name)], matches, options);
          }
        }
      }
    }
    await searchPages(initialPages);
    if (matches.length === 0 && !normalizedPageFilter) {
      const remainingPages = figma.root.children.filter((p) => p.id !== figma.currentPage.id);
      await searchPages(remainingPages);
    }
    const leafTarget = segments[segments.length - 1] ?? "";
    matches.sort((a, b) => {
      const aExact = normalizeSearchKey(a.name) === leafTarget ? 0 : 1;
      const bExact = normalizeSearchKey(b.name) === leafTarget ? 0 : 1;
      return aExact - bExact;
    });
    return matches;
  }
  async function findNodes(payload) {
    const matches = await searchFigmaNodes(payload.query, payload.page, {
      keepSets: payload.keepSets,
      exact: payload.exact
    });
    const depth = payload.depth ?? 2;
    const includeCss = payload.includeCss ?? false;
    return Promise.all(matches.slice(0, 20).map((node) => serializeNode(node, { depth, includeCss })));
  }

  // figma/plugin/readers/style-reader.ts
  async function resolveTargetNodes(id) {
    if (id) {
      const normalizedId = id.replace("-", ":");
      const node = await figma.getNodeByIdAsync(id) ?? await figma.getNodeByIdAsync(normalizedId);
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
  async function readCss(payload) {
    const nodes = await resolveTargetNodes(payload.id);
    return Promise.all(nodes.map(async (node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      css: typeof node.getCSSAsync === "function" ? await node.getCSSAsync() : {}
    })));
  }
  async function readLocalStyles() {
    const [paintStyles, textStyles, effectStyles, collections, variables] = await Promise.all([
      figma.getLocalPaintStylesAsync(),
      figma.getLocalTextStylesAsync(),
      figma.getLocalEffectStylesAsync(),
      figma.variables ? figma.variables.getLocalVariableCollectionsAsync() : Promise.resolve([]),
      figma.variables ? figma.variables.getLocalVariablesAsync() : Promise.resolve([])
    ]);
    return {
      paintStyles: paintStyles.map((style) => ({
        id: style.id,
        name: style.name,
        description: style.description,
        paints: style.paints
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
        textDecoration: style.textDecoration
      })),
      effectStyles: effectStyles.map((style) => ({
        id: style.id,
        name: style.name,
        description: style.description,
        effects: style.effects
      })),
      variableCollections: collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        modes: collection.modes,
        variableIds: collection.variableIds
      })),
      variables: variables.map((variable) => ({
        id: variable.id,
        name: variable.name,
        resolvedType: variable.resolvedType,
        description: variable.description,
        valuesByMode: variable.valuesByMode
      }))
    };
  }

  // figma/plugin/readers/asset-reader.ts
  var BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function bytesToBase64(bytes) {
    let result = "";
    const len = bytes.length;
    for (let i = 0;i < len; i += 3) {
      const b0 = bytes[i] ?? 0;
      const b1 = i + 1 < len ? bytes[i + 1] ?? 0 : 0;
      const b2 = i + 2 < len ? bytes[i + 2] ?? 0 : 0;
      result += BASE64_ALPHABET[b0 >> 2];
      result += BASE64_ALPHABET[(b0 & 3) << 4 | b1 >> 4];
      result += i + 1 < len ? BASE64_ALPHABET[(b1 & 15) << 2 | b2 >> 6] : "=";
      result += i + 2 < len ? BASE64_ALPHABET[b2 & 63] : "=";
    }
    return result;
  }
  async function exportAssets(payload) {
    let nodes = payload.query ? (await searchFigmaNodes(payload.query, payload.page)).slice(0, 1) : await resolveTargetNodes(payload.id);
    if (nodes.length === 0) {
      throw new Error(`未找到可导出的节点: ${payload.query ?? payload.id ?? "selection"}`);
    }
    const format = payload.format ?? "SVG";
    const scale = payload.scale ?? 1;
    return Promise.all(nodes.map(async (node) => {
      if (typeof node.exportAsync !== "function") {
        throw new Error(`节点 ${node.id} (${node.type}) 不支持导出`);
      }
      const bytes = await node.exportAsync(format === "SVG" ? { format } : { format, constraint: { type: "SCALE", value: scale } });
      return {
        id: node.id,
        name: node.name,
        format,
        base64: bytesToBase64(bytes)
      };
    }));
  }

  // figma/plugin/code.ts
  figma.showUI(__html__, {
    width: 280,
    height: 120,
    themeColors: true
  });
  async function handleReadRequest(request) {
    const { requestId, action, payload } = request;
    try {
      switch (action) {
        case "document":
          return { requestId, ok: true, data: readDocumentSummary() };
        case "selection":
          return {
            requestId,
            ok: true,
            data: await readSelection(payload)
          };
        case "node":
          return {
            requestId,
            ok: true,
            data: await readNodeById(payload)
          };
        case "find":
          return {
            requestId,
            ok: true,
            data: await findNodes(payload)
          };
        case "css":
          return {
            requestId,
            ok: true,
            data: await readCss(payload)
          };
        case "styles":
          return {
            requestId,
            ok: true,
            data: await readLocalStyles()
          };
        case "export":
          return {
            requestId,
            ok: true,
            data: await exportAssets(payload)
          };
        default:
          return {
            requestId,
            ok: false,
            error: `未知读取指令: ${String(action)}`
          };
      }
    } catch (error) {
      return {
        requestId,
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  figma.ui.onmessage = async (rawMessage) => {
    if (!rawMessage || typeof rawMessage !== "object" || !("requestId" in rawMessage) || !("action" in rawMessage)) {
      return;
    }
    const response = await handleReadRequest(rawMessage);
    figma.ui.postMessage(response);
  };
})();
