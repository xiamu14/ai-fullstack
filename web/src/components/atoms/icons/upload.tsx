import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function UploadIcon({
  size = 24,
  variant = "line",
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
      {variant === "fill" ? (
        <>
          <path
            d="M2 13.2875C2 10.8758 3.87791 8.89627 6.23116 8.78512L6.44 8.7802H11.23V14.8849C11.23 15.3224 11.57 15.6683 12 15.6683C12.385 15.6683 12.7112 15.3776 12.7629 14.9922L12.77 14.8849V8.7802H17.55C19.93 8.7802 21.8853 10.6909 21.9951 13.0945L22 13.3078V18.2628C22 20.6843 20.1221 22.6641 17.7688 22.7753L17.56 22.7802H6.45C4.06029 22.7802 2.1141 20.8599 2.00484 18.4651L2 18.2526V13.2875ZM8.5502 6.24C8.26838 5.96727 8.24276 5.53752 8.46583 5.23624L8.5402 5.15L11.4502 2.23C11.6002 2.08 11.7902 2 12.0002 2C12.1602 2 12.3202 2.0512 12.4495 2.14848L12.5402 2.23L15.4502 5.15C15.6002 5.3 15.6802 5.5 15.6802 5.69C15.6802 5.89 15.6002 6.09 15.4502 6.24C15.1775 6.51273 14.7477 6.53752 14.4464 6.31438L14.3602 6.24L12.7702 4.64L12.77 8.7802H11.23L11.2302 4.64L9.6402 6.24C9.3402 6.54 8.8502 6.54 8.5502 6.24Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M7.38948 8.98397H6.45648C4.42148 8.98397 2.77148 10.634 2.77148 12.669V17.544C2.77148 19.578 4.42148 21.228 6.45648 21.228H17.5865C19.6215 21.228 21.2715 19.578 21.2715 17.544V12.659C21.2715 10.63 19.6265 8.98397 17.5975 8.98397L16.6545 8.98397"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12.0214 2.19044V14.2314"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M9.10547 5.11877L12.0205 2.19077L14.9365 5.11877"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}
