import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Email2Icon({
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
        d="M21 15.0944C21 17.8596 19.1552 20.1072 16.4183 20.1004H7.58173C4.84476 20.1072 3 17.8596 3 15.0944V8.91315C3 6.15088 4.84476 3.90039 7.58173 3.90039H16.4183C19.1552 3.90039 21 6.15088 21 8.91315V15.0944Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M17.3046 8.91016L13.3057 12.1618C12.5526 12.7602 11.4853 12.7602 10.7322 12.1618L6.69922 8.91016"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.96256 11.542L6.69531 15.0904M17.3056 15.0909L14.0743 11.5425"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
