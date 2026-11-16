import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function InfoSquareIcon({
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
            d="M16.3399 1.99915C19.7299 1.99915 21.9999 4.37915 21.9999 7.91915V16.0901C21.9999 19.6201 19.7299 21.9991 16.3399 21.9991H7.66988C4.27988 21.9991 1.99988 19.6201 1.99988 16.0901V7.91915C1.99988 4.37915 4.27988 1.99915 7.66988 1.99915H16.3399ZM11.9899 10.4801C11.5099 10.4801 11.1199 10.8791 11.1199 11.3601V15.7801C11.1199 16.2601 11.5099 16.6501 11.9899 16.6501C12.4799 16.6501 12.8699 16.2601 12.8699 15.7801V11.3601C12.8699 10.8791 12.4799 10.4801 11.9899 10.4801ZM12.0099 7.31015C11.5199 7.31015 11.1299 7.70015 11.1299 8.19015C11.1299 8.66915 11.5199 9.06015 11.9899 9.06015C12.4899 9.06015 12.8799 8.66915 12.8799 8.19015C12.8799 7.70015 12.4899 7.31015 12.0099 7.31015Z"
            fill="currentColor"
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
            d="M11.9941 15.8917V11.9998M11.9941 8.35426V8.29102"
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
