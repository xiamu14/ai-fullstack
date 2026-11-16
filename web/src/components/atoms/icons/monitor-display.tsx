import type { IconProps } from './types.ts';

export function MonitorDisplayIcon({
  size = 24,
  variant: _variant = 'fill',
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
      <path d="M16.971 2.51758H7.028C4.531 2.51758 2.5 4.54958 2.5 7.04658V12.5026C2.5 15.0006 4.531 17.0326 7.028 17.0326H16.971C19.468 17.0326 21.5 15.0006 21.5 12.5026V7.04658C21.5 4.54958 19.468 2.51758 16.971 2.51758Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M16.4383 19.7324H7.44727C6.96427 19.7324 6.57227 20.1254 6.57227 20.6074C6.57227 21.0894 6.96427 21.4824 7.44727 21.4824H16.4383C16.9203 21.4824 17.3133 21.0894 17.3133 20.6074C17.3133 20.1254 16.9203 19.7324 16.4383 19.7324Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
