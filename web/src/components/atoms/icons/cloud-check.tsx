import type { IconProps } from './types.ts';

export function CloudCheckIcon({
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
      <path d="M18.5637 17.2691C19.9998 16.6202 21 15.1743 21 13.495C21 10.8991 19.1698 9.35595 16.897 9.35498C16.897 7.72233 15.6165 4.45703 12 4.45703C8.38346 4.45703 7.10303 7.72233 7.10303 9.35498C4.83308 9.37444 3 10.8991 3 13.495C3 15.1743 3.99924 16.6202 5.43632 17.2691" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.1582 17.2537L11.4466 19.5461L16.1617 14.8281" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
