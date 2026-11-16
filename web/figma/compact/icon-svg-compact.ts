export const INHERITABLE_SVG_ATTRS = [
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
] as const;

function collectReferencedIds(svg: string): Set<string> {
  const referenced = new Set<string>();
  for (const match of svg.matchAll(/url\(#([^)]+)\)/g)) {
    if (match[1]) {
      referenced.add(match[1]);
    }
  }
  for (const match of svg.matchAll(/href="#([^"]+)"/g)) {
    if (match[1]) {
      referenced.add(match[1]);
    }
  }
  return referenced;
}

function roundSvgPathNumbers(d: string): string {
  return d.replace(/-?\d+\.\d{3,}/g, (match) => {
    const rounded = Math.round(Number(match) * 100) / 100;
    return String(rounded);
  });
}

function hoistCommonShapeAttributes(svg: string): string {
  const shapeTags = [
    ...svg.matchAll(
      /<(path|circle|rect|line|polyline|polygon)\b([^>]*?)\/?>/gi
    ),
  ];
  if (shapeTags.length < 2) {
    return svg;
  }

  const hoisted: Array<[string, string]> = [];
  for (const attr of INHERITABLE_SVG_ATTRS) {
    const regex = new RegExp(`\\s${attr}="([^"]+)"`, "i");
    const firstMatch = shapeTags[0]?.[2]?.match(regex);
    const candidate = firstMatch?.[1];
    if (!candidate) {
      continue;
    }
    const allMatch = shapeTags.every((tag) => {
      const m = tag[2]?.match(regex);
      return m?.[1] === candidate;
    });
    if (allMatch) {
      hoisted.push([attr, candidate]);
    }
  }

  if (hoisted.length === 0) {
    return svg;
  }

  let updated = svg;
  for (const [attr] of hoisted) {
    const attrPattern = new RegExp(`\\s${attr}="[^"]+"`, "gi");
    updated = updated.replace(
      /<(path|circle|rect|line|polyline|polygon)\b([^>]*?)(\/?>)/gi,
      (_full, tag: string, attrs: string, close: string) =>
        `<${tag}${attrs.replace(attrPattern, "")}${close}`
    );
  }

  const hoistedAttrStr = hoisted
    .map(([attr, val]) => `${attr}="${val}"`)
    .join(" ");

  updated = updated.replace(/<svg\b([^>]*)>/i, `<svg$1 ${hoistedAttrStr}>`);
  return updated;
}

export function compactSvg(
  rawSvg: string,
  options: { useCurrentColor?: boolean } = {}
): string {
  const useCurrentColor = options.useCurrentColor ?? true;
  const referencedIds = collectReferencedIds(rawSvg);

  let svg = rawSvg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  // 移除未被 url(#id) 引用的冗余 id 属性（如 id="Vector"、id="Group"）
  svg = svg.replace(/\sid="([^"]+)"/g, (full, idVal: string) =>
    referencedIds.has(idVal) ? full : ""
  );

  // 压缩 path d 属性中的超长浮点数（保留最多 2 位小数）
  svg = svg.replace(/\sd="([^"]+)"/g, (_full, dVal: string) => {
    return ` d="${roundSvgPathNumbers(dVal)}"`;
  });

  // 移除空的 <defs/> 或 <defs></defs>
  svg = svg.replace(/<defs>\s*<\/defs>/g, "").replace(/<defs\s*\/>/g, "");

  if (useCurrentColor) {
    svg = svg.replace(
      /\b(stroke|fill)="(?!none\b|currentColor\b|url\()([^"]+)"/gi,
      '$1="currentColor"'
    );
  }

  // 将所有子图形相同的 stroke / stroke-width / stroke-linecap / stroke-linejoin 提升到 <svg> 根节点
  svg = hoistCommonShapeAttributes(svg);

  // 压缩标签间多余空白与换行
  svg = svg
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\/>/g, "/>")
    .trim();

  return `${svg}\n`;
}
