import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Truck3Icon({
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
        d="M16.198 15.2656C17.2566 15.2656 18.1147 16.1238 18.1147 17.1823C18.1147 18.2409 17.2566 19.099 16.198 19.099C15.1394 19.099 14.2812 18.2409 14.2812 17.1823C14.2812 16.1238 15.1394 15.2656 16.198 15.2656Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M7.05343 15.2656C8.112 15.2656 8.97014 16.1238 8.97014 17.1823C8.97014 18.2409 8.112 19.099 7.05343 19.099C5.99486 19.099 5.13672 18.2409 5.13672 17.1823C5.13672 16.1238 5.99486 15.2656 7.05343 15.2656Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M16.1968 15.266L16.1971 6.98007C16.1971 5.83199 15.266 4.90088 14.1179 4.90088H5.04806C3.91749 4.90088 3 5.8174 3 6.94894V15.1042C3 16.2523 3.93111 17.1834 5.07919 17.1834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M18.1133 17.1825L18.9206 17.1827C20.0686 17.1827 20.9997 16.2516 20.9997 15.1035V11.6602C20.9997 10.7243 20.4471 9.87585 19.5909 9.49835L16.1973 8.00098"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M18.5977 12.4106H20.9989"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.96875 17.1826L14.2805 17.1833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
