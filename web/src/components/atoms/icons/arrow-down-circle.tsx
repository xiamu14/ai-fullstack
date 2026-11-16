import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ArrowDownCircleIcon({
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
            d="M12.0001 1.99988C17.5101 1.99988 22.0001 6.47988 22.0001 11.9999C22.0001 17.5099 17.5101 21.9999 12.0001 21.9999C6.48012 21.9999 2.00012 17.5099 2.00012 11.9999C2.00012 6.47988 6.48012 1.99988 12.0001 1.99988ZM9.06012 10.0299C8.77012 9.72988 8.29012 9.72988 8.00012 10.0199C7.70012 10.3199 7.70012 10.7899 8.00012 11.0799L11.4701 14.5699C11.6101 14.7099 11.8001 14.7899 12.0001 14.7899C12.2001 14.7899 12.3901 14.7099 12.5301 14.5699L16.0001 11.0799C16.1501 10.9399 16.2201 10.7499 16.2201 10.5599C16.2201 10.3599 16.1501 10.1699 16.0001 10.0199C15.7001 9.72988 15.2301 9.72988 14.9401 10.0299L12.0001 12.9799L9.06012 10.0299Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M2.75024 12C2.75024 17.108 6.89124 21.25 12.0002 21.25C17.1082 21.25 21.2502 17.108 21.2502 12C21.2502 6.892 17.1082 2.75 12.0002 2.75C6.89124 2.75 2.75024 6.892 2.75024 12Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M8.52954 10.5577L12.0005 14.0437L15.4715 10.5577"
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
