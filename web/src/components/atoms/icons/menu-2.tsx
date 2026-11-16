import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Menu2Icon({
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
        d="M3.82125 7.64813V16.3535"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M21.1013 7.64813V16.3535"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.58808 19.6805H15.2905C16.9344 19.6805 18.2673 18.3476 18.2673 16.7037V7.29494C18.2673 5.65008 16.9344 4.31812 15.2905 4.31812H9.58808C7.94414 4.31812 6.61125 5.65008 6.61125 7.29494V16.7037C6.61125 18.3476 7.94414 19.6805 9.58808 19.6805Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
