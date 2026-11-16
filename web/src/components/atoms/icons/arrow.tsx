import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ArrowIcon({
  size = 24,
  variant: _variant = "line",
  ...props
}: IconProps) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox={"0 0 16 16"}
      width={size}
      {...getIconProps(props)}
    >
      <g clipPath="url(#arrow-clip0_30132_138)">
        <path
          d="M8.31088 12.8764C7.91175 13.4295 7.08825 13.4295 6.68911 12.8764L2.14883 6.5852C1.67153 5.92384 2.14411 5 2.95972 5L12.0403 5C12.8559 5 13.3285 5.92384 12.8512 6.58521L8.31088 12.8764Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="arrow-clip0_30132_138">
          <rect fill="white" height="16" width="16" />
        </clipPath>
      </defs>
    </svg>
  );
}
