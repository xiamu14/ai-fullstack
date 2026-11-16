import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Mouse3Icon({
  size = 24,
  variant: _variant = "fill",
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
        clipRule="evenodd"
        d="M12.7497 9.695C12.7497 10.109 12.4137 10.445 11.9997 10.445C11.5857 10.445 11.2497 10.109 11.2497 9.695V7.672C11.2497 7.258 11.5857 6.922 11.9997 6.922C12.4137 6.922 12.7497 7.258 12.7497 7.672V9.695ZM19.1957 7.866C19.1957 4.907 16.7887 2.5 13.8297 2.5H10.1717C7.21169 2.5 4.80469 4.908 4.80469 7.867L4.80569 16.134C4.80569 19.093 7.21269 21.5 10.1717 21.5H13.8307C16.7897 21.5 19.1967 19.092 19.1967 16.133L19.1957 7.866Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
