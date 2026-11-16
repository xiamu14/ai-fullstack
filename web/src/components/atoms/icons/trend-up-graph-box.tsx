import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function TrendUpGraphBoxIcon({
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
        d="M16.0485 2.9939H7.95119C5.1294 2.9939 3.35938 4.99184 3.35938 7.81922V15.4486C3.35938 18.276 5.121 20.2739 7.95119 20.2739H16.0476C18.8786 20.2739 20.6394 18.276 20.6394 15.4486V7.81922C20.6394 4.99184 18.8786 2.9939 16.0485 2.9939Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M8.00781 16.3183V15.3702"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M12.0002 16.3176V13.7537"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.9922 16.3172V12.1373"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.993 6.94922L15.6316 7.37048C13.6401 9.6935 10.9762 11.3412 8.00781 12.0828"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M13.8867 6.94922H15.9911V9.0527"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
