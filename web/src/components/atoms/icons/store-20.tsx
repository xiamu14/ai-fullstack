import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Store20Icon({
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
        d="M9.12256 9.03248C9.12256 10.6119 7.785 11.8916 6.26343 11.8916C4.74186 11.8916 3.4043 10.6587 3.4043 9.03248C3.4043 8.21145 3.90495 6.00335 4.24121 4.97963C4.55878 4.01195 5.46014 3.35999 6.47826 3.35999H17.4515C18.465 3.35999 19.3644 4.00635 19.6849 4.96749C20.0276 5.99307 20.5385 8.20772 20.5385 9.03248C20.5385 10.57 19.201 11.8916 17.6794 11.8916C16.1578 11.8916 14.8203 10.6119 14.8203 9.03248"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.11328 8.13751V9.0314C9.11328 10.6109 10.3938 11.8906 11.9725 11.8906C13.5519 11.8906 14.8315 10.6109 14.8315 9.0314V8.13751"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M4.56848 14.1V16.5061C4.56848 18.9291 6.07698 20.6402 8.50177 20.6402H15.438C17.8638 20.6402 19.3732 18.9291 19.3732 16.5061V14.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M10.2224 16.425H13.7214"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
