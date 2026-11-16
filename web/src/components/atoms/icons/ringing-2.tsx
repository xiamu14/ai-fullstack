import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Ringing2Icon({
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
        d="M5.60711 9.86867C5.60711 6.33793 8.46946 3.47559 12.0002 3.47559C15.5309 3.47559 18.3923 6.33793 18.3923 9.86867L18.3933 11.152C18.3933 11.9118 18.5616 12.661 18.8846 13.3478L19.338 14.312C20.0317 15.787 18.9566 17.4808 17.3279 17.4808H6.67247C5.04379 17.4808 3.96774 15.787 4.66143 14.312L5.11579 13.3478C5.4388 12.661 5.60614 11.9118 5.60614 11.152L5.60711 9.86867Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.98047 17.9824C8.98047 19.649 10.3319 21.0004 11.9975 21.0004C13.6641 21.0004 15.0155 19.649 15.0155 17.9824"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4.06836 5.77673C4.54509 4.74056 5.30397 3.76764 6.28663 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M19.9331 5.77673C19.4564 4.74056 18.6975 3.76764 17.7148 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
