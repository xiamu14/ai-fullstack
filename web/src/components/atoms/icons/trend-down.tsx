import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function TrendDownIcon({
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
        d="M15.9258 16.3467L20.639 16.3468L20.6381 11.6343"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M20.6394 16.3457L13.1772 8.88448L9.25045 12.8112L3.35938 6.92017"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
