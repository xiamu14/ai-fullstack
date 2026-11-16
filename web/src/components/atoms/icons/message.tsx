import type { IconProps } from './types.ts';

export function MessageIcon({
  size = 24,
  variant = 'line',
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
      {variant === 'fill' ? (
        <>
          <path d="M16.939 3C18.28 3 19.57 3.53 20.519 4.481C21.469 5.43 22 6.71 22 8.05V15.95C22 18.74 19.73 21 16.939 21H7.06C4.269 21 2 18.74 2 15.95V8.05C2 5.26 4.259 3 7.06 3H16.939ZM18.07 8.2C17.86 8.189 17.66 8.26 17.509 8.4L13 12C12.42 12.481 11.589 12.481 11 12L6.5 8.4C6.189 8.17 5.759 8.2 5.5 8.47C5.23 8.74 5.2 9.17 5.429 9.47L5.56 9.6L10.11 13.15C10.67 13.59 11.349 13.83 12.06 13.83C12.769 13.83 13.46 13.59 14.019 13.15L18.53 9.54L18.61 9.46C18.849 9.17 18.849 8.75 18.599 8.46C18.46 8.311 18.269 8.22 18.07 8.2Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M17.9033 8.85114L13.46 12.4642C12.6205 13.1302 11.4394 13.1302 10.5999 12.4642L6.11914 8.85114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M16.9089 21C19.9502 21.0084 22 18.5095 22 15.4384V8.57001C22 5.49883 19.9502 3 16.9089 3H7.09114C4.04979 3 2 5.49883 2 8.57001V15.4384C2 18.5095 4.04979 21.0084 7.09114 21H16.9089Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
