import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function LoginIcon({
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
            d="M7.29052 12.7699H3.2815C2.85523 12.7699 2.5 12.4299 2.5 11.9999C2.5 11.5799 2.85523 11.2299 3.2815 11.2299H7.29052L7.29083 6.45C7.29083 4 9.35611 2 11.8861 2H16.9254C19.445 2 21.5 4 21.5 6.44V17.56C21.5 20.01 19.445 22 16.9047 22H11.8758C9.35611 22 7.29083 20.01 7.29083 17.57L7.29052 12.7699L13.6932 12.77L12.041 14.37C11.7312 14.67 11.7312 15.16 12.041 15.46C12.1959 15.61 12.4024 15.68 12.6089 15.68C12.8051 15.68 13.0117 15.61 13.1666 15.46L16.1819 12.55C16.3368 12.41 16.4194 12.21 16.4194 12C16.4194 11.8 16.3368 11.6 16.1819 11.46L13.1666 8.55C12.8568 8.25 12.3508 8.25 12.041 8.55C11.7312 8.85 11.7312 9.34 12.041 9.64L13.6932 11.23L7.29052 11.2299V12.7699Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M15.8125 12.0218H3.77148"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12.8848 9.1058L15.8128 12.0218L12.8848 14.9378"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M8.50391 7.389V6.456C8.50391 4.421 10.1529 2.772 12.1889 2.772H17.0729C19.1029 2.772 20.7479 4.417 20.7479 6.447V17.587C20.7479 19.622 19.0979 21.272 17.0629 21.272H12.1779C10.1489 21.272 8.50391 19.626 8.50391 17.597V16.655"
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
