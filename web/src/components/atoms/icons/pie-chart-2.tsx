import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PieChart2Icon({
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
        d="M20.6382 11.0614C20.6924 7.94172 16.861 2.91284 12.1908 2.99877C11.8265 3.01278 11.5341 3.30606 11.5219 3.67035C11.5051 5.28811 11.5089 8.0099 11.5146 9.84339C11.5173 10.9073 12.3729 11.7657 13.4368 11.7722C15.4048 11.7862 18.4049 11.7975 20.0368 11.7564C20.3786 11.7003 20.6317 11.408 20.6382 11.0614Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M8.46748 3.7486C7.18619 4.3225 6.06406 5.2 5.19821 6.30515C4.33234 7.41031 3.74884 8.70981 3.49819 10.0912C3.24754 11.4726 3.33729 12.8942 3.75969 14.2331C4.18208 15.5721 4.92438 16.7878 5.92235 17.7754C6.92032 18.7628 8.1439 19.4922 9.48719 19.9004C10.8305 20.3086 12.253 20.3834 13.6317 20.1181C15.0103 19.8529 16.3036 19.2557 17.3996 18.3781C18.4955 17.5007 19.361 16.3693 19.9214 15.0821"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
