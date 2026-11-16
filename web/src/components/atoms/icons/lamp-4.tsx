import type { IconProps } from './types.ts';

export function Lamp4Icon({
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
      <path d="M5.46002 9.54616C5.46002 12.2464 7.09737 14.5591 9.43244 15.5435V17.718C9.43244 19.1331 10.5906 20.2912 12.0047 20.2912C13.4198 20.2912 14.578 19.1331 14.578 17.718V15.5548C17.2998 14.404 19.0707 11.4049 18.3954 8.15167C17.8751 5.66154 15.8613 3.65899 13.3722 3.14994C9.16718 2.29811 5.46002 5.48501 5.46002 9.54616Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.43311 15.5587H14.5843" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.0288 15.418L14.1281 8.56128H9.8269L10.9263 15.418" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
