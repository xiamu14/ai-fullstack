const NUMBER_WORDS: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
};

const INHERITABLE_SVG_ATTRS = [
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
] as const;

const SVG_ATTR_CAMEL_MAP: Record<string, string> = {
  "accent-height": "accentHeight",
  "alignment-baseline": "alignmentBaseline",
  "allow-reorder": "allowReorder",
  "arabic-form": "arabicForm",
  "baseline-shift": "baselineShift",
  "cap-height": "capHeight",
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "color-interpolation": "colorInterpolation",
  "color-interpolation-filters": "colorInterpolationFilters",
  "color-profile": "colorProfile",
  "color-rendering": "colorRendering",
  "dominant-baseline": "dominantBaseline",
  "enable-background": "enableBackground",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "flood-color": "floodColor",
  "flood-opacity": "floodOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-size-adjust": "fontSizeAdjust",
  "font-stretch": "fontStretch",
  "font-style": "fontStyle",
  "font-variant": "fontVariant",
  "font-weight": "fontWeight",
  "glyph-name": "glyphName",
  "glyph-orientation-horizontal": "glyphOrientationHorizontal",
  "glyph-orientation-vertical": "glyphOrientationVertical",
  "horiz-adv-x": "horizAdvX",
  "horiz-origin-x": "horizOriginX",
  "image-rendering": "imageRendering",
  "letter-spacing": "letterSpacing",
  "lighting-color": "lightingColor",
  "marker-end": "markerEnd",
  "marker-mid": "markerMid",
  "marker-start": "markerStart",
  "overline-position": "overlinePosition",
  "overline-thickness": "overlineThickness",
  "paint-order": "paintOrder",
  "panose-1": "panose1",
  "pointer-events": "pointerEvents",
  "rendering-intent": "renderingIntent",
  "shape-rendering": "shapeRendering",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "strikethrough-position": "strikethroughPosition",
  "strikethrough-thickness": "strikethroughThickness",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-opacity": "strokeOpacity",
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
  "text-decoration": "textDecoration",
  "text-rendering": "textRendering",
  "underline-position": "underlinePosition",
  "underline-thickness": "underlineThickness",
  "unicode-bidi": "unicodeBidi",
  "unicode-range": "unicodeRange",
  "units-per-em": "unitsPerEm",
  "v-alphabetic": "vAlphabetic",
  "v-hanging": "vHanging",
  "v-ideographic": "vIdeographic",
  "v-mathematical": "vMathematical",
  "vector-effect": "vectorEffect",
  "vert-adv-y": "vertAdvY",
  "vert-origin-x": "vertOriginX",
  "vert-origin-y": "vertOriginY",
  "word-spacing": "wordSpacing",
  "writing-mode": "writingMode",
  "x-height": "xHeight",
  "xlink:actuate": "xlinkActuate",
  "xlink:arcrole": "xlinkArcrole",
  "xlink:href": "xlinkHref",
  "xlink:role": "xlinkRole",
  "xlink:show": "xlinkShow",
  "xlink:title": "xlinkTitle",
  "xlink:type": "xlinkType",
  "xml:base": "xmlBase",
  "xml:lang": "xmlLang",
  "xml:space": "xmlSpace",
};

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
  const shapeTags = [...svg.matchAll(/<(path|circle|rect|line|polyline|polygon)\b([^>]*?)\/?>/gi)];
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

  // 将所有子图形完全相同的 stroke / stroke-width / stroke-linecap / stroke-linejoin 提升到 <svg> 根节点
  svg = hoistCommonShapeAttributes(svg);

  // 压缩标签间多余空白与换行
  svg = svg
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\/>/g, "/>")
    .trim();

  return `${svg}\n`;
}

export function toKebabIconName(rawName: string): string {
  const leaf = rawName.split("/").pop()?.trim() ?? rawName.trim();
  const tokens = leaf
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token, idx) => {
      if (idx === 0 && /^\d+$/.test(token)) {
        return NUMBER_WORDS[token] ?? `n${token}`;
      }
      if (idx === 0 && /^\d/.test(token)) {
        const firstChar = token[0] ?? "";
        const prefix = NUMBER_WORDS[firstChar] ?? `n${firstChar}`;
        return `${prefix}-${token.slice(1)}`;
      }
      return token;
    });

  const base = tokens.join("-") || "icon";
  return base.endsWith("-icon") ? base : `${base}-icon`;
}

export function toPascalComponentName(kebabName: string): string {
  return kebabName
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function convertAttributesToJsx(svgFragment: string): string {
  return svgFragment.replace(
    /\s([a-zA-Z_:][a-zA-Z0-9_.:-]*)=/g,
    (full, attrName: string) => {
      const mapped = SVG_ATTR_CAMEL_MAP[attrName];
      return mapped ? ` ${mapped}=` : full;
    }
  );
}

export function svgToReactComponent(
  rawSvg: string,
  rawName: string
): {
  kebabFileName: string;
  componentName: string;
  code: string;
} {
  const kebabFileName = toKebabIconName(rawName);
  const componentName = toPascalComponentName(kebabFileName);
  const compacted = compactSvg(rawSvg, { useCurrentColor: true }).trim();

  const svgOpenTagMatch = compacted.match(/<svg\b([^>]*)>/i);
  const svgAttrsRaw = svgOpenTagMatch?.[1] ?? "";
  const viewBoxMatch = svgAttrsRaw.match(/\bviewBox="([^"]+)"/i);
  const widthMatch = svgAttrsRaw.match(/\bwidth="(\d+(?:\.\d+)?)"/i);
  const heightMatch = svgAttrsRaw.match(/\bheight="(\d+(?:\.\d+)?)"/i);
  const defaultSize = widthMatch?.[1] ? Number(widthMatch[1]) : 24;
  const viewBox =
    viewBoxMatch?.[1] ??
    `0 0 ${widthMatch?.[1] ?? 24} ${heightMatch?.[1] ?? 24}`;

  const extraSvgAttrs: string[] = [];
  for (const attr of INHERITABLE_SVG_ATTRS) {
    const m = svgAttrsRaw.match(new RegExp(`\\b${attr}="([^"]+)"`, "i"));
    if (m?.[1]) {
      const jsxKey = SVG_ATTR_CAMEL_MAP[attr] ?? attr;
      extraSvgAttrs.push(`      ${jsxKey}="${m[1]}"`);
    }
  }

  const innerMatch = compacted.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const rawInner = innerMatch?.[1] ?? "";
  const formattedInner = convertAttributesToJsx(rawInner)
    .replace(/\/>/g, " />")
    .replace(/></g, ">\n      <");

  const extraAttrsBlock =
    extraSvgAttrs.length > 0 ? `\n${extraSvgAttrs.join("\n")}` : "";

  const code = `import type { SVGProps } from 'react';

export interface ${componentName}Props
  extends Omit<SVGProps<SVGSVGElement>, 'color' | 'fontSize'> {
  color?: string;
  fontSize?: number | string;
}

export function ${componentName}({
  color = 'currentColor',
  fontSize = ${defaultSize},
  ...props
}: ${componentName}Props) {
  return (
    <svg
      aria-hidden="true"
      color={color}
      fill="none"
      height={fontSize}${extraAttrsBlock}
      viewBox="${viewBox}"
      width={fontSize}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      ${formattedInner}
    </svg>
  );
}
`;

  return {
    kebabFileName,
    componentName,
    code,
  };
}
