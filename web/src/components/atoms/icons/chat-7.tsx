import type { IconProps } from './types.ts';

export function Chat7Icon({
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
      <path d="M10.8056 19.6742L9.44093 18.3049C9.05237 17.915 8.52556 17.6967 7.97634 17.6967H6.95075C4.8622 17.6967 3.16876 15.9975 3.16876 13.9019V7.24011C3.16876 5.1445 4.8622 3.44626 6.95075 3.44626H16.6677C18.7563 3.44626 20.4488 5.1445 20.4488 7.24011V13.9019C20.4488 15.9975 18.7563 17.6967 16.6677 17.6967H15.6422C15.0929 17.6967 14.5661 17.915 14.1775 18.3049L12.812 19.6742C12.2581 20.2309 11.3605 20.2309 10.8056 19.6742Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.745 12.1987H12.2607" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.745 8.5275H14.8724" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
