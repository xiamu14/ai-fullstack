import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Delivery6Icon({
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
        d="M4.95351 5.05631L4.14088 7.08787C3.85599 7.80056 3.70841 8.56181 3.70748 9.32867L3.69534 16.717C3.68974 18.9943 4.72373 20.6055 7.00375 20.6111L17.6678 20.626C19.947 20.6317 20.9566 19.0269 20.9622 16.7497L20.9753 9.34828C20.9763 8.56835 20.8268 7.79495 20.5353 7.072L19.7209 5.04977C19.3136 4.03726 18.331 3.37408 17.2391 3.37408H7.43716C6.34338 3.37408 5.35889 4.04007 4.95351 5.05631Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.6369 16.2984H10.5129"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M3.82812 8.16656H20.8438"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M12.3359 8.16671V3.37408"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
