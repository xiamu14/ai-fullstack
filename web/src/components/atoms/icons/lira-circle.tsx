import type { IconProps } from './types.ts';

export function LiraCircleIcon({
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
      <path d="M20.64 11.58C20.64 6.80792 16.7721 2.94 12 2.94C7.22792 2.94 3.36 6.80792 3.36 11.58C3.36 16.3521 7.22792 20.22 12 20.22C16.7721 20.22 20.64 16.3521 20.64 11.58Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.8094 7.82251V12.164C10.8094 13.7379 12.0852 15.0138 13.6601 15.0138H15.007" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.89688 9.35625H13.357" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.89688 11.6457H13.357" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
