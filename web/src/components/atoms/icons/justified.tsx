import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function JustifiedIcon({
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
        d="M4 5H20M4 14.333H20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4 9.66406H20M4 18.998H20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
