import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function FolderFileSearch1Icon({
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
        d="M15.2309 20.6279C18.4524 20.6279 20.3505 18.729 20.3505 15.5084L20.3756 11.039C20.3756 7.75306 19.1837 6.10966 15.9546 6.10966H13.4075C12.7611 6.10779 12.153 5.80373 11.764 5.28795L10.9424 4.19484C10.5543 3.67813 9.94627 3.37314 9.2999 3.37314H7.4998C4.27828 3.37314 3.09563 5.27117 3.09563 8.48803V15.5084C3.09563 18.729 4.99739 20.6279 8.22637 20.6279H15.2309Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M12.8388 14.5731C11.8995 15.5123 10.3755 15.5123 9.43629 14.5731C8.49707 13.6339 8.49707 12.1099 9.43629 11.1707C10.3755 10.2315 11.8995 10.2315 12.8388 11.1707C13.778 12.1099 13.778 13.6339 12.8388 14.5731ZM12.8388 14.5731L14.1427 15.8762"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
