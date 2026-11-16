import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function SmartPhoneIcon({
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
            d="M13.4 7.45H10.6C10.186 7.45 9.85002 7.114 9.85002 6.7C9.85002 6.286 10.186 5.95 10.6 5.95H13.4C13.814 5.95 14.15 6.286 14.15 6.7C14.15 7.114 13.814 7.45 13.4 7.45ZM12 18.15C11.467 18.15 11.05 17.733 11.05 17.2C11.05 16.656 11.552 16.25 12 16.25C12.449 16.25 12.95 16.656 12.95 17.2C12.95 17.744 12.449 18.15 12 18.15ZM14.75 2.5H9.25002C6.98902 2.5 5.15002 4.339 5.15002 6.599V17.4C5.15002 19.661 6.98902 21.5 9.25002 21.5H14.75C17.011 21.5 18.85 19.661 18.85 17.4V6.599C18.85 4.339 17.011 2.5 14.75 2.5Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M18.3748 6.61751L18.3758 17.3815C18.3758 19.38 16.7558 21 14.7573 21H9.24251C7.245 21 5.625 19.38 5.625 17.3825L5.62402 6.61849C5.62402 4.62 7.24402 3 9.24154 3H14.7573C16.7548 3 18.3748 4.62 18.3748 6.61751Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M10.6094 6.68848H13.3931"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12.0002 17.3306V17.2824M12.0002 17.0293C11.862 17.0293 11.75 17.1413 11.75 17.2791C11.75 17.4173 11.862 17.5293 12.0002 17.5293C12.1385 17.5293 12.2505 17.4173 12.2505 17.2791C12.2505 17.1413 12.1385 17.0293 12.0002 17.0293Z"
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
