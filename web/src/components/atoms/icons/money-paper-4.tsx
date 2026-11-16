import type { IconProps } from './types.ts';

export function MoneyPaper4Icon({
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
      <path d="M6.18843 4.94922H17.8116C19.777 4.94922 21 6.33668 21 8.30014V15.6986C21 17.6621 19.777 19.0495 17.8106 19.0495H6.18843C4.22303 19.0495 3 17.6621 3 15.6986V8.30014C3 6.33668 4.22886 4.94922 6.18843 4.94922Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.2888 12.0003C14.2888 10.7365 13.2642 9.71289 12.0013 9.71289C10.7374 9.71289 9.71289 10.7365 9.71289 12.0003C9.71289 13.2642 10.7374 14.2878 12.0013 14.2878C13.2642 14.2878 14.2888 13.2642 14.2888 12.0003Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.67969 12.0061V11.9961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M17.3223 12.0061V11.9961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
