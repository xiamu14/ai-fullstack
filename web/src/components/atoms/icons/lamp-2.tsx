import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Lamp2Icon({
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
        d="M5.45999 9.54616C5.45999 12.2464 7.09734 14.5591 9.43241 15.5435V17.718C9.43241 19.1331 10.5906 20.2912 12.0057 20.2912C13.4197 20.2912 14.578 19.1331 14.578 17.718V15.5548C17.2998 14.404 19.0707 11.4049 18.3953 8.15167C17.8751 5.66154 15.8613 3.65899 13.3721 3.14994C9.16715 2.29811 5.45999 5.48501 5.45999 9.54616Z"
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
      <path
        d="M12 9.99756V15.3411"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
