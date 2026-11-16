import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function InfoIcon({ size = 24, variant = "line", ...props }: IconProps) {
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
            d="M12 3.91016C11.448 3.91016 11 4.38916 11 4.94216C11 5.49516 11.448 5.94216 12 5.94216C12.552 5.94216 13 5.49516 13 4.94216V4.87716C13 4.32416 12.552 3.91016 12 3.91016Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M12 8.67871C11.448 8.67871 11 9.12571 11 9.67871V18.8777C11 19.4307 11.448 19.8777 12 19.8777C12.552 19.8777 13 19.4307 13 18.8777V9.67871C13 9.12571 12.552 8.67871 12 8.67871Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M12 5V5.06543"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12 19.0006V9.80078"
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
