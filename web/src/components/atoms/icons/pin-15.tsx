import type { IconProps } from './types.ts';

export function Pin15Icon({
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
      <path d="M4.77469 10.5858C4.77469 15.7269 10.8432 20.64 11.9996 20.64C13.1559 20.64 19.2245 15.7269 19.2245 10.5858C19.2245 6.59462 15.9899 3.35999 11.9996 3.35999C8.00932 3.35999 4.77469 6.59462 4.77469 10.5858Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.4076 10.5268C14.4076 9.19667 13.3296 8.11877 11.9995 8.11877C10.6685 8.11877 9.59062 9.19667 9.59062 10.5268C9.59062 11.8569 10.6685 12.9357 11.9995 12.9357C13.3296 12.9357 14.4076 11.8569 14.4076 10.5268Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
