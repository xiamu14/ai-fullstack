import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function World3Icon({
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
        d="M11.9999 3.74939C10.9939 3.74939 9.55794 6.64839 9.41394 11.2494H14.5859C14.4419 6.64839 13.0059 3.74939 11.9999 3.74939Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M9.41412 12.7493C9.55812 17.3503 10.9941 20.2493 12.0001 20.2493C13.0061 20.2493 14.4421 17.3503 14.5861 12.7493H9.41412Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M16.0865 11.2493H21.4625C21.1065 6.73131 17.5825 3.09531 13.1125 2.57031C14.9575 3.64931 15.9705 7.38131 16.0865 11.2493Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M7.91348 11.2493C8.02948 7.38131 9.04248 3.64931 10.8875 2.57031C6.41748 3.09531 2.89348 6.73131 2.53748 11.2493H7.91348Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M16.0865 12.7493C15.9705 16.6173 14.9575 20.3493 13.1125 21.4283C17.5825 20.9033 21.1065 17.2673 21.4625 12.7493H16.0865Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M7.91348 12.7493H2.53748C2.89348 17.2673 6.41748 20.9033 10.8875 21.4283C9.04248 20.3493 8.02948 16.6173 7.91348 12.7493Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
