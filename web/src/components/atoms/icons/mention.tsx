import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function MentionIcon({
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
        d="M15.6 8.6413V12.899C15.6 14.3906 16.8084 15.599 18.3 15.599C19.9589 15.599 21 14.2369 21 12C21 6.93859 16.9699 3 11.999 3C7.02908 3 3 7.03005 3 12.001C3 16.9709 7.03005 21 12.001 21C13.8146 21 15.5825 20.4522 17.0741 19.4335"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12.0004 8.39941C13.9882 8.39941 15.6004 10.0116 15.6004 11.9994C15.6004 13.9882 13.9882 15.5994 12.0004 15.5994C10.0126 15.5994 8.40039 13.9882 8.40039 11.9994C8.40039 10.0116 10.0126 8.39941 12.0004 8.39941Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
