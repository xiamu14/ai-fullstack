import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ErrorIcon({
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
            d="M12 17.8096C11.448 17.8096 11 18.2566 11 18.8096V18.8776C11 19.4306 11.448 19.8436 12 19.8436C12.552 19.8436 13 19.3626 13 18.8096C13 18.2566 12.552 17.8096 12 17.8096Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M12 3.87695C11.448 3.87695 11 4.32395 11 4.87695V14.076C11 14.629 11.448 15.076 12 15.076C12.552 15.076 13 14.629 13 14.076V4.87695C13 4.32395 12.552 3.87695 12 3.87695Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M12 18.9996V18.9307"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12 5V14.1987"
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
