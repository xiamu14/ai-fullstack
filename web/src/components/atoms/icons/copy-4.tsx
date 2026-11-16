import type { IconProps } from './types.ts';

export function Copy4Icon({
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
      <path d="M14.9572 5.47322C14.7283 3.9968 13.6651 3 12.0629 3H6.86577C5.0565 3 3.91992 4.28509 3.91992 6.10048V12.7954C3.91992 14.4491 4.86518 15.6678 6.41498 15.86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M17.1354 8.11328H11.94C10.1298 8.11328 8.99414 9.39488 8.99414 11.2094V17.9043C8.99414 19.7188 10.1237 21.0004 11.94 21.0004H17.1345C18.9517 21.0004 20.0812 19.7188 20.0812 17.9043V11.2094C20.0812 9.39488 18.9517 8.11328 17.1354 8.11328Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
