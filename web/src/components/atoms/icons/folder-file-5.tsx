import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function FolderFile5Icon({
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
        d="M16.395 5.3637H13.743C13.229 5.3617 12.738 5.1167 12.43 4.7067L11.574 3.5677C11.077 2.9077 10.288 2.5127 9.463 2.5127H7.588C4.164 2.5127 2.5 4.41969 2.5 8.34169V15.6537C2.5 19.3057 4.685 21.4867 8.345 21.4867H15.641C19.293 21.4867 21.474 19.3057 21.474 15.6567L21.5 10.9987C21.5 7.1537 19.878 5.3637 16.395 5.3637Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
