import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Delivery5Icon({
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
        d="M8.27175 3.37963L16.3599 3.36003C19.1869 3.35349 20.9512 5.34451 20.9577 8.16961L20.9754 15.7893C20.9819 18.6145 19.2279 20.6139 16.4 20.6204L8.31281 20.64C5.4849 20.6465 3.72154 18.6555 3.71501 15.8304L3.69728 8.20973C3.69076 5.38556 5.45318 3.38615 8.27175 3.37963Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.0496 3.35999L15.0655 10.6952L12.3467 9.80976L9.61218 10.711L9.60373 3.38424"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
