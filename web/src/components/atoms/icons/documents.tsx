import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function DocumentsIcon({
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
        d="M20.5496 12.5277V17.6843C20.5496 19.5144 19.0659 20.9981 17.2367 20.9981H6.76305C4.93295 20.9981 3.44922 19.5144 3.44922 17.6843V12.5277C3.44922 10.6976 4.93295 9.21484 6.76305 9.21484H17.2367C19.0659 9.21484 20.5496 10.6976 20.5496 12.5277Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M6.18164 6.11169H17.818M8.71945 3H15.281"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
