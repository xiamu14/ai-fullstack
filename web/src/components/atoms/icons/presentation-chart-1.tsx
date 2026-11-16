import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PresentationChart1Icon({
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
        d="M12.0001 11.957V6.85876M15.9784 11.9569V9.31747M8.02173 11.9572V8.55765"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.08819 2.99457H16.9118C18.9673 2.99457 20.6329 4.66017 20.6329 6.71569V12.1006C20.6329 14.1552 18.9673 15.8218 16.9118 15.8218H7.08819C5.03267 15.8218 3.36707 14.1552 3.36707 12.1006V6.71569C3.36707 4.66017 5.03267 2.99457 7.08819 2.99457Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M11.9997 15.8218V20.2746M6.65625 20.2746L11.9997 15.8218L17.3432 20.2746"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
