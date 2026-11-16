import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Chat6Icon({
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
        d="M10.8056 19.466L9.44093 18.0967C9.05237 17.7068 8.52556 17.4884 7.97634 17.4884H6.95075C4.8622 17.4884 3.16876 15.7893 3.16876 13.6936V7.03196C3.16876 4.93636 4.8622 3.23813 6.95075 3.23813H16.6677C18.7563 3.23813 20.4488 4.93636 20.4488 7.03196V13.6936C20.4488 15.7893 18.7563 17.4884 16.6677 17.4884H15.6422C15.0929 17.4884 14.5661 17.7068 14.1775 18.0967L12.812 19.466C12.2581 20.0227 11.3605 20.0227 10.8056 19.466Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.97061 12.6499V9.32185M11.8081 12.65V7.51126M15.6465 12.6499V10.5291"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
