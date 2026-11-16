import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function VoiceIcon({
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
            d="M19.5313 9.82626C20.066 9.82626 20.5 10.2539 20.5 10.7829C20.5 15.0866 17.2006 18.6404 12.9692 19.1178V21.0434C12.9692 21.5714 12.5352 22 12.0005 22C11.4648 22 11.0318 21.5714 11.0318 21.0434V19.1178C6.79945 18.6404 3.5 15.0866 3.5 10.7829C3.5 10.2539 3.93398 9.82626 4.46872 9.82626C5.00345 9.82626 5.43743 10.2539 5.43743 10.7829C5.43743 14.3558 8.38136 17.2629 12.0005 17.2629C15.6186 17.2629 18.5626 14.3558 18.5626 10.7829C18.5626 10.2539 18.9966 9.82626 19.5313 9.82626ZM12.1748 2C14.5781 2 16.5272 3.92373 16.5272 6.29706V10.9203C16.5272 13.2927 14.5781 15.2174 12.1748 15.2174H11.825C9.42166 15.2174 7.47358 13.2927 7.47358 10.9203V6.29706C7.47358 3.92373 9.42166 2 11.825 2H12.1748Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M11.9998 22V18.8391"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M11.9998 14.8481C9.75662 14.8481 7.93774 13.0218 7.93774 10.7682V6.08095C7.93774 3.82732 9.75662 2 11.9998 2C14.2441 2 16.0619 3.82732 16.0619 6.08095V10.7682C16.0619 13.0218 14.2441 14.8481 11.9998 14.8481Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M20 10.8006C20 15.2394 16.4188 18.8383 11.9995 18.8383C7.58117 18.8383 4 15.2394 4 10.8006"
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
