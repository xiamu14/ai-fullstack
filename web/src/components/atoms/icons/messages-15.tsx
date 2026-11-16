import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Messages15Icon({
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
        d="M8.16799 19.9727C11.3667 21.4571 15.2781 20.8845 17.9183 18.2354C21.289 14.8533 21.2955 9.36381 17.9183 5.97525C14.5478 2.59325 9.07111 2.59325 5.69957 5.97525C3.06025 8.62444 2.48868 12.549 3.96898 15.7586C4.15857 16.2327 4.30613 16.6151 4.30613 16.9853C4.30613 18.0198 3.31148 19.3008 3.97458 19.9662C4.63769 20.6316 5.91531 19.6335 6.93985 19.6279C7.30876 19.6279 7.69541 19.7816 8.16799 19.9727Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M8.66481 10.7006H15.1165M8.61374 14.4458H11.8648"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
