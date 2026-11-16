import type { IconProps } from './types.ts';

export function Filter6Icon({
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
      <path d="M11.2413 17.3531H4.30688" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.6819 6.63938H20.6163" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.25505 6.52555C9.25505 8.02579 8.03823 9.24298 6.53867 9.24298C5.03807 9.24298 3.82125 8.02579 3.82125 6.52555C3.82125 5.0253 5.03807 3.80813 6.53867 3.80813C8.03823 3.80813 9.25505 5.0253 9.25505 6.52555Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.6675 17.4756C15.6675 15.9753 16.8832 14.7581 18.3839 14.7581C19.8845 14.7581 21.1013 15.9753 21.1013 17.4756C21.1013 18.9758 19.8845 20.193 18.3839 20.193C16.8832 20.193 15.6675 18.9758 15.6675 17.4756Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
