import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Link8Icon({
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
        d="M9.63101 6.78906H8.20999C5.33999 6.78906 3 9.12907 3 11.9991C3 14.8601 5.33999 17.2081 8.20999 17.2081H9.63101"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.369 6.78906H15.79C18.66 6.78906 21 9.12907 21 11.9991C21 14.8601 18.66 17.2081 15.79 17.2081H14.369"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.7207 12H15.2801"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
