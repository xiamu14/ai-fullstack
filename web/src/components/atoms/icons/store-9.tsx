import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Store9Icon({
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
        d="M12 10.3918C12 11.5642 11.0494 12.5148 9.87697 12.5148H9.62303C8.45059 12.5148 7.5 11.5642 7.5 10.3918"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M16.5 10.3918C16.5 11.5642 15.5494 12.5148 14.377 12.5148H14.123C12.9506 12.5148 12 11.5642 12 10.3918"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M7.5 10.3918C7.5 11.5642 6.54941 12.5142 5.37697 12.5142H5.12303C3.95059 12.5142 3 11.5636 3 10.3912V8.86846C3 7.59678 4.03135 6.56641 5.30303 6.56641H18.697C19.9686 6.56641 21 7.59678 21 8.86846V10.3912C21 11.5636 20.0494 12.5142 18.877 12.5142H18.623C17.4506 12.5142 16.5 11.5642 16.5 10.3918"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4.68945 12.4707V18.5566C4.68945 19.5209 5.47172 20.3031 6.43594 20.3031H17.5638C18.529 20.3031 19.3113 19.5209 19.3113 18.5566V12.4688"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.123 20.306V17.748C14.123 16.5756 13.1724 15.625 12 15.625C10.8275 15.625 9.87695 16.5756 9.87695 17.748V20.306"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4.68945 6.56656V5.4418C4.68945 4.47758 5.47172 3.69531 6.43594 3.69531H17.5638C18.529 3.69531 19.3113 4.47758 19.3113 5.4418V6.56656"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
