import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Home22Icon({
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
        d="M6.78462 21H17.2159C19.0509 21 20.5376 19.5123 20.5376 17.6783V10.5045C20.5376 9.6133 20.1367 8.76973 19.4459 8.20638L13.8718 3.66551C12.782 2.77816 11.2185 2.77816 10.1287 3.66551L4.55457 8.20638C3.86376 8.76973 3.46289 9.6133 3.46289 10.5045V17.6783C3.46289 19.5123 4.94959 21 6.78462 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.41797 17.9888V15.9475C9.41797 14.5221 10.5729 13.3672 11.9983 13.3672C13.4237 13.3672 14.5796 14.5221 14.5796 15.9475V17.9888"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
