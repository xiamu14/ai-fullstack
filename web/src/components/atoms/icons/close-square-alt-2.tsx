import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function CloseSquareAlt2Icon({
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
            clipRule="evenodd"
            d="M14.864 14.858C14.718 15.004 14.526 15.078 14.334 15.078C14.142 15.078 13.95 15.004 13.803 14.858L11.997 13.051L10.196 14.853C9.903 15.146 9.428 15.146 9.135 14.853C8.843 14.56 8.843 14.086 9.135 13.793L10.936 11.991L9.134 10.188C8.841 9.895 8.841 9.421 9.134 9.128C9.427 8.835 9.901 8.835 10.194 9.128L11.997 10.93L13.798 9.129C14.091 8.837 14.565 8.837 14.858 9.129C15.151 9.422 15.151 9.897 14.858 10.19L13.058 11.991L14.864 13.797C15.157 14.09 15.157 14.565 14.864 14.858ZM16.217 2.5H7.782C4.622 2.5 2.5 4.72 2.5 8.026V15.974C2.5 19.279 4.622 21.5 7.782 21.5H16.216C19.376 21.5 21.5 19.279 21.5 15.974V8.026C21.5 4.72 19.377 2.5 16.217 2.5Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M7.78216 3H16.2169C19.165 3 21 5.08119 21 8.02638V15.9736C21 18.9188 19.165 21 16.2159 21H7.78216C4.83405 21 3 18.9188 3 15.9736V8.02638C3 5.08119 4.84281 3 7.78216 3Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M14.3284 9.6601L9.66596 14.3226M14.3343 14.3285L9.66406 9.6582"
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
