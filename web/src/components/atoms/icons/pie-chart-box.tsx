import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PieChartBoxIcon({
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
        d="M7.95118 20.2739H16.0485C18.8786 20.2739 20.6394 18.2769 20.6394 15.4486V7.82015C20.6394 4.99184 18.8786 2.9939 16.0476 2.9939H7.95118C5.121 2.9939 3.35938 4.99184 3.35938 7.82015V15.4486C3.35938 18.2769 5.1294 20.2739 7.95118 20.2739Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M16.4386 10.8082C16.4629 9.41089 14.748 7.15982 12.6566 7.19811C12.4932 7.20465 12.3625 7.33635 12.3568 7.49981C12.3493 8.22371 12.3512 9.44171 12.354 10.2637C12.355 10.7391 12.7379 11.123 13.2143 11.1268C14.0951 11.1323 15.4392 11.138 16.1696 11.1193C16.3219 11.094 16.4359 10.9633 16.4386 10.8082Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.72418 7.82343C9.14087 8.17197 8.64537 8.64982 8.27589 9.22012C7.90641 9.79045 7.67281 10.438 7.59312 11.1128C7.51343 11.7876 7.58977 12.4717 7.81626 13.1124C8.04274 13.7531 8.41331 14.3333 8.89942 14.8081C9.38551 15.2829 9.97416 15.6397 10.62 15.8511C11.2657 16.0625 11.9515 16.1228 12.6243 16.0274C13.2971 15.9319 13.939 15.6831 14.5005 15.3004C15.062 14.9176 15.5281 14.411 15.8628 13.8198"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
