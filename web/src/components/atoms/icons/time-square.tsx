import type { IconProps } from './types.ts';

export function TimeSquareIcon({
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
          <path d="M16.3399 2.00012C19.7299 2.00012 21.9999 4.37912 21.9999 7.91912V16.0891C21.9999 19.6201 19.7299 22.0001 16.3399 22.0001H7.66988C4.27988 22.0001 1.99988 19.6201 1.99988 16.0891V7.91912C1.99988 4.37912 4.27988 2.00012 7.66988 2.00012H16.3399ZM11.6499 6.91912C11.2399 6.91912 10.8999 7.26012 10.8999 7.66912V12.7201C10.8999 12.9801 11.0399 13.2301 11.2699 13.3601L15.1899 15.7001C15.3099 15.7801 15.4499 15.8101 15.5799 15.8101C15.8299 15.8101 16.0799 15.6801 16.2199 15.4401C16.4399 15.0891 16.3199 14.6291 15.9599 14.4101L12.3999 12.2901V7.66912C12.3999 7.26012 12.0699 6.91912 11.6499 6.91912Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M16.334 2.75018H7.665C4.644 2.75018 2.75 4.88918 2.75 7.91618V16.0842C2.75 19.1112 4.634 21.2502 7.665 21.2502H16.333C19.364 21.2502 21.25 19.1112 21.25 16.0842V7.91618C21.25 4.88918 19.364 2.75018 16.334 2.75018Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M15.391 14.0177L12 11.9947V7.63367" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
