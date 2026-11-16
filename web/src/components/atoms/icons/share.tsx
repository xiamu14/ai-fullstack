import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ShareIcon({
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
        d="M17.6451 3.35999C19.077 3.35999 20.2371 4.52007 20.2371 5.95196C20.2371 7.38384 19.077 8.54393 17.6451 8.54393C16.2132 8.54393 15.0532 7.38384 15.0532 5.95196C15.0532 4.52007 16.2132 3.35999 17.6451 3.35999Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.27759 9.40759C8.70948 9.40759 9.86957 10.5677 9.86957 11.9995C9.86957 13.4315 8.70948 14.5915 7.27759 14.5915C5.84571 14.5915 4.68562 13.4315 4.68562 11.9995C4.68562 10.5677 5.84571 9.40759 7.27759 9.40759Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M17.6451 15.4561C19.077 15.4561 20.2371 16.6162 20.2371 18.048C20.2371 19.479 19.077 20.64 17.6451 20.64C16.2132 20.64 15.0532 19.479 15.0532 18.048C15.0532 16.6162 16.2132 15.4561 17.6451 15.4561Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.51466 13.3038L15.416 16.743M15.4066 7.25623L9.51375 10.6945"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
