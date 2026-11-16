import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Pin13Icon({
  size = 24,
  variant: _variant = "fill",
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
        clipRule="evenodd"
        d="M12 13.176C10.5398 13.176 9.35136 11.9875 9.35136 10.5274C9.35136 9.0672 10.5398 7.87872 12 7.87872C13.4602 7.87872 14.6477 9.0672 14.6477 10.5274C14.6477 11.9875 13.4602 13.176 12 13.176ZM12 2.88C7.752 2.88 4.29504 6.33697 4.29504 10.5859C4.29504 15.9965 10.6234 21.12 12 21.12C13.3766 21.12 19.705 15.9965 19.705 10.5859C19.705 6.33697 16.248 2.88 12 2.88Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
