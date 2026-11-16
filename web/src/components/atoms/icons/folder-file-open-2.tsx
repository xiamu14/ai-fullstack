import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function FolderFileOpen2Icon({
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
        d="M8.06416 17.5497C7.77462 18.8107 6.31101 20.0865 4.73813 19.0479C4.73813 19.0479 5.75653 19.953 7.82506 19.953H16.8486C17.975 19.953 18.9492 19.1675 19.1883 18.0663L20.3166 12.5173C20.6519 10.779 19.5049 9.95435 17.9778 9.95435H11.6424C10.5187 9.95435 9.54551 10.7361 9.30453 11.8336L8.06416 17.5497Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.82549 19.9535C4.84878 19.9535 3.09563 18.2041 3.09563 15.2348V8.76307C3.09563 5.79756 4.18656 4.04816 7.1558 4.04816H8.81555C9.41145 4.04816 9.9719 4.32929 10.3286 4.80564L11.0862 5.81344C11.4448 6.28886 12.0061 6.56907 12.602 6.57093H14.003C16.5688 6.57093 17.7392 7.69643 18.0128 9.9474"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
