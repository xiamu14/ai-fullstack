import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function BuildingOffice1Icon({
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
        d="M3.33185 19.2075H20.6118"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.97437 9.04498H8.80381M7.97437 12.2348H8.80381M7.97437 15.4247H8.80381"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.5957 13.2975H16.4251M15.5957 16.4873H16.4251"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M12.2215 19.2105V6.59521C12.2215 5.5995 11.4145 4.79248 10.4188 4.79248H6.35937C5.36366 4.79248 4.55664 5.5995 4.55664 6.59521V19.2105"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M19.4736 19.2086V12.1752C19.4736 11.1795 18.6666 10.3725 17.6709 10.3725H12.2207V19.2086"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
