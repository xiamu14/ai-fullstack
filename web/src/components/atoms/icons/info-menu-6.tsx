import type { IconProps } from './types.ts';

export function InfoMenu6Icon({
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
      <path d="M20.4 12C20.4 7.22792 16.5321 3.36 11.76 3.36C6.98792 3.36 3.12 7.22792 3.12 12C3.12 16.7721 6.98792 20.64 11.76 20.64C16.5321 20.64 20.4 16.7721 20.4 12Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.445 12.0272V12.0885M15.6938 12.0403C15.6938 12.1786 15.5817 12.2907 15.4434 12.2907C15.3052 12.2907 15.1932 12.1786 15.1932 12.0403C15.1932 11.9021 15.3052 11.79 15.4434 11.79C15.5817 11.79 15.6938 11.9021 15.6938 12.0403Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.7006 12.0272V12.0885M11.9494 12.0403C11.9494 12.1786 11.8373 12.2907 11.699 12.2907C11.5608 12.2907 11.4488 12.1786 11.4488 12.0403C11.4488 11.9021 11.5608 11.79 11.699 11.79C11.8373 11.79 11.9494 11.9021 11.9494 12.0403Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M7.95617 12.0272V12.0885M8.20507 12.0403C8.20507 12.1786 8.09291 12.2907 7.95465 12.2907C7.8164 12.2907 7.70437 12.1786 7.70437 12.0403C7.70437 11.9021 7.8164 11.79 7.95465 11.79C8.09291 11.79 8.20507 11.9021 8.20507 12.0403Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
