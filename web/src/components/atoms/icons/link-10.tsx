import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Link10Icon({
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
        d="M7.4659 4.88664V3M4.88664 7.4659H3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M16.5352 20.9986V19.112M20.9997 16.5312H19.1121"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M6.69528 10.0898L5.71158 11.0735C3.72374 13.0614 3.72374 16.3015 5.71158 18.2893C7.6926 20.2703 10.9395 20.2761 12.9263 18.2893L13.911 17.3056"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M17.1845 14.0298L18.175 13.0393C20.156 11.0583 20.1628 7.81136 18.175 5.82353C16.194 3.84348 12.9471 3.83667 10.9593 5.82353L9.96875 6.81404"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
