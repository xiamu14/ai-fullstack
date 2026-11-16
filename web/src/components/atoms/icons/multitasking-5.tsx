import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Multitasking5Icon({
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
        d="M3 4.39648V19.6041"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M21 4.39648V19.6041"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.47576 3.46875H14.5498C16.2778 3.46875 17.6789 4.86886 17.6789 6.59686V17.4046C17.6789 19.1326 16.2778 20.5327 14.5498 20.5327H9.47576C7.74776 20.5327 6.34766 19.1326 6.34766 17.4046V6.59686C6.34766 4.86886 7.74776 3.46875 9.47576 3.46875Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
