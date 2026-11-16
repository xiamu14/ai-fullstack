import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ArrowRightSquareIcon({
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
            d="M16.0799 2C19.6199 2 21.9999 4.28 21.9999 7.67V16.34C21.9999 19.729 19.6199 22 16.0799 22H7.90988C4.37988 22 1.99988 19.729 1.99988 16.34V7.67C1.99988 4.28 4.37988 2 7.90988 2H16.0799ZM12.8499 7.72C12.5599 7.43 12.0799 7.43 11.7899 7.72C11.4999 8.02 11.4999 8.49 11.7899 8.79L14.2699 11.25H7.91988C7.49988 11.25 7.16988 11.59 7.16988 12C7.16988 12.42 7.49988 12.75 7.91988 12.75H14.2699L11.7899 15.22C11.6499 15.36 11.5699 15.56 11.5699 15.75C11.5699 15.939 11.6499 16.13 11.7899 16.28C12.0799 16.57 12.5599 16.57 12.8499 16.28L16.6199 12.53C16.8999 12.25 16.8999 11.75 16.6199 11.47L12.8499 7.72Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M21.25 16.3341V7.6651C21.25 4.6451 19.111 2.7501 16.084 2.7501H7.916C4.889 2.7501 2.75 4.6351 2.75 7.6651L2.75 16.3341C2.75 19.3641 4.889 21.2501 7.916 21.2501H16.084C19.111 21.2501 21.25 19.3641 21.25 16.3341Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M16.0859 12.0001H7.91394"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12.3223 8.2521L16.0863 12.0001L12.3223 15.7481"
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
