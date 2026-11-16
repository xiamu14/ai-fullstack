import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function AddDocumentsIcon({
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
            clipRule="evenodd"
            d="M13.85 16.2049H12.75V17.2949C12.75 17.7149 12.41 18.0449 12 18.0449C11.59 18.0449 11.25 17.7149 11.25 17.2949V16.2049H10.15C9.74001 16.2049 9.40001 15.8649 9.40001 15.4549C9.40001 15.0349 9.74001 14.7049 10.15 14.7049H11.25V13.6049C11.25 13.1849 11.59 12.8549 12 12.8549C12.41 12.8549 12.75 13.1849 12.75 13.6049V14.7049H13.85C14.26 14.7049 14.6 15.0349 14.6 15.4549C14.6 15.8649 14.26 16.2049 13.85 16.2049ZM17.24 8.83496H6.76001C4.66001 8.83496 2.95001 10.5549 2.95001 12.6549V17.8049C2.95001 19.9149 4.66001 21.6249 6.76001 21.6249H17.24C19.34 21.6249 21.05 19.9149 21.05 17.8049V12.6549C21.05 10.5549 19.34 8.83496 17.24 8.83496Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M8.71881 3.875H15.2808C15.6948 3.875 16.0308 3.539 16.0308 3.125C16.0308 2.711 15.6948 2.375 15.2808 2.375H8.71881C8.30481 2.375 7.96881 2.711 7.96881 3.125C7.96881 3.539 8.30481 3.875 8.71881 3.875Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M6.1817 6.9873H17.8187C18.2327 6.9873 18.5687 6.6513 18.5687 6.2373C18.5687 5.8233 18.2327 5.4873 17.8187 5.4873H6.1817C5.7677 5.4873 5.4317 5.8233 5.4317 6.2373C5.4317 6.6513 5.7677 6.9873 6.1817 6.9873Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M20.5496 17.6843V12.5277C20.5496 10.6976 19.0659 9.21484 17.2367 9.21484H6.76305C4.93295 9.21484 3.44922 10.6976 3.44922 12.5277V17.6843C3.44922 19.5144 4.93295 20.9981 6.76305 20.9981H17.2367C19.0659 20.9981 20.5496 19.5144 20.5496 17.6843Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M10.1523 15.3246H13.8495M12.0004 13.4766V17.1737"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M6.18164 6.11169H17.818M8.7185 3H15.28"
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
