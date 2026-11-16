import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PieChartIcon({
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
        d="M10.6618 3.59764C6.5872 3.8544 3.35938 7.3543 3.35938 11.6342C3.35938 14.3433 4.65274 16.7399 6.63555 18.1992C7.78521 19.0455 9.16665 19.5764 10.6621 19.6706C10.927 19.6873 11.1423 19.4706 11.1423 19.2052V4.063C11.1423 3.79766 10.9266 3.58096 10.6618 3.59764Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M20.6396 13.6924C20.659 13.4277 20.442 13.2122 20.1767 13.2122H14.6641C14.3987 13.2122 14.1836 13.4274 14.1836 13.6927V19.2053C14.1836 19.4707 14.399 19.6876 14.6637 19.6682C15.2784 19.6232 15.8694 19.4923 16.4244 19.2874C18.7521 18.4286 20.4506 16.2701 20.6396 13.6924Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M20.1767 10.0558C20.442 10.0558 20.659 9.83988 20.6396 9.57525C20.4054 6.38305 17.8563 3.83398 14.6641 3.59978C14.3995 3.58036 14.1836 3.79732 14.1836 4.06266V9.57529C14.1836 9.84065 14.3987 10.0558 14.6641 10.0558H20.1767Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
