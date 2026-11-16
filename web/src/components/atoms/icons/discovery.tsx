import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function DiscoveryIcon({
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
            d="M11.9999 2.00012C17.5199 2.00012 21.9999 6.48012 21.9999 12.0001C21.9999 17.5301 17.5199 22.0001 11.9999 22.0001C6.46988 22.0001 1.99988 17.5301 1.99988 12.0001C1.99988 6.48012 6.46988 2.00012 11.9999 2.00012ZM15.8499 8.71012C15.9599 8.36012 15.6399 8.03012 15.2899 8.14012L10.1699 9.74012C9.95988 9.81012 9.78988 9.97012 9.72988 10.1801L8.12988 15.3101C8.01988 15.6501 8.34988 15.9801 8.68988 15.8701L13.7899 14.2701C13.9999 14.2101 14.1699 14.0401 14.2299 13.8301L15.8499 8.71012Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M8.26953 14.9519L9.86221 9.8627L14.9515 8.27002L13.3588 13.3593L8.26953 14.9519Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M21.222 11.611C21.222 16.919 16.919 21.222 11.611 21.222C6.30298 21.222 2 16.919 2 11.611C2 6.30298 6.30298 2 11.611 2C16.919 2 21.222 6.30298 21.222 11.611Z"
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
