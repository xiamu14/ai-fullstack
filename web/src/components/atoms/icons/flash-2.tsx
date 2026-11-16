import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Flash2Icon({
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
        d="M5.60303 12.0481L9.15818 3.37334C9.23797 3.15583 9.44504 3.01123 9.67672 3.01123H14.4427C14.8238 3.01123 15.0904 3.38823 14.9634 3.74764L12.8558 8.69426C12.7287 9.05366 12.9953 9.43066 13.3766 9.43066H17.8768C18.3516 9.43066 18.6051 9.98993 18.2922 10.347L9.74751 20.1001C9.36248 20.5396 8.64783 20.1583 8.79837 19.5938L10.4272 13.4853C10.5207 13.1346 10.2565 12.7906 9.89356 12.7906H6.12158C5.73761 12.7906 5.4708 12.4086 5.60303 12.0481Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
