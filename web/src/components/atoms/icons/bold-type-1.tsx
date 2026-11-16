import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function BoldType1Icon({
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
        d="M7.29199 5H11.8035C13.6314 5 15.2641 6.33613 15.4374 8.15613C15.636 10.2439 13.9997 12 11.954 12H7.29199V5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M7.29199 12H13.0574C14.8852 12 16.5171 13.3361 16.6912 15.1561C16.8899 17.2439 15.2536 19 13.2079 19H7.29199V12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
