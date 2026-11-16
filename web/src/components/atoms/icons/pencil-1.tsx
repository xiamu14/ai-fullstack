import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Pencil1Icon({
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
        d="M11.3591 3H7.78206C4.84592 3 3.00391 5.08126 3.00391 8.02615V15.9729C3.00391 18.9187 4.83717 21 7.78206 21H16.217C19.1648 21 20.9961 18.9187 20.9961 15.9729V12.3919"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M13.1614 14.3079L11.8913 14.5209C10.9615 14.6765 10.1397 13.9014 10.2409 12.9639L10.3829 11.6538C10.4519 11.0207 10.7165 10.4255 11.1405 9.95091L16.6763 3.90844C17.3298 3.20237 18.4337 3.15957 19.1407 3.81313L20.3087 4.89461C21.0158 5.54914 21.0586 6.65201 20.404 7.35906L14.9286 13.3344C14.4676 13.8499 13.8442 14.1932 13.1614 14.3079Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M15.5039 5.20312L19.2317 8.65374"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
