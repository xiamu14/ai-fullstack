import type { IconProps } from './types.ts';

export function Multitasking6Icon({
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
      <path d="M14.5232 20.5323H9.44931C7.72136 20.5323 6.32031 19.1322 6.32031 17.4043V6.59678C6.32031 4.86882 7.72136 3.46875 9.44931 3.46875H14.5232C16.2512 3.46875 17.6513 4.86882 17.6513 6.59678V17.4043C17.6513 19.1322 16.2512 20.5323 14.5232 20.5323Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.32376 17.5428H5.00233C3.62755 17.5428 3 16.422 3 15.0472V8.95264C3 7.56814 3.62755 6.45703 5.00233 6.45703H6.32382" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M17.6485 17.5428H18.9975C20.3722 17.5428 20.9998 16.422 20.9998 15.0472V8.95264C20.9998 7.56814 20.3722 6.45703 18.9975 6.45703H17.6484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
