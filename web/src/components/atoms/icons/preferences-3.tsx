import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Preferences3Icon({
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
        d="M17.8161 18.583C17.8076 19.7272 16.8735 20.6483 15.7293 20.6408C14.5888 20.637 13.6669 19.7095 13.6706 18.568V18.555C13.679 17.4098 14.6131 16.4889 15.7573 16.4963C16.9016 16.5037 17.8235 17.4378 17.8161 18.583Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M11.3548 12.014C11.3464 13.1591 10.4124 14.0801 9.26809 14.0726C8.12758 14.0689 7.20566 13.1405 7.20939 12V11.986C7.21779 10.8417 8.15187 9.91978 9.29612 9.92819C10.4404 9.93566 11.3623 10.8697 11.3548 12.014Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M17.426 5.44677C17.4177 6.591 16.4836 7.51201 15.3394 7.50453C14.1988 7.50079 13.2769 6.57326 13.2806 5.43182V5.41875C13.2891 4.27357 14.2231 3.35257 15.3674 3.36005C16.5116 3.36751 17.4335 4.30159 17.426 5.44677Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M4.4625 18.5681H13.6706M17.8187 18.5681H20.4584"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M4.4625 12.0019H7.20775M11.355 12.0019H20.4585"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M4.4625 5.43187H13.2764M17.4228 5.43187H20.4576"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
