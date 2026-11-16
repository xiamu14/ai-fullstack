import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Code4Icon({
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
        d="M21 12C21 16.9709 16.9709 21 12 21C7.02908 21 3 16.9709 3 12C3 7.02908 7.02908 3 12 3C16.9709 3 21 7.02908 21 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.93749 9.35156L7.28809 12.001L9.93749 14.6504"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.0625 9.35156L16.7119 12.001L14.0625 14.6504"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
