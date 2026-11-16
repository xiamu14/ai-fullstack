import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Lamp9Icon({
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
        d="M3.8822 11.1281H3.97423M20.1142 11.1281H20.0436M6.25973 5.38876L6.32481 5.45384M17.7373 16.8663L17.687 16.8161M17.7374 5.38876L17.6724 5.45384M6.2599 16.8663L6.3101 16.8161M11.999 3.01123V3.10327"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M6.3797 11.1766C6.3797 13.4673 7.76951 15.4298 9.75058 16.2655V18.1099C9.75058 19.311 10.7332 20.2927 11.9334 20.2927C13.1336 20.2927 14.1161 19.311 14.1161 18.1099V16.2748C16.4254 15.2987 17.9277 12.7543 17.3551 9.99418C16.9144 7.88108 15.2048 6.18262 13.0927 5.75034C9.52561 5.02708 6.3797 7.7314 6.3797 11.1766Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.75092 16.2787H14.1221"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
