import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Code9Icon({
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
        d="M7.78216 3H16.2169C19.165 3 21 5.08119 21 8.02638V15.9736C21 18.9188 19.165 21 16.2159 21H7.78216C4.83405 21 3 18.9188 3 15.9736V8.02638C3 5.08119 4.84281 3 7.78216 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.3252 7.73828C17.4261 7.73828 14.3252 12.0018 17.4261 12.0018C14.3252 12.0018 17.4261 16.2644 14.3252 16.2644"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.67508 7.73828C6.57422 7.73828 9.67508 12.0018 6.57422 12.0018C9.67508 12.0018 6.57422 16.2644 9.67508 16.2644"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
