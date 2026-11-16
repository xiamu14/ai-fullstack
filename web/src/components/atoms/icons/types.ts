import type { SVGProps } from "react";

export type IconVariant = "line" | "fill";

export interface IconProps extends SVGProps<SVGSVGElement> {
  readonly size?: number | string;
  readonly variant?: IconVariant;
}
