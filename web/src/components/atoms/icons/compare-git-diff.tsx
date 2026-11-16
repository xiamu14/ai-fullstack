import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function CompareGitDiffIcon({
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
        d="M6.49512 9.53125V13.4441C6.49512 14.5171 6.92153 15.5456 7.67998 16.304L10.8781 19.5021"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M10.877 16.1328L10.8772 19.5033L7.50586 19.5039"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M6.53837 4.45703C7.93993 4.45703 9.07674 5.59384 9.07674 6.9954C9.07674 8.39696 7.93993 9.53377 6.53837 9.53377C5.1368 9.53377 4 8.39696 4 6.9954C4 5.59384 5.1368 4.45703 6.53837 4.45703Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M13.123 7.86719V4.49609H16.4941"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M17.4622 19.5455C16.0606 19.5455 14.9238 18.4087 14.9238 17.0071C14.9238 15.6056 16.0606 14.4688 17.4622 14.4688C18.8638 14.4688 20.0006 15.6056 20.0006 17.0071C20.0006 18.4087 18.8638 19.5455 17.4622 19.5455Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M17.506 14.4669V10.5541C17.506 9.48108 17.0796 8.45263 16.3211 7.69418L13.123 4.49609"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
