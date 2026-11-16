import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Restart2Icon({
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
        d="M18.3646 5.63672L16.6434 7.3579M5.63672 18.3647L7.3579 16.6425M18.3646 18.3647L16.6434 16.6425M5.63672 5.63672L7.3579 7.3579"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12 3V5.43437M12 21V18.5656M21 12H18.5656M3 12H5.43437"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
