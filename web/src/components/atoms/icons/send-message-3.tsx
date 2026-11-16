import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function SendMessage3Icon({
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
        d="M20.5753 5.6349L16.415 19.8658C16.0377 21.1553 14.3162 21.3877 13.6128 20.2434L9.98305 14.3361L4.09564 10.694C2.95515 9.98832 3.1868 8.261 4.47207 7.88237L18.6549 3.70797C19.8299 3.36213 20.92 4.45681 20.5753 5.6349Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.6506 8.61938L10.0237 14.3252"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
