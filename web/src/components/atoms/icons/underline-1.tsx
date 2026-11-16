import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Underline1Icon({
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
        d="M6 19H17.9997"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M16.0001 5V10.9999C16.0001 13.2101 14.209 14.9995 12.0005 14.9995C9.79112 14.9995 8 13.2101 8 10.9999V5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
