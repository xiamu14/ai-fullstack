import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function TrendUpIcon({
  size = 24,
  variant: _variant = "line",
  ...props
}: IconProps) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox={"0 0 24 24"}
      width={size}
      {...getIconProps(props)}
    >
      <path
        d="M15.9277 6.92108H20.6399V11.6334"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M20.6393 6.92017L13.1772 14.3822L9.25042 10.4546L3.35938 16.3456"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
