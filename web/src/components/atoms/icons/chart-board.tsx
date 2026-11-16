import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ChartBoardIcon({
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
        d="M3.35938 15.8742V16.3608C3.35938 17.6479 4.40364 18.6922 5.69077 18.6922H18.308C19.5951 18.6922 20.6394 17.6479 20.6394 16.3608V15.8742C20.6394 15.5827 20.403 15.3464 20.1107 15.3464H3.88712C3.59569 15.3464 3.35938 15.5827 3.35938 15.8742Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M19.363 15.3466V7.46873C19.363 5.8715 18.0685 4.5769 16.4721 4.5769H7.52856C5.93132 4.5769 4.63672 5.8715 4.63672 7.46873V15.3466"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M8.51562 7.99689V12.0105M15.4855 8.82148V12.0112M12.188 10.1259V12.0117"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
