import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function TickSquareIcon({
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
            d="M16.3401 1.99988C19.7301 1.99988 22.0001 4.37988 22.0001 7.91988V16.0909C22.0001 19.6199 19.7301 21.9999 16.3401 21.9999H7.67012C4.28012 21.9999 2.00012 19.6199 2.00012 16.0909V7.91988C2.00012 4.37988 4.28012 1.99988 7.67012 1.99988H16.3401ZM16.1801 8.99988C15.8401 8.65988 15.2801 8.65988 14.9401 8.99988L10.8101 13.1299L9.06012 11.3799C8.72012 11.0399 8.16012 11.0399 7.82012 11.3799C7.48012 11.7199 7.48012 12.2699 7.82012 12.6199L10.2001 14.9899C10.3701 15.1599 10.5901 15.2399 10.8101 15.2399C11.0401 15.2399 11.2601 15.1599 11.4301 14.9899L16.1801 10.2399C16.5201 9.89988 16.5201 9.34988 16.1801 8.99988Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M16.334 2.75018H7.665C4.644 2.75018 2.75 4.88918 2.75 7.91618V16.0842C2.75 19.1112 4.635 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91618C21.25 4.88918 19.364 2.75018 16.334 2.75018Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M8.43945 12.0002L10.8135 14.3732L15.5595 9.6272"
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
