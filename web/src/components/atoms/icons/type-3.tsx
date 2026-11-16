import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Type3Icon({
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
        d="M7.78313 3H16.2178C19.1659 3 21 5.08022 21 8.02638V15.9736C21 18.9188 19.1659 21 16.2169 21H7.78313C4.83503 21 3 18.9188 3 15.9736V8.02638C3 5.08022 4.84378 3 7.78313 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.29297 9.58499V8.26953H15.706V9.58499"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.9648 8.26953V15.7313M10.3467 15.7312H13.6538"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
