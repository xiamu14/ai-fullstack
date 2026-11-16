import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function CheckCircle1Icon({
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
        d="M21 12C21 7.02908 16.9709 3 12 3C7.02908 3 3 7.02908 3 12C3 16.9699 7.02908 21 12 21C16.9709 21 21 16.9699 21 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.53516 12.0003L10.845 14.3091L15.4627 9.69141"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
