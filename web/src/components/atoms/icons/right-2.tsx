import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Right2Icon({
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
        d="M15.5576 11.1406L19.0004 14.5834L15.5576 18.0263"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M18.8013 14.5821H10.6258C7.51872 14.5821 5 12.0634 5 8.95733V5.97656"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
