import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function TopCenterLayoutIcon({
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
        d="M7.78313 21H16.2178C19.1659 21 21 18.9198 21 15.9736V8.02638C21 5.08119 19.1659 3 16.2169 3H7.78313C4.83503 3 3 5.08119 3 8.02638V15.9736C3 18.9198 4.84378 21 7.78313 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.35156 6.89062H15.6489M10.0353 11.269H13.4032"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
