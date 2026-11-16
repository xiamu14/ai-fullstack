import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PowerButton1Icon({
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
        d="M16.9009 6.15625C18.661 7.58764 19.7887 9.75973 19.7887 12.2105C19.7887 16.513 16.3028 19.9989 12.0003 19.9989C7.69781 19.9989 4.21191 16.513 4.21191 12.2105C4.21191 9.75973 5.34055 7.58764 7.0997 6.15625"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12 4V10.7866"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
