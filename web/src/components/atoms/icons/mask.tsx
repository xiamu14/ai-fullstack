import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function MaskIcon({ size = 24, variant = "line", ...props }: IconProps) {
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
            d="M2.15906 11.9556C2.15906 16.9211 6.2133 21.0996 11.1348 21.3075C11.3467 21.3165 11.519 21.1437 11.519 20.9316V2.97963C11.519 2.76756 11.3467 2.59479 11.1348 2.60373C6.21009 2.81134 2.15906 6.98678 2.15906 11.9556Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M20.5764 8.23712C20.5231 8.11627 20.3656 8.08889 20.2718 8.18188L12.9056 15.4829C12.8147 15.5731 12.7635 15.6958 12.7635 15.8239V18.4805C12.7635 18.6511 12.9693 18.737 13.0906 18.617L21.0645 10.7279C21.1721 10.6215 21.2241 10.4704 21.1991 10.3211C21.0784 9.59853 20.8689 8.89994 20.5764 8.23712Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M18.1635 4.9243C18.0522 4.82662 17.8848 4.8343 17.7795 4.93843L12.9053 9.75867C12.8141 9.84882 12.7628 9.97179 12.7628 10.1V12.7677C12.7628 12.9383 12.9686 13.0241 13.0899 12.9041L19.4029 6.65418C19.5036 6.55447 19.5173 6.396 19.4315 6.28323C19.0528 5.78572 18.6264 5.33057 18.1635 4.9243Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M13.1782 2.66345C12.9554 2.63477 12.7632 2.81215 12.7632 3.03677V7.04353C12.7632 7.21402 12.9688 7.29993 13.0902 7.18012L16.2618 4.04725C16.3982 3.91258 16.3673 3.68476 16.1966 3.59786C15.2671 3.12492 14.2533 2.80181 13.1782 2.66345Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M13.1769 20.9174C13.0487 21.0436 13.1488 21.256 13.3269 21.2303C17.3671 20.6468 20.5897 17.4656 21.2346 13.4386C21.2631 13.261 21.0522 13.1576 20.9241 13.2839L13.1769 20.9174Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M20.3367 12.4275C20.3367 7.65543 16.4688 3.7875 11.6977 3.7875C6.92651 3.7875 3.05859 7.65543 3.05859 12.4275C3.05859 17.1987 6.92651 21.0666 11.6977 21.0666C16.4688 21.0666 20.3367 17.1987 20.3367 12.4275Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.44"
          />
          <path
            d="M11.6465 20.0399L20.2857 11.5125"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.44"
          />
          <path
            d="M16.6991 5.385L11.7206 10.3074"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.44"
          />
          <path
            d="M11.6738 15.1928L19.0524 7.88813"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.44"
          />
          <path
            d="M11.6367 3.7875V21.0666"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.44"
          />
        </>
      )}
    </svg>
  );
}
