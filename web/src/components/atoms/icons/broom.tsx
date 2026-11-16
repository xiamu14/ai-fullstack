import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function BroomIcon({
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
        d="M9.25174 5.48087C9.25174 4.13404 10.3436 3.04125 11.6914 3.04125C13.0382 3.04125 14.131 4.13404 14.131 5.48087L13.6284 9.7128L17.5643 9.70627C18.5068 9.70445 19.2717 10.4684 19.2717 11.4118C19.2717 12.3533 18.5087 13.1164 17.5663 13.1164H5.82675C4.8834 13.1164 4.11939 12.3505 4.12125 11.4071V11.4043C4.12405 10.4638 4.88714 9.70349 5.82675 9.70349H9.75984C9.67862 8.99366 9.25174 5.48087 9.25174 5.48087Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M18.1574 13.2712V15.5789C18.0715 17.715 19.0624 19.1057 19.1307 19.2178C19.4062 19.6689 19.1866 20.1975 18.6729 20.3199C18.6627 20.3218 4.72079 20.3208 4.71519 20.3199C4.20242 20.1975 3.98293 19.6689 4.25846 19.2178C4.32664 19.1057 5.31762 17.715 5.23169 15.5789V13.2712"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M8.95836 17.6475C8.95836 17.6475 8.86309 18.985 7.9375 20.3225"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M13.7338 18.6881C13.6825 19.2028 13.7104 19.7408 13.8916 20.3226"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
