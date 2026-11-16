import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function DcoumentDownloadIcon({
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
        d="M11.6214 15.9322V10.0078M9.32031 13.6215L11.6202 15.9311L13.9201 13.6215"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M13.7857 3.00004C14.3434 3.00004 14.8777 3.22681 15.2641 3.62975L19.055 7.57935C19.422 7.96088 19.6264 8.4699 19.6264 8.99936V17.1633C19.641 19.2199 18.0234 20.9163 15.9697 21L8.04424 20.999C5.97114 20.9533 4.32823 19.2364 4.37398 17.1633V6.65667C4.42264 4.61764 6.09378 2.99128 8.13379 3.00004H13.7857Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.2695 3.0625V5.95511C14.2686 7.36637 15.4112 8.51291 16.8234 8.51583H19.5623"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
