import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Messages5Icon({
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
        d="M17.9184 18.0266C15.2787 20.6761 11.3669 21.2487 8.16863 19.7642C7.696 19.573 7.30836 19.4193 6.94033 19.4193C5.91473 19.4249 4.63787 20.423 3.97468 19.7577C3.3115 19.0922 4.30627 17.811 4.30627 16.7763C4.30627 16.4061 4.15869 16.0247 3.96908 15.5495C2.48859 12.3404 3.06023 8.41628 5.6999 5.76675C9.07094 2.38525 14.5474 2.38525 17.9184 5.76675C21.295 9.15575 21.2895 14.6441 17.9184 18.0266Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
