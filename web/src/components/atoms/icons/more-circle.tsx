import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function MoreCircleIcon({
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
            d="M12.0001 1.99988C17.5201 1.99988 22.0001 6.47988 22.0001 11.9999C22.0001 17.5199 17.5201 21.9999 12.0001 21.9999C6.47012 21.9999 2.00012 17.5199 2.00012 11.9999C2.00012 6.47988 6.47012 1.99988 12.0001 1.99988ZM16.4801 10.8009C15.8101 10.8009 15.2801 11.3399 15.2801 11.9999C15.2801 12.6599 15.8101 13.1999 16.4801 13.1999C17.1401 13.1999 17.6701 12.6599 17.6701 11.9999C17.6701 11.3399 17.1401 10.8009 16.4801 10.8009ZM12.0001 10.8009C11.3401 10.8009 10.8001 11.3399 10.8001 11.9999C10.8001 12.6599 11.3401 13.1999 12.0001 13.1999C12.6601 13.1999 13.1901 12.6599 13.1901 11.9999C13.1901 11.3399 12.6601 10.8009 12.0001 10.8009ZM7.52012 10.8009C6.86012 10.8009 6.32012 11.3399 6.32012 11.9999C6.32012 12.6599 6.86012 13.1999 7.52012 13.1999C8.18012 13.1999 8.71012 12.6599 8.71012 11.9999C8.71012 11.3399 8.18012 10.8009 7.52012 10.8009Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M12.0002 2.75009C17.1082 2.75009 21.2502 6.89109 21.2502 12.0001C21.2502 17.1081 17.1082 21.2501 12.0002 21.2501C6.89124 21.2501 2.75024 17.1081 2.75024 12.0001C2.75024 6.89209 6.89224 2.75009 12.0002 2.75009Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M15.9397 12.013H15.9487"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M11.9299 12.013H11.9389"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M7.92212 12.013H7.93112"
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
