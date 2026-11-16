import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function DocsIcon({
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
        d="M20.6888 10.9677C20.1498 10.2637 19.3318 9.85974 18.4448 9.85974H5.55478C4.66778 9.85974 3.84978 10.2637 3.31078 10.9667C2.77178 11.6717 2.59478 12.5667 2.82578 13.4217L4.47578 19.5337C4.80778 20.7657 5.92978 21.6247 7.20478 21.6247H16.7938C18.0678 21.6247 19.1898 20.7657 19.5228 19.5347L21.1738 13.4227C21.4058 12.5677 21.2278 11.6717 20.6888 10.9677Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M8.43634 3.875H15.5613C15.9753 3.875 16.3113 3.539 16.3113 3.125C16.3113 2.711 15.9753 2.375 15.5613 2.375H8.43634C8.02234 2.375 7.68634 2.711 7.68634 3.125C7.68634 3.539 8.02234 3.875 8.43634 3.875Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M5.68231 7.25293H18.3163C18.7303 7.25293 19.0663 6.91693 19.0663 6.50293C19.0663 6.08893 18.7303 5.75293 18.3163 5.75293H5.68231C5.26831 5.75293 4.93231 6.08893 4.93231 6.50293C4.93231 6.91693 5.26831 7.25293 5.68231 7.25293Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
