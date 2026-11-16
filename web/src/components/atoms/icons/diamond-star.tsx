import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function DiamondStarIcon({
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
            d="M20.8608 11.6708C16.9958 10.4209 13.9392 7.36524 12.6845 3.49356C12.5885 3.19788 12.312 2.99628 12 2.99628C11.687 2.99628 11.4106 3.19788 11.3146 3.49356C10.0598 7.36524 7.0032 10.4209 3.13824 11.6708C2.84064 11.7678 2.64 12.0443 2.64 12.3563C2.64 12.6683 2.84064 12.9448 3.13824 13.0417C7.0032 14.2907 10.0608 17.3473 11.3146 21.218C11.4106 21.5147 11.687 21.7163 12 21.7163C12.312 21.7163 12.5885 21.5147 12.6845 21.218C13.9382 17.3473 16.9958 14.2907 20.8608 13.0417C21.1584 12.9448 21.36 12.6683 21.36 12.3563C21.36 12.0443 21.1584 11.7678 20.8608 11.6708Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M21 12C16.7313 13.3842 13.3842 16.7313 12 21C10.6158 16.7313 7.2687 13.3842 3 12C7.2687 10.6158 10.6158 7.2687 12 3C13.3842 7.2687 16.7313 10.6158 21 12Z"
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
