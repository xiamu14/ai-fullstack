import type { IconProps } from './types.ts';

export function SendMessage3Icon({
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
      <path d="M20.5753 5.6349L16.415 19.8658C16.0377 21.1553 14.3162 21.3877 13.6128 20.2434L9.98305 14.3361L4.09564 10.694C2.95515 9.98832 3.1868 8.261 4.47207 7.88237L18.6549 3.70797C19.8299 3.36213 20.92 4.45681 20.5753 5.6349Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.6506 8.61938L10.0237 14.3252" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
