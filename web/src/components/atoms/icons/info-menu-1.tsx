import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function InfoMenu1Icon({
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
        d="M12 21C16.9709 21 21 16.9709 21 12C21 7.02908 16.9709 3 12 3C7.02908 3 3 7.02908 3 12C3 16.9709 7.02908 21 12 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.9708 15.8404H11.9068M11.957 16.0997C11.813 16.0997 11.6962 15.9828 11.6962 15.8388C11.6962 15.6948 11.813 15.5781 11.957 15.5781C12.101 15.5781 12.2178 15.6948 12.2178 15.8388C12.2178 15.9828 12.101 16.0997 11.957 16.0997Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.9708 11.9381H11.9068M11.957 12.1973C11.813 12.1973 11.6962 12.0805 11.6962 11.9365C11.6962 11.7925 11.813 11.6758 11.957 11.6758C12.101 11.6758 12.2178 11.7925 12.2178 11.9365C12.2178 12.0805 12.101 12.1973 11.957 12.1973Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.9708 8.03964H11.9068M11.957 8.2989C11.813 8.2989 11.6962 8.18206 11.6962 8.03804C11.6962 7.89403 11.813 7.77734 11.957 7.77734C12.101 7.77734 12.2178 7.89403 12.2178 8.03804C12.2178 8.18206 12.101 8.2989 11.957 8.2989Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
