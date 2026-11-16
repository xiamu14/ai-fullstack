import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PaintingPaletteIcon({
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
        d="M12.0115 3.78565C14.4484 3.79126 16.9245 4.58426 18.5245 6.5037C20.1039 8.39793 20.9203 11.5045 19.4194 13.6696C18.4647 15.0464 16.8507 15.7292 15.2292 15.9104C13.6264 16.0907 13.0501 17.1545 13.7562 18.7321C14.2756 19.8941 13.7665 20.9327 12.3104 21.0429C7.00785 21.4436 2.49926 16.4783 3.26236 11.2056C3.91806 6.6737 7.39828 3.77445 12.0115 3.78565Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M9.01096 8.04857V8.09984M9.21873 8.05959C9.21873 8.17499 9.12509 8.26855 9.00969 8.26855C8.89429 8.26855 8.80078 8.17499 8.80078 8.05959C8.80078 7.94419 8.89429 7.85062 9.00969 7.85062C9.12509 7.85062 9.21873 7.94419 9.21873 8.05959Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M13.4445 7.00044V7.05171M13.6523 7.01146C13.6523 7.12687 13.5587 7.22042 13.4433 7.22042C13.3279 7.22042 13.2344 7.12687 13.2344 7.01146C13.2344 6.89606 13.3279 6.80251 13.4433 6.80251C13.5587 6.80251 13.6523 6.89606 13.6523 7.01146Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M16.8255 10.4823V10.5336M17.0332 10.4934C17.0332 10.6088 16.9396 10.7023 16.8242 10.7023C16.7087 10.7023 16.6152 10.6088 16.6152 10.4934C16.6152 10.3779 16.7087 10.2844 16.8242 10.2844C16.9396 10.2844 17.0332 10.3779 17.0332 10.4934Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M6.5676 11.9879V12.0392M6.77536 11.9989C6.77536 12.1143 6.68173 12.2079 6.56633 12.2079C6.45093 12.2079 6.35742 12.1143 6.35742 11.9989C6.35742 11.8836 6.45093 11.79 6.56633 11.79C6.68173 11.79 6.77536 11.8836 6.77536 11.9989Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
