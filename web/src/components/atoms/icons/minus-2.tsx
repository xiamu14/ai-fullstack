import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Minus2Icon({
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
        d="M12 3C16.9709 3 21 7.02908 21 12C21 16.9699 16.9709 21 12 21C7.02908 21 3 16.9699 3 12C3 7.02908 7.02908 3 12 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M15.2989 12.002H8.69922"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
