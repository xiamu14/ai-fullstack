import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PoundSquareIcon({
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
        d="M7.95181 2.94H16.0491C18.8793 2.94 20.64 4.93794 20.64 7.76532V15.3947C20.64 18.222 18.8793 20.22 16.0482 20.22H7.95181C5.12163 20.22 3.36 18.222 3.36 15.3947V7.76532C3.36 4.93794 5.13003 2.94 7.95181 2.94Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M10.7771 11.3437C11.3908 12.0994 11.4422 13.1661 10.9042 13.9778C10.5175 14.4784 10.1047 14.9595 9.66562 15.4163H14.1089"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M14.2212 8.54075C13.4347 7.59923 12.0337 7.47406 11.0921 8.26054C10.1693 9.03206 10.0282 10.3986 10.7746 11.3429"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M8.925 11.715H13.3683"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
