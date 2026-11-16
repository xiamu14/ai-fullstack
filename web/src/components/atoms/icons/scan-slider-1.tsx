import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ScanSlider1Icon({
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
        d="M10.8672 3V21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.2598 4.08594H15.7046C18.2957 4.08594 19.9127 5.9161 19.9127 8.5081V15.496C19.9127 18.0792 18.2957 19.9094 15.7046 19.9094H14.2598"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M10.8695 19.9094H8.28822C5.69622 19.9094 4.08789 18.0792 4.08789 15.496V8.5081C4.08789 5.9161 5.70497 4.08594 8.28822 4.08594H10.8695"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
