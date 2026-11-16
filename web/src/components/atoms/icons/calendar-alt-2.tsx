import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function CalendarAlt2Icon({
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
        d="M4.30859 9.75766H19.7084"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.4961 3.35999V6.20326"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M8.51733 3.35999V6.20326"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.6661 4.72501H8.35051C5.81267 4.72501 4.22852 6.13823 4.22852 8.73585V16.5558C4.22852 19.1945 5.81267 20.6404 8.35051 20.6404H15.6586C18.2039 20.6404 19.7806 19.2197 19.7806 16.6212V8.73585C19.788 6.13823 18.2114 4.72501 15.6661 4.72501Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
