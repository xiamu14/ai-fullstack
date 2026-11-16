import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function ChartThreeLine5Icon({
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
        d="M19.9271 11.9908H17.2353C16.5767 11.9908 16.043 12.5246 16.043 13.1832V18.9057C16.043 19.5633 16.5767 20.098 17.2353 20.098H19.9271C20.5857 20.098 21.1194 19.5633 21.1194 18.9057V13.1832C21.1194 12.5246 20.5857 11.9908 19.9271 11.9908Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M13.5846 7.93762H10.9129C10.2543 7.93762 9.72058 8.47138 9.72058 9.12994V18.9056C9.72058 19.5642 10.2543 20.0979 10.9129 20.0979H13.5846C14.2431 20.0979 14.7769 19.5642 14.7769 18.9056V9.12994C14.7769 8.47138 14.2431 7.93762 13.5846 7.93762Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M7.2623 3.84375H4.07318C3.41462 3.84375 2.88086 4.37751 2.88086 5.03607V18.9657C2.88086 19.6242 3.41462 20.158 4.07318 20.158H7.2623C7.92086 20.158 8.45462 19.6242 8.45462 18.9657V5.03607C8.45462 4.37751 7.92086 3.84375 7.2623 3.84375Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
