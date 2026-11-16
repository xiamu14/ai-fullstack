import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Mouse4Icon({
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
        d="M18.6957 14.7029C18.6957 18.1803 15.698 21 11.9997 21C8.30241 21 5.30468 18.1823 5.30468 14.7058L5.30273 9.29708C5.30176 5.81968 8.29949 3 11.9987 3C15.6951 3 18.6928 5.81773 18.6938 9.29514L18.6957 14.7029Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M18.6967 10.1719H5.30469"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12 3.01172V10.1738"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
