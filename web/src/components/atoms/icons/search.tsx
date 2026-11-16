import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function SearchIcon({
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
            d="M17.6207 17.6543C18.0072 17.2704 18.6268 17.2704 19.0134 17.6543L21.568 19.7164H21.6124C22.1292 20.2388 22.1292 21.0858 21.6124 21.6082C21.0955 22.1306 20.2576 22.1306 19.7407 21.6082L17.6207 19.1785L17.5403 19.0877C17.3904 18.898 17.3076 18.6615 17.3076 18.4164C17.3076 18.1304 17.4203 17.8562 17.6207 17.6543ZM10.5776 2C12.8526 2 15.0343 2.91344 16.6429 4.53936C18.2516 6.16529 19.1553 8.37052 19.1553 10.6699C19.1553 15.4582 15.3149 19.3399 10.5776 19.3399C5.84034 19.3399 2 15.4582 2 10.6699C2 5.88166 5.84034 2 10.5776 2Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M20.7545 11.7666C20.7545 16.7308 16.7301 20.7551 11.7659 20.7551C6.80166 20.7551 2.77734 16.7308 2.77734 11.7666C2.77734 6.80233 6.80166 2.77802 11.7659 2.77802C16.7301 2.77802 20.7545 6.80233 20.7545 11.7666Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M18.0176 18.4851L21.5416 22"
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
