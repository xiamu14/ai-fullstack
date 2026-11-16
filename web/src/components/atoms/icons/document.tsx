import type { IconProps } from './types.ts';

export function DocumentIcon({
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
          <path d="M16.191 2C19.28 2 21 3.78 21 6.83V17.16C21 20.26 19.28 22 16.191 22H7.81C4.77 22 3 20.26 3 17.16V6.83C3 3.78 4.77 2 7.81 2H16.191ZM8.08 15.74C7.78 15.71 7.49 15.85 7.33 16.11C7.17 16.36 7.17 16.69 7.33 16.95C7.49 17.2 7.78 17.35 8.08 17.31H15.92C16.319 17.27 16.62 16.929 16.62 16.53C16.62 16.12 16.319 15.78 15.92 15.74H8.08ZM15.92 11.179H8.08C7.649 11.179 7.3 11.53 7.3 11.96C7.3 12.39 7.649 12.74 8.08 12.74H15.92C16.35 12.74 16.7 12.39 16.7 11.96C16.7 11.53 16.35 11.179 15.92 11.179ZM11.069 6.65H8.08V6.66C7.649 6.66 7.3 7.01 7.3 7.44C7.3 7.87 7.649 8.22 8.08 8.22H11.069C11.5 8.22 11.85 7.87 11.85 7.429C11.85 7 11.5 6.65 11.069 6.65Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M15.7161 16.2234H8.49609" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M15.7161 12.0369H8.49609" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.2511 7.86008H8.49609" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M15.908 2.74979C15.908 2.74979 8.231 2.75379 8.219 2.75379C5.459 2.77079 3.75 4.58679 3.75 7.35679V16.5528C3.75 19.3368 5.472 21.1598 8.256 21.1598C8.256 21.1598 15.932 21.1568 15.945 21.1568C18.705 21.1398 20.415 19.3228 20.415 16.5528V7.35679C20.415 4.57279 18.692 2.74979 15.908 2.74979Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
