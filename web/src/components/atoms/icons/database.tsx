import type { IconProps } from './types.ts';

export function DatabaseIcon({
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
      <path d="M4.42188 6V11.9997C4.42188 11.9997 4.42188 14.9994 12.0005 14.9994C19.5792 14.9994 19.5792 11.9997 19.5792 11.9997V6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.42188 12V17.9996C4.42188 17.9996 4.42188 21.0004 12.0005 21.0004C19.5792 21.0004 19.5792 17.9996 19.5792 17.9996V12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M19.5792 6.01883C19.5792 7.68608 16.1861 9.03766 12.0005 9.03766C7.81493 9.03766 4.42184 7.68608 4.42184 6.01883C4.42184 4.35158 7.81493 3 12.0005 3C16.1861 3 19.5792 4.35158 19.5792 6.01883Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
