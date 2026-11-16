import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function TranslateLanguage5Icon({
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
        d="M7.78313 3H16.2178C19.1659 3 21 5.08119 21 8.02638V15.9736C21 18.9188 19.1659 21 16.2169 21H7.78313C4.83503 21 3 18.9188 3 15.9736V8.02638C3 5.08119 4.84378 3 7.78313 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M7.91797 8.875H16.0832"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12 7.80078V8.873"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.5122 8.875C14.5852 9.02678 14.2145 14.3849 8.28906 16.1976"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M10.2637 12C11.008 13.3651 12.59 15.4589 15.5022 16.1098"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
