import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ArrowLeft3Icon({
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
        d="M11.3 12.2513L20.25 12.2513"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.3008 7.2503L3.36378 12.2513L11.3008 17.2523L11.3008 7.2503Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
