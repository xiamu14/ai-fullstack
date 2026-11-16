import type { IconProps } from './types.ts';

export function Filter2Alt2Icon({
  size = 24,
  variant: _variant = 'line',
  ...props
}: IconProps) {
  return (
    <svg
      aria-hidden={props['aria-label'] ? undefined : true}
      fill="none"
      height={size}
      viewBox={'0 0 24 24'}
      width={size}
      {...props}
    >
      <path d="M3.82125 6.20776C3.82125 4.74877 5.00376 3.56625 6.46276 3.56625H18.4597C19.9188 3.56625 21.1013 4.74877 21.1013 6.20776V7.54999C21.1013 8.60081 20.6557 9.60212 19.8749 10.3064L15.029 15.0981C14.7105 15.3857 14.5284 15.7949 14.5284 16.2236V18.1805C14.5284 18.8006 14.151 19.3583 13.5747 19.5872L11.7224 20.325C10.7286 20.7211 9.6479 19.9888 9.6479 18.9183V15.7453C9.6479 15.3438 9.48816 14.958 9.2042 14.674L4.90756 10.8491C4.21261 10.1532 3.82125 9.20982 3.82125 8.22532V6.20776Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
