(() => {
  // ../web/figma/plugin/readers/style-reader.ts
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

  // ../web/figma/plugin/readers/asset-reader.ts
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
    const nodes = await resolveTargetNodes(payload.id);
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

  // ../web/figma/plugin/readers/node-serializer.ts
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
      text: extractText(node),
      componentId: node.mainComponent?.id,
      componentProperties: sanitizeJsonValue(node.componentProperties)
    };
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
    if (node.type !== "PAGE" || options.depth > 0) {
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

  // ../web/figma/plugin/readers/document-reader.ts
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
  function collectMatchingNodes(root, segments, ancestors, matches) {
    const nextAncestors = [...ancestors, root.name.toLowerCase()];
    const fullPath = nextAncestors.join("/");
    const isLeafMatch = root.name.toLowerCase().includes(segments[segments.length - 1] ?? "") && segments.every((seg) => fullPath.includes(seg));
    if (isLeafMatch) {
      matches.push(root);
      return;
    }
    if (Array.isArray(root.children)) {
      for (const child of root.children) {
        collectMatchingNodes(child, segments, nextAncestors, matches);
      }
    }
  }
  async function findNodes(payload) {
    const segments = payload.query.toLowerCase().split("/").map((s) => s.trim()).filter(Boolean);
    if (segments.length === 0) {
      throw new Error("请提供非空的搜索关键词 --query");
    }
    const pageFilter = payload.page?.toLowerCase().trim();
    const targetPages = pageFilter ? figma.root.children.filter((p) => p.name.toLowerCase().includes(pageFilter)) : [figma.currentPage];
    const matches = [];
    for (const page of targetPages) {
      if (typeof page.loadAsync === "function") {
        await page.loadAsync();
      }
      if (Array.isArray(page.children)) {
        for (const child of page.children) {
          collectMatchingNodes(child, segments, [page.name.toLowerCase()], matches);
        }
      }
    }
    const depth = payload.depth ?? 2;
    const includeCss = payload.includeCss ?? false;
    return Promise.all(matches.slice(0, 20).map((node) => serializeNode(node, { depth, includeCss })));
  }

  // ../web/figma/plugin/code.ts
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
