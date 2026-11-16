import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ArrowUpSquareIcon({
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
            d="M16.3399 2C19.7289 2 21.9999 4.38 21.9999 7.92V16.09C21.9999 19.62 19.7289 22 16.3399 22H7.66988C4.27988 22 1.99988 19.62 1.99988 16.09V7.92C1.99988 4.38 4.27988 2 7.66988 2H16.3399ZM12.5299 7.38C12.2499 7.1 11.7499 7.1 11.4699 7.38L7.71988 11.15C7.42988 11.44 7.42988 11.92 7.71988 12.21C8.01988 12.5 8.48988 12.5 8.78988 12.21L11.2499 9.73V16.08C11.2499 16.5 11.5899 16.83 11.9999 16.83C12.4199 16.83 12.7499 16.5 12.7499 16.08V9.73L15.2199 12.21C15.3599 12.35 15.5599 12.43 15.7499 12.43C15.9389 12.43 16.1299 12.35 16.2799 12.21C16.5699 11.92 16.5699 11.44 16.2799 11.15L12.5299 7.38Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M16.3341 2.75H7.66512C4.64512 2.75 2.75012 4.889 2.75012 7.916V16.084C2.75012 19.111 4.63512 21.25 7.66512 21.25H16.3341C19.3641 21.25 21.2501 19.111 21.2501 16.084V7.916C21.2501 4.889 19.3641 2.75 16.3341 2.75Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12.0001 7.914L12.0001 16.086"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M8.25217 11.6777L12.0002 7.9137L15.7482 11.6777"
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
