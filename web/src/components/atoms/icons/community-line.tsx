import type { IconProps } from './types.ts';

export function CommunityLineIcon({
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
      <path d="M7.5 16.5C9.98528 16.5 12 14.4853 12 12C12 9.51472 9.98528 7.5 7.5 7.5C5.01472 7.5 3 9.51472 3 12C3 14.4853 5.01472 16.5 7.5 16.5Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M16.5 16.5C18.9853 16.5 21 14.4853 21 12C21 9.51472 18.9853 7.5 16.5 7.5C14.0147 7.5 12 9.51472 12 12C12 14.4853 14.0147 16.5 16.5 16.5Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 21C14.4853 21 16.5 18.9853 16.5 16.5C16.5 14.0147 14.4853 12 12 12C9.51472 12 7.5 14.0147 7.5 16.5C7.5 18.9853 9.51472 21 12 21Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 12C14.4853 12 16.5 9.98528 16.5 7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5C7.5 9.98528 9.51472 12 12 12Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
