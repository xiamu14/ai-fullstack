import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Hashtag1Icon({
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
        d="M7.78216 3H16.2169C19.165 3 21 5.08119 21 8.02638V15.9736C21 18.9188 19.165 21 16.2159 21H7.78216C4.83405 21 3 18.9188 3 15.9736V8.02638C3 5.08119 4.84281 3 7.78216 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.59758 15.8544L10.5744 8.14453M13.4524 15.8544L14.4293 8.14453M16.0756 10.1009H8.25974M15.7407 13.8978H7.9248"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
