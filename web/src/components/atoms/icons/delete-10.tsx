import type { IconProps } from './types.ts';

export function Delete10Icon({
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
      <path d="M14.608 4.13769L15.3721 5.61276H17.935C18.6879 5.61276 19.2983 6.22314 19.2983 6.97608V8.91782H4.22062V6.97608C4.22062 6.22314 4.83101 5.61276 5.58395 5.61276H8.14684L8.91089 4.13769C9.15835 3.65994 9.65145 3.36 10.1895 3.36H13.3294C13.8674 3.36 14.3606 3.65994 14.608 4.13769Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.0663 8.9175L17.5551 18.1902C17.4794 19.5642 16.3431 20.6395 14.9671 20.6395H8.55686C7.18132 20.6395 6.04533 19.565 5.96887 18.1916L5.4525 8.9175" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.0762 12.12L13.3068 14.9419" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.45058 13.4475L10.1343 16.458" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
