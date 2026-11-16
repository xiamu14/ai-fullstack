import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function DatabaseDownIcon({
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
        d="M11.6126 9.07312C15.7845 9.07312 19.1666 7.7088 19.1666 6.02582C19.1666 4.34284 15.7845 2.97852 11.6126 2.97852C7.44061 2.97852 4.05859 4.34284 4.05859 6.02582C4.05859 7.7088 7.44061 9.07312 11.6126 9.07312Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.05859 12V18.0142C4.05859 18.0142 4.05859 21.0223 11.6557 21.0223"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M19.1678 11.5571V5.98438"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4.05859 5.98438V11.9986C4.05859 11.9986 4.05859 15.0057 11.6557 15.0057"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.3066 18.2046L17.1235 21.0215L19.9404 18.2046"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M17.1249 14.3633V21.0215"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
