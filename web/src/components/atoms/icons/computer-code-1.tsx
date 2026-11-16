import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ComputerCode1Icon({
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
            d="M16.67 10.4263L14.5 12.5863C14.36 12.7362 14.17 12.8062 13.97 12.8062C13.78 12.8062 13.59 12.7362 13.44 12.5863C13.15 12.2963 13.15 11.8263 13.44 11.5263L15.08 9.89625L13.44 8.25625C13.15 7.96625 13.15 7.48625 13.44 7.19625C13.74 6.90625 14.21 6.90625 14.5 7.19625L16.67 9.36625C16.96 9.65625 16.96 10.1363 16.67 10.4263ZM10.13 19.8463L10.56 17.1763H13.44L13.87 19.8463H10.13ZM9.5 12.5863L7.33 10.4263C7.04 10.1363 7.04 9.65625 7.33 9.36625L9.5 7.19625C9.79 6.90625 10.26 6.90625 10.56 7.19625C10.85 7.48625 10.85 7.96625 10.56 8.25625L8.92 9.89625L10.56 11.5263C10.85 11.8263 10.85 12.2963 10.56 12.5863C10.41 12.7362 10.22 12.8062 10.03 12.8062C9.83 12.8062 9.64 12.7362 9.5 12.5863ZM16.97 2.65625H7.03C4.53 2.65625 2.5 4.68625 2.5 7.18625V12.6462C2.5 15.1462 4.53 17.1763 7.03 17.1763H9.04L8.61 19.8463H7.06C6.64 19.8463 6.31 20.1763 6.31 20.5963C6.31 21.0063 6.64 21.3463 7.06 21.3463H16.94C17.36 21.3463 17.69 21.0063 17.69 20.5963C17.69 20.1763 17.36 19.8463 16.94 19.8463H15.39L14.96 17.1763H16.97C19.47 17.1763 21.5 15.1462 21.5 12.6462V7.18625C21.5 4.68625 19.47 2.65625 16.97 2.65625Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M7.02811 3.28516H16.9709C19.1961 3.28516 21 5.08905 21 7.31424V12.7707C21 14.9959 19.1961 16.7998 16.9709 16.7998H7.02811C4.80389 16.7998 3 14.9959 3 12.7707V7.31424C3 5.08905 4.80389 3.28516 7.02811 3.28516Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M10.0252 7.85156L7.85938 10.0184L10.0252 12.1842"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M13.9746 7.85156L16.1414 10.0184L13.9746 12.1842"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M7.05566 20.7148H16.944"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M9.88437 16.7969L9.24707 20.7141"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M14.1152 16.7969L14.7525 20.7141"
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
