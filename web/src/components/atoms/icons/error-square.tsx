import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ErrorSquareIcon({
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
            d="M12.756 11.999C12.756 12.413 12.42 12.749 12.006 12.749C11.592 12.749 11.256 12.413 11.256 11.999V8.107C11.256 7.693 11.592 7.357 12.006 7.357C12.42 7.357 12.756 7.693 12.756 8.107V11.999ZM12.756 15.741C12.756 16.155 12.42 16.491 12.006 16.491C11.592 16.491 11.256 16.155 11.256 15.741C11.256 15.327 11.592 14.967 12.006 14.967C12.42 14.967 12.756 15.279 12.756 15.693V15.741ZM16.218 2.5H7.784C4.624 2.5 2.5 4.721 2.5 8.026V15.975C2.5 19.279 4.623 21.5 7.783 21.5H16.218C19.377 21.5 21.5 19.279 21.5 15.975V8.026C21.5 4.721 19.377 2.5 16.218 2.5Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M16.2178 21H7.78313C4.83503 21 3 18.9188 3 15.9736V8.02638C3 5.08119 4.83503 3 7.78411 3H16.2178C19.1659 3 21 5.08119 21 8.02638V15.9736C21 18.9188 19.1572 21 16.2178 21Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12.0059 8.10742V11.9993M12.0059 15.6926V15.7407"
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
