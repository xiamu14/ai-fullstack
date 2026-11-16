import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function FolderFileUpIcon({
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
        d="M15.6409 20.9874C18.9967 20.9874 20.9738 19.0094 20.9738 15.6546L21 10.9989C21 7.57609 19.7584 5.86421 16.3948 5.86421H13.7415C13.0682 5.86227 12.4348 5.54554 12.0296 5.00827L11.1737 3.86961C10.7695 3.33137 10.1361 3.01367 9.46278 3.01367H7.58768C4.23193 3.01367 3 4.99079 3 8.34168V15.6546C3 19.0094 4.981 20.9874 8.34452 20.9874H15.6409Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.199 12.4173L11.9994 10.209L9.80078 12.4173M11.9994 10.209L12 16.3725"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
