import type { IconProps } from './types.ts';

export function Underline1Icon({
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
      <path d="M6 19H17.9997" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="black"/>
      <path d="M16.0001 5V10.9999C16.0001 13.2101 14.209 14.9995 12.0005 14.9995C9.79112 14.9995 8 13.2101 8 10.9999V5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="black"/>
    </svg>
  );
}
