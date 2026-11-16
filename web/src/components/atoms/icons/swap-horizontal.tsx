import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function SwapHorizontalIcon({
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
        d="M8.99006 12.8587L6.20977 15.6391L8.99006 18.4202M17.7921 15.6391H6.20813"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.0116 10.5414L17.7919 7.76111L15.0116 4.97998M6.21001 7.76094H17.794"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
