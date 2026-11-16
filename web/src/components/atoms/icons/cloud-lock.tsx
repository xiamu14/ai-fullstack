import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function CloudLockIcon({
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
        d="M13.7499 15.5208V14.4387C13.7381 13.4726 12.9449 12.6993 11.9787 12.7111C11.0334 12.7228 10.2683 13.4844 10.252 14.4306V15.5208"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M13.4644 20.045H10.5343C9.73112 20.045 9.08008 19.3939 9.08008 18.5908V16.9464C9.08008 16.1432 9.73112 15.4922 10.5343 15.4922H13.4644C14.2676 15.4922 14.9186 16.1432 14.9186 16.9464V18.5908C14.9186 19.3939 14.2676 20.045 13.4644 20.045Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M18.5637 16.7662C19.9998 16.1172 21 14.6714 21 12.992C21 10.3962 19.1698 8.85302 16.897 8.85107C16.897 7.21842 15.6165 3.95312 12 3.95312C8.38346 3.95312 7.10303 7.21842 7.10303 8.85107C4.83308 8.8715 3 10.3962 3 12.992C3 14.6714 3.99924 16.1172 5.43632 16.7662"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
