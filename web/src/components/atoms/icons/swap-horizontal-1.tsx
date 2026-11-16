import type { IconProps } from './types.ts';

export function SwapHorizontal1Icon({
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
      <path d="M8.78405 19.3794L5.35875 14.6475H18.6421" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="black"/>
      <path d="M15.2169 4.02002L18.6421 8.75196H5.35875" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="black"/>
    </svg>
  );
}
