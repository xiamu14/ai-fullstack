import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function DollarBadge3Icon({
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
        d="M8.36921 5.12513V9.26019V17.167C8.36921 18.5484 7.25021 19.6674 5.86874 19.6674H17.5211C19.5218 19.6674 20.6315 18.3196 20.6315 16.1423L20.6399 5.12513C20.6399 4.32839 19.8777 3.81092 19.2164 4.14999L18.5896 4.48064C18.216 4.67585 17.7845 4.68426 17.394 4.51427L15.623 3.72593C14.9029 3.41301 14.1061 3.41301 13.386 3.72593L11.615 4.51427C11.2246 4.68426 10.7921 4.67585 10.4195 4.48064L9.79271 4.14999C9.1314 3.81092 8.36921 4.33679 8.36921 5.12513Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M15.8046 9.30188H13.6861C13.0566 9.30188 12.5457 9.81284 12.5457 10.4424C12.5457 11.0728 13.0566 11.5829 13.6861 11.5829H14.99C15.6196 11.5829 16.1305 12.0938 16.1305 12.7242C16.1305 13.3538 15.6196 13.8647 14.99 13.8647H12.8716"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M14.3381 13.864V14.8214M14.3381 8.33813V9.30394"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M5.86887 19.6672C5.17393 19.6672 4.54718 19.388 4.0979 18.9387C3.64022 18.481 3.36 17.8533 3.36 17.1667V10.209C3.36 9.41224 4.12312 8.8957 4.78443 9.23476L5.41118 9.56541C5.78388 9.7606 6.21634 9.76905 6.60584 9.59904L7.80143 9.0657C7.8939 9.02274 8.13208 9.13295 8.36933 9.25998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
