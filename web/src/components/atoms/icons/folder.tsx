import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function FolderIcon({
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
            d="M9.05 2.00016C9.981 1.99034 10.85 2.42034 11.42 3.15034L12.3 4.32034C12.58 4.67034 13 4.88034 13.45 4.88034H16.52C20.21 4.88034 22.01 6.85034 22 10.8903V15.7603C22 19.6203 19.62 22.0003 15.75 22.0003H8.24C4.39 22.0003 2 19.6203 2 15.7503V8.24034C2 4.10034 3.84 2.00016 7.47 2.00016H9.05ZM16.63 13.7903H7.37C6.95 13.7903 6.62 14.1203 6.62 14.5403C6.62 14.9503 6.95 15.2903 7.37 15.2903H16.63C17.04 15.2903 17.37 14.9503 17.37 14.5403C17.37 14.1203 17.04 13.7903 16.63 13.7903Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M21.4189 15.7321C21.4189 19.3101 19.3099 21.4191 15.7319 21.4191H7.94988C4.36288 21.4191 2.24988 19.3101 2.24988 15.7321V7.93212C2.24988 4.35912 3.56388 2.25012 7.14288 2.25012H9.14288C9.86088 2.25112 10.5369 2.58812 10.9669 3.16312L11.8799 4.37712C12.3119 4.95112 12.9879 5.28912 13.7059 5.29012H16.5359C20.1229 5.29012 21.4469 7.11612 21.4469 10.7671L21.4189 15.7321Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M7.48035 14.463H16.2153"
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
