import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Email2Alt2Icon({
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
        d="M17.3124 9.16602L13.3135 12.4177C12.5604 13.0161 11.4931 13.0161 10.74 12.4177L6.70703 9.16602"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
