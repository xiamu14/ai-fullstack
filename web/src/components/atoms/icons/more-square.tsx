import type { IconProps } from './types.ts';

export function MoreSquareIcon({
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
          <path d="M16.3402 1.99988C19.7302 1.99988 22.0002 4.37988 22.0002 7.91988V16.0899C22.0002 19.6199 19.7302 21.9999 16.3402 21.9999H7.67024C4.28024 21.9999 2.00024 19.6199 2.00024 16.0899V7.91988C2.00024 4.37988 4.28024 1.99988 7.67024 1.99988H16.3402ZM16.4802 10.8009C15.8202 10.8009 15.2802 11.3399 15.2802 11.9999C15.2802 12.6599 15.8202 13.1999 16.4802 13.1999C17.1402 13.1999 17.6702 12.6599 17.6702 11.9999C17.6702 11.3399 17.1402 10.8009 16.4802 10.8009ZM12.0002 10.8009C11.3402 10.8009 10.8002 11.3399 10.8002 11.9999C10.8002 12.6599 11.3402 13.1999 12.0002 13.1999C12.6602 13.1999 13.2002 12.6599 13.2002 11.9999C13.2002 11.3399 12.6602 10.8009 12.0002 10.8009ZM7.52024 10.8009C6.86024 10.8009 6.32024 11.3399 6.32024 11.9999C6.32024 12.6599 6.86024 13.1999 7.52024 13.1999C8.18024 13.1999 8.72024 12.6599 8.72024 11.9999C8.72024 11.3399 8.18024 10.8009 7.52024 10.8009Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M16.3342 2.75009H7.66524C4.64424 2.75009 2.75024 4.88909 2.75024 7.91609V16.0841C2.75024 19.1111 4.63424 21.2501 7.66524 21.2501H16.3332C19.3642 21.2501 21.2502 19.1111 21.2502 16.0841V7.91609C21.2502 4.88909 19.3642 2.75009 16.3342 2.75009Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M15.9397 12.013H15.9487" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9299 12.013H11.9389" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M7.92212 12.013H7.93112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
