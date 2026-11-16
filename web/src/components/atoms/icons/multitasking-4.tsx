import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Multitasking4Icon({
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
        d="M4.39648 21H19.6041"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4.39648 3H19.6041"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M3.46875 14.5234V9.44939C3.46875 7.72139 4.86983 6.32031 6.59686 6.32031H17.4046C19.1326 6.32031 20.5337 7.72139 20.5337 9.44939V14.5234C20.5337 16.2514 19.1326 17.6516 17.4046 17.6516H6.59686C4.86983 17.6516 3.46875 16.2514 3.46875 14.5234Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
