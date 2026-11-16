import type { IconProps } from './types.ts';

export function Minus5Icon({
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
      <path d="M16.2178 3H7.78313C4.84378 3 3 5.08119 3 8.02638V15.9736C3 18.9188 4.83503 21 7.78313 21H16.2169C19.1659 21 21 18.9188 21 15.9736V8.02638C21 5.08119 19.1659 3 16.2178 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.3008 11.9924H8.70117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
