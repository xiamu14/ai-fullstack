import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PencilIcon({
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
        d="M4.72461 21H19.8128"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11.0195 6.61328L15.7682 10.064"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12.4621 4.67612C13.1619 3.75043 14.4796 3.56732 15.4053 4.26712L16.8326 5.34615C17.7583 6.04596 17.9414 7.36369 17.2416 8.28938L11.4176 15.9933C10.8587 16.7325 10.0502 17.2435 9.14265 17.4308L7.80723 17.7066C6.90302 17.8933 6.04104 17.2416 5.97412 16.3208L5.87529 14.9608C5.80812 14.0365 6.07922 13.1193 6.63808 12.38L12.4621 4.67612Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
