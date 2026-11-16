import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ChartAnalysishIcon({
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
        d="M7.54574 4.54877H16.4546C18.4488 4.54877 20.0647 6.16466 20.0647 8.15884V13.0485C20.0647 15.0418 18.4488 16.6586 16.4546 16.6586H7.54574C5.55156 16.6586 3.93567 15.0418 3.93567 13.0485V8.15884C3.93567 6.16466 5.55156 4.54877 7.54574 4.54877Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M12 2.99438V4.55891"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M8.19531 12.4094L10.7919 9.81379L12.7908 11.8126L15.8049 8.79938"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.5257 20.2761L12.0006 16.6857L8.47461 20.2761"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
