export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export function roundNumber(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function toHexByte(channel0to1: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(channel0to1 * 255)));
  return clamped.toString(16).padStart(2, "0").toUpperCase();
}

export function formatColor(color: RgbaColor, opacity = 1): string {
  const alpha = roundNumber((color.a ?? 1) * opacity, 2);
  if (alpha >= 1) {
    return `#${toHexByte(color.r)}${toHexByte(color.g)}${toHexByte(color.b)}`;
  }
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function compactPaints(paints: unknown): string | string[] | undefined {
  if (!Array.isArray(paints) || paints.length === 0) {
    return undefined;
  }

  const visiblePaints = paints.filter(
    (p): p is Record<string, unknown> =>
      Boolean(p) && typeof p === "object" && p.visible !== false
  );

  if (visiblePaints.length === 0) {
    return undefined;
  }

  const formatted = visiblePaints
    .map((paint) => {
      const opacity = typeof paint.opacity === "number" ? paint.opacity : 1;
      if (paint.type === "SOLID" && paint.color) {
        return formatColor(paint.color as RgbaColor, opacity);
      }
      if (
        typeof paint.type === "string" &&
        paint.type.startsWith("GRADIENT_") &&
        Array.isArray(paint.gradientStops)
      ) {
        const stops = paint.gradientStops
          .map((stop: Record<string, unknown>) => {
            const c = stop.color
              ? formatColor(stop.color as RgbaColor, opacity)
              : "";
            const pos =
              typeof stop.position === "number"
                ? `${Math.round(stop.position * 100)}%`
                : "";
            return `${c} ${pos}`.trim();
          })
          .join(", ");
        const kind = paint.type.replace("GRADIENT_", "").toLowerCase();
        return `${kind}-gradient(${stops})`;
      }
      if (paint.type === "IMAGE") {
        return "image";
      }
      return undefined;
    })
    .filter((item): item is string => Boolean(item));

  if (formatted.length === 0) {
    return undefined;
  }
  return formatted.length === 1 ? formatted[0] : formatted;
}

export function compactEffects(
  effects: unknown
): string | string[] | undefined {
  if (!Array.isArray(effects) || effects.length === 0) {
    return undefined;
  }

  const visible = effects.filter(
    (e): e is Record<string, unknown> =>
      Boolean(e) && typeof e === "object" && e.visible !== false
  );

  if (visible.length === 0) {
    return undefined;
  }

  const formatted = visible
    .map((effect) => {
      const type = effect.type;
      const radius =
        typeof effect.radius === "number" ? roundNumber(effect.radius) : 0;
      if (type === "DROP_SHADOW" || type === "INNER_SHADOW") {
        const offset = (effect.offset as { x?: number; y?: number }) ?? {};
        const x = roundNumber(offset.x ?? 0);
        const y = roundNumber(offset.y ?? 0);
        const spread =
          typeof effect.spread === "number" ? roundNumber(effect.spread) : 0;
        const color = effect.color
          ? formatColor(effect.color as RgbaColor)
          : "#000000";
        const prefix = type === "INNER_SHADOW" ? "inset " : "";
        return `${prefix}${x}px ${y}px ${radius}px ${spread}px ${color}`;
      }
      if (type === "BACKGROUND_BLUR") {
        return `backdrop-blur(${radius}px)`;
      }
      if (type === "LAYER_BLUR") {
        return `blur(${radius}px)`;
      }
      return undefined;
    })
    .filter((item): item is string => Boolean(item));

  if (formatted.length === 0) {
    return undefined;
  }
  return formatted.length === 1 ? formatted[0] : formatted;
}
