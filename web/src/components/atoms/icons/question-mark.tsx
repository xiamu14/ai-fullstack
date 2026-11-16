import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function QuestionMarkIcon({
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
            d="M11.5917 17.9482C11.0397 17.9482 10.5917 18.3952 10.5917 18.9482V19.0182C10.5917 19.5712 11.0397 19.9832 11.5917 19.9832C12.1437 19.9832 12.5917 19.5012 12.5917 18.9482C12.5917 18.3952 12.1437 17.9482 11.5917 17.9482Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M12.0007 4.01758C9.24972 4.01758 7.01172 6.25458 7.01172 9.00558C7.01172 9.55858 7.45972 10.0056 8.01172 10.0056C8.56372 10.0056 9.01172 9.55858 9.01172 9.00558C9.01172 7.35858 10.3527 6.01758 12.0007 6.01758C13.6487 6.01758 14.9887 7.35858 14.9887 9.00558C14.9887 10.0156 14.4707 10.8136 13.4377 11.3846L13.2097 11.5126C12.1577 12.1006 10.5667 12.9886 10.5917 14.9576C10.5997 15.5056 11.0457 15.9456 11.5917 15.9456H11.6047C12.1567 15.9386 12.5987 15.4846 12.5917 14.9326C12.5827 14.2056 13.1877 13.8156 14.1847 13.2586L14.4157 13.1286C16.0747 12.2126 16.9887 10.7476 16.9887 9.00558C16.9887 6.25458 14.7507 4.01758 12.0007 4.01758Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M11.5918 18.9998V18.9287"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M11.5921 14.9275C11.5731 13.44 12.9254 12.8084 13.9324 12.2359C15.1585 11.5582 15.9893 10.4822 15.9893 8.9878C15.9893 6.77469 14.1996 5 12.0005 5C9.78841 5 8.01172 6.77469 8.01172 8.9878"
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
