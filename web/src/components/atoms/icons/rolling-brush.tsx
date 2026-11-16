import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function RollingBrushIcon({
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
        d="M11.0525 21.0007C10.0056 21.0007 9.1582 20.1523 9.1582 19.1064V16.2635C9.1582 15.2175 10.0056 14.3691 11.0525 14.3691C12.0994 14.3691 12.9468 15.2175 12.9468 16.2635V19.1064C12.9468 20.1523 12.0994 21.0007 11.0525 21.0007Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M17.6836 5.8418C19.2529 5.8418 20.5256 7.11526 20.5256 8.68461C20.5256 10.254 19.253 11.5266 17.6836 11.5266H13.894C12.3247 11.5266 11.0527 12.7989 11.0527 14.3683"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.8425 8.68393H6.31658C4.74722 8.68393 3.47461 7.41132 3.47461 5.84197C3.47461 4.27261 4.74722 3 6.31658 3H14.8425C16.4118 3 17.6844 4.27261 17.6844 5.84197C17.6844 7.41132 16.4118 8.68393 14.8425 8.68393Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
