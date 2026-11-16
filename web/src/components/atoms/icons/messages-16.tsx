import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Messages16Icon({
  size = 24,
  variant: _variant = "line",
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
      <path
        d="M17.9184 18.2149C15.2787 20.8554 11.3669 21.4261 8.16863 19.9466C7.696 19.756 7.30836 19.6028 6.94033 19.6028C5.91473 19.6085 4.63787 20.6032 3.97468 19.9401C3.3115 19.2768 4.30627 18 4.30627 16.9688C4.30627 16.5998 4.15869 16.2197 3.96908 15.7461C2.48859 12.5479 3.06023 8.63692 5.6999 5.99632C9.07094 2.62623 14.5474 2.62623 17.9184 5.99632C21.295 9.3739 21.2895 14.8438 17.9184 18.2149Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.6497 12.3675V12.4345M15.9212 12.3819C15.9212 12.5327 15.7989 12.655 15.648 12.655C15.4972 12.655 15.375 12.5327 15.375 12.3819C15.375 12.2311 15.4972 12.1088 15.648 12.1088C15.7989 12.1088 15.9212 12.2311 15.9212 12.3819Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M11.8041 12.3675V12.4345M12.0757 12.3819C12.0757 12.5327 11.9533 12.655 11.8024 12.655C11.6516 12.655 11.5294 12.5327 11.5294 12.3819C11.5294 12.2311 11.6516 12.1088 11.8024 12.1088C11.9533 12.1088 12.0757 12.2311 12.0757 12.3819Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.95846 12.3675V12.4345M8.23001 12.3819C8.23001 12.5327 8.10762 12.655 7.95679 12.655C7.80595 12.655 7.68375 12.5327 7.68375 12.3819C7.68375 12.2311 7.80595 12.1088 7.95679 12.1088C8.10762 12.1088 8.23001 12.2311 8.23001 12.3819Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
