import type { IconProps } from './types.ts';

export function MousePointer3Icon({
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
      <path d="M5.07588 6.43757L9.37295 17.3368C9.72496 18.2288 10.99 18.2218 11.331 17.3258L12.817 13.4247C12.924 13.1447 13.145 12.9237 13.425 12.8177L17.3261 11.3307C18.2221 10.9896 18.2291 9.72463 17.3371 9.37362L6.43791 5.07555C5.58389 4.73955 4.73888 5.58356 5.07588 6.43757Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.1182 13.1172L19.0003 18.9993" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
