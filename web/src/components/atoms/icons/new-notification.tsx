import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function NewNotificationIcon({
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
            d="M13.094 5.28831C13.094 4.38331 13.311 3.52931 13.687 2.76831H7.58604C4.46804 2.76831 2.37305 4.96031 2.37305 8.22231V16.0673C2.37305 19.3294 4.46804 21.5213 7.58604 21.5213H15.91C19.03 21.5213 21.126 19.3294 21.126 16.0673V10.5193C20.419 10.8333 19.638 11.0103 18.816 11.0103C15.661 11.0103 13.094 8.44331 13.094 5.28831Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M18.7701 8.19052C20.3451 8.19052 21.6261 6.90952 21.6261 5.33452C21.6261 3.75952 20.3451 2.47852 18.7701 2.47852C17.1951 2.47852 15.9141 3.75952 15.9141 5.33452C15.9141 6.90952 17.1951 8.19052 18.7701 8.19052Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M12.4971 3.69336H7.56659C4.74762 3.69336 3 5.69009 3 8.50808V16.0737C3 18.8926 4.71357 20.8806 7.56659 20.8806H15.6168C18.4357 20.8806 20.1843 18.8926 20.1843 16.0737V11.3582"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M18.6449 3.12012C19.9458 3.12012 21.0006 4.17492 21.0006 5.47591C21.0006 6.7769 19.9458 7.8317 18.6449 7.8317C17.3439 7.8317 16.2891 6.7769 16.2891 5.47591C16.2891 4.17492 17.3439 3.12012 18.6449 3.12012Z"
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
