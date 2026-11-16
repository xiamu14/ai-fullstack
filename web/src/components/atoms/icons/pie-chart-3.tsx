import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PieChart3Icon({
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
        d="M9.92943 5.37071C5.75248 5.87696 2.63747 9.82601 3.50518 14.2954C4.07215 17.2115 6.42217 19.5615 9.33823 20.1275C13.8075 20.9962 17.7567 17.8812 18.2629 13.7041C18.3208 13.2222 17.9407 12.7954 17.455 12.7954H11.6462C11.1998 12.7954 10.8383 12.4339 10.8383 11.9865V6.17865C10.8383 5.69295 10.4114 5.3128 9.92943 5.37071Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M20.6331 9.00292C20.223 5.88231 17.7516 3.41086 14.631 3.00082C14.1462 2.9373 13.7129 3.31932 13.7129 3.80782V9.11407C13.7129 9.5596 14.0743 9.92111 14.5208 9.92111H19.8261C20.3156 9.92111 20.6966 9.48861 20.6331 9.00292Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
