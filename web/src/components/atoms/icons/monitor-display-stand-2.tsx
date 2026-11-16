import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function MonitorDisplayStand2Icon({
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
        d="M17.9935 3.2832H6.00746C4.34659 3.2832 3 4.6298 3 6.28969V13.7903C3 15.4512 4.34659 16.7978 6.00746 16.7978H17.9935C19.6544 16.7978 21 15.4512 21 13.7903V6.28969C21 4.6298 19.6544 3.2832 17.9935 3.2832Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.05469 20.7168H15.9445"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M3 13.2422H21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12 17.0039V20.7168"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
