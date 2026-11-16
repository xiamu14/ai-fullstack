import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Flashlight2Icon({
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
        d="M18.2765 12.7694L16.9791 14.0668C16.5607 14.4852 16.018 14.7561 15.4323 14.8402L14.1013 15.0298C13.4511 15.1232 12.8486 15.424 12.3835 15.8882L8.93869 19.333C7.66277 20.6099 5.59288 20.6099 4.31601 19.333C3.04009 18.057 3.04009 15.9872 4.31601 14.7113L7.76177 11.2655C8.22601 10.8013 8.52678 10.1988 8.62017 9.5487L8.80979 8.21766C8.89386 7.63201 9.16473 7.08839 9.5832 6.66992L10.8806 5.37344C11.5952 4.65889 12.7544 4.65889 13.4689 5.37344L18.2765 10.181C18.9911 10.8956 18.9911 12.0548 18.2765 12.7694Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.286 3.77156V3.01123"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M19.8779 8.36249H20.6382"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M18.1135 5.51159L19.125 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M10.3261 13.3237L8.93906 14.7108"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.86343 6.39001L17.2594 13.7859"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
