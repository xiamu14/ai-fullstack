import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Navigation5Icon({
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
        d="M15.7487 18.7134L19.8418 6.48745C20.3383 5.00478 18.9187 3.59776 17.4408 4.10588L5.32934 8.27557C3.68085 8.84284 3.61976 11.1507 5.23528 11.8053L9.39818 13.4906C9.86654 13.6797 10.2399 14.0501 10.4328 14.5175L12.219 18.8356C12.8862 20.4472 15.195 20.3667 15.7487 18.7134Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
