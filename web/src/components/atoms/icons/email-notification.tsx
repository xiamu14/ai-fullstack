import type { IconProps } from './types.ts';

export function EmailNotificationIcon({
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
      <path d="M13.0794 4.58105H7.30849C4.73488 4.58105 3 6.69638 3 9.29529V15.1081C3 17.7079 4.73488 19.8223 7.30849 19.8155H15.618C18.1926 19.8223 19.9275 17.7079 19.9275 15.1081V11.8339" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M21.0002 6.56164C21.0002 7.87423 19.9358 8.9387 18.6232 8.9387C17.3106 8.9387 16.2461 7.87423 16.2461 6.56164C16.2461 5.24807 17.3106 4.18457 18.6232 4.18457C19.9358 4.18457 21.0002 5.24807 21.0002 6.56164Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.32 11.2729L12.699 12.5904C11.9907 13.1538 10.9875 13.1538 10.2791 12.5904L6.48633 9.5332" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
