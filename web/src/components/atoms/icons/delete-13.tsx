import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Delete13Icon({
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
        d="M19.6943 6.62625H3.82594"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M18.3999 9.645L17.8125 17.6866C17.6911 19.35 16.306 20.6388 14.6369 20.6388H8.88363C7.21554 20.6388 5.82951 19.35 5.7081 17.6856L5.12062 9.645"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.3824 6.6252L14.8996 4.24822C14.7594 3.72426 14.284 3.36001 13.7423 3.36001H9.78605C9.24149 3.35814 8.76422 3.72239 8.6232 4.24822L8.145 6.6252"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
