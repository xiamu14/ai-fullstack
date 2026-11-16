import type { IconProps } from './types.ts';

export function LinkHiddenIcon({
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
      <path d="M6.56838 9.95312L5.54164 10.9789C3.48917 13.0323 3.48308 16.3966 5.54164 18.4552C7.00566 19.9192 9.13625 20.3423 10.9858 19.7183" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M17.4311 14.0443L18.4578 13.0185C20.5103 10.965 20.5164 7.60073 18.4578 5.54217C16.9938 4.07815 14.8632 3.65508 13.0137 4.27904" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.981 19.371L8.78711 5.00781" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
