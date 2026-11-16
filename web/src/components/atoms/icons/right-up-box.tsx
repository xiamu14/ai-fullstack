import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function RightUpBoxIcon({
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
        d="M10.3018 4.08002H8.40059C5.89264 4.08002 4.31995 5.85581 4.31995 8.36887V15.1511C4.31995 17.6642 5.88496 19.44 8.40059 19.44H15.5976C18.1141 19.44 19.6799 17.6642 19.6799 15.1511V13.6655"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.5475 4.08002H19.6802V8.21271M19.6802 4.08002L13.2375 10.5227"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
