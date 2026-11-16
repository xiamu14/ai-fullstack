import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PolarGridIcon({
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
        d="M20.6394 11.6339C20.6394 6.86275 16.7714 2.9939 11.9994 2.9939C7.22729 2.9939 3.35938 6.86275 3.35938 11.6339C3.35938 16.406 7.22729 20.2739 11.9994 20.2739C16.7714 20.2739 20.6394 16.406 20.6394 11.6339Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M16.9392 11.6337C16.9392 14.3613 14.7279 16.5732 11.9998 16.5732C9.27158 16.5732 7.0603 14.3613 7.0603 11.6337C7.0603 8.90549 9.27158 6.69421 11.9998 6.69421C14.7279 6.69421 16.9392 8.90549 16.9392 11.6337Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M12 11.634V20.274"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M12.0037 11.634L20.2504 14.1919"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.44"
      />
      <path
        d="M12 11.6301L17.4876 4.96899"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.44"
      />
      <path
        d="M12.0003 11.6263L3.74609 14.1918"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.44"
      />
      <path
        d="M12.003 11.6377L6.50781 4.96899"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
