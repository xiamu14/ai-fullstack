import type { IconProps } from './types.ts';

export function ColorBucketIcon({
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
      <path d="M10.112 3.23828L3.53662 11.8481C2.94019 12.6343 2.83802 13.6715 3.24473 14.5666C3.63781 15.4209 4.30235 16.4513 5.23154 17.3795C6.15976 18.3087 7.18333 18.9664 8.0376 19.3585C8.93273 19.7662 9.97673 19.6708 10.7561 19.0676L19.3718 12.499" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M19.1526 20.9797C17.59 20.9797 16.8855 19.1904 17.5608 18.1016C18.1893 17.1705 19.1526 16.5273 19.1526 16.5273C19.1526 16.5273 20.1158 17.1705 20.7453 18.1016C21.4196 19.1904 20.7152 20.9797 19.1526 20.9797Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M19.3715 12.5005C18.5717 13.3003 15.8513 11.8758 13.2943 9.31886C10.7383 6.76286 9.31385 4.04145 10.1127 3.24166C10.9125 2.44285 13.6339 3.86631 16.1899 6.42329C18.7468 8.98026 20.1713 11.7007 19.3715 12.5005Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
