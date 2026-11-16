import type { IconProps } from './types.ts';

export function Voice2Icon({
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
      <path d="M12.0002 22V18.8391" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.9993 14.8481C9.75521 14.8481 7.9375 13.0218 7.9375 10.7682V6.08095C7.9375 3.82732 9.75521 2 11.9993 2C14.2424 2 16.0601 3.82732 16.0601 6.08095V10.7682C16.0601 13.0218 14.2424 14.8481 11.9993 14.8481Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M20 10.8006C20 15.2394 16.418 18.8383 12 18.8383C7.58093 18.8383 4 15.2394 4 10.8006" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.0684 6.7558H16.0579" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.0704 10.0934H16.0605" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
