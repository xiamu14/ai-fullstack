import type { IconProps } from './types.ts';

export function Delete8Icon({
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
      <path d="M14.6039 4.20381L15.3894 5.9172H17.9232C18.7022 5.9172 19.3338 6.54878 19.3338 7.32786V8.37253C19.3338 8.90519 18.902 9.33699 18.3694 9.33699H5.15041C4.61774 9.33699 4.18594 8.90519 4.18594 8.37253V7.32786C4.18594 6.54878 4.8175 5.9172 5.59659 5.9172H8.13043L8.9159 4.20381C9.15162 3.68963 9.66538 3.35999 10.231 3.35999H13.2888C13.8544 3.35999 14.3681 3.68963 14.6039 4.20381Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M17.8564 9.40875V17.747C17.8564 19.3451 16.577 20.6405 14.9988 20.6405H8.52188C6.94373 20.6405 5.66438 19.3451 5.66438 17.747V9.40875" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
