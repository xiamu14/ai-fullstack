import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Image2Icon({
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
        d="M16.303 2.74979H7.651C4.639 2.74979 2.75 4.88379 2.75 7.90379V16.0498C2.75 19.0698 4.631 21.2038 7.651 21.2038H16.298C19.323 21.2038 21.203 19.0698 21.203 16.0498V7.90379C21.207 4.88379 19.326 2.74979 16.303 2.74979Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M10.7037 8.785C10.7037 9.805 9.87772 10.631 8.85772 10.631C7.83872 10.631 7.01172 9.805 7.01172 8.785C7.01172 7.765 7.83872 6.939 8.85772 6.939C9.87672 6.94 10.7027 7.766 10.7037 8.785Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M21.207 14.951C20.284 14.001 18.509 12.082 16.579 12.082C14.648 12.082 13.535 16.315 11.678 16.315C9.821 16.315 8.134 14.401 6.646 15.628C5.158 16.854 3.75 19.361 3.75 19.361"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
