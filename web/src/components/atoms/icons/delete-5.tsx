import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Delete5Icon({
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
        d="M18.3999 9.64502L17.8125 17.6866C17.6911 19.35 16.306 20.6389 14.6369 20.6389H8.88363C7.21554 20.6389 5.82951 19.35 5.7081 17.6856L5.12062 9.64502"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M19.6943 6.62625H3.82594"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.3805 6.62521L14.8977 4.24823C14.7576 3.72428 14.2822 3.36002 13.7405 3.36002H9.78413C9.23962 3.35815 8.76235 3.7224 8.62132 4.24823L8.14312 6.62521"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.93753 11.7899V16.118M13.1827 11.7899V16.118"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
