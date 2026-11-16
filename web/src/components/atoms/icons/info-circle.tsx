import type { IconProps } from './types.ts';

export function InfoCircleIcon({
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
          <path d="M12.0001 1.99927C17.5301 1.99927 22.0001 6.48027 22.0001 11.9993C22.0001 17.5203 17.5301 21.9993 12.0001 21.9993C6.48012 21.9993 2.00012 17.5203 2.00012 11.9993C2.00012 6.48027 6.48012 1.99927 12.0001 1.99927ZM12.0001 14.9303C11.5201 14.9303 11.1301 15.3203 11.1301 15.8003C11.1301 16.2803 11.5201 16.6803 12.0101 16.6803C12.4901 16.6803 12.8801 16.2803 12.8801 15.8003C12.8801 15.3203 12.4901 14.9303 12.0001 14.9303ZM12.0001 7.32927C11.5201 7.32927 11.1201 7.73027 11.1201 8.20927V12.6293C11.1201 13.1103 11.5201 13.4993 12.0001 13.4993C12.4801 13.4993 12.8701 13.1103 12.8701 12.6293V8.20927C12.8701 7.73027 12.4801 7.32927 12.0001 7.32927Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M16.3341 2.75009H7.66512C4.64412 2.75009 2.75012 4.88909 2.75012 7.91609V16.0841C2.75012 19.1111 4.63512 21.2501 7.66512 21.2501H16.3331C19.3641 21.2501 21.2501 19.1111 21.2501 16.0841V7.91609C21.2501 4.88909 19.3641 2.75009 16.3341 2.75009Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9943 16.0001V12.0001" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9904 8.20428H12.0004" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
