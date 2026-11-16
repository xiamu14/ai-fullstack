import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Smiling3Icon({
  size = 24,
  variant: _variant = "fill",
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
        clipRule="evenodd"
        d="M15.474 14.746C14.608 15.873 13.341 16.52 11.999 16.52C10.658 16.52 9.391 15.873 8.525 14.746C8.273 14.417 8.334 13.947 8.662 13.694C8.993 13.442 9.462 13.503 9.714 13.832C10.294 14.587 11.127 15.02 11.999 15.02C12.871 15.02 13.704 14.587 14.285 13.832C14.536 13.505 15.006 13.442 15.336 13.694C15.664 13.947 15.726 14.417 15.474 14.746ZM12 2.5C6.762 2.5 2.5 6.762 2.5 12C2.5 17.238 6.762 21.5 12 21.5C17.239 21.5 21.5 17.238 21.5 12C21.5 6.762 17.239 2.5 12 2.5Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
