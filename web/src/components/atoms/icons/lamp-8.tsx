import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Lamp8Icon({
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
        d="M5.32501 9.54616C5.32501 12.2464 6.99599 14.5591 9.37962 15.5435V17.718C9.37962 19.1331 10.5612 20.2912 12.0062 20.2912C13.4501 20.2912 14.6317 19.1331 14.6317 17.718V15.5548C17.4104 14.404 19.2178 11.4049 18.5284 8.15167C17.9979 5.66154 15.9422 3.65899 13.4006 3.14994C9.10876 2.29811 5.32501 5.48501 5.32501 9.54616Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M13.7979 9.09375L11.999 10.8927L10.2 9.09375"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M12 10.8862V15.5648"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.43875 15.5587H14.5638"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
