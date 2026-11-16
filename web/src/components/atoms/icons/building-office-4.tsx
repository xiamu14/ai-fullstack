import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function BuildingOffice4Icon({
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
        d="M18.8777 20.6377V5.44101C18.8777 4.29121 17.9456 3.35999 16.7967 3.35999H7.14913C6.00028 3.35999 5.06812 4.29121 5.06812 5.44101V20.6377"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M13.6241 8.03625H14.6189M9.32617 8.03625H10.321M13.6241 11.4677H14.6189M9.32617 11.4677H10.321"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.72852 20.6382V16.6836C9.72852 16.1073 10.1889 15.6375 10.7652 15.6375H13.1844C13.7504 15.6375 14.2211 16.1073 14.2211 16.6836V20.6382"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M3.72266 20.6362H20.2232"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
