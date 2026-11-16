import type { IconProps } from './types.ts';

export function World5Icon({
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
      <path d="M12 3C16.9709 3 21 7.02908 21 12C21 16.9709 16.9709 21 12 21C7.02908 21 3 16.9709 3 12C3 7.02908 7.02908 3 12 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.9994 3C13.85 3 15.3493 7.02908 15.3493 12C15.3493 16.9709 13.85 21 11.9994 21C10.1488 21 8.64941 16.9709 8.64941 12C8.64941 7.02908 10.1488 3 11.9994 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M3 11.9982H21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
