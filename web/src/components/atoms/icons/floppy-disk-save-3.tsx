import type { IconProps } from './types.ts';

export function FloppyDiskSave3Icon({
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
      <path d="M15.851 3.74335C15.3947 3.26854 14.7642 3 14.1055 3H7.78216C4.84281 3 3 5.08022 3 8.02638V15.9736C3 18.9188 4.83405 21 7.78216 21H16.2169C19.1659 21 21 18.9188 21 15.9736V10.0803C21 9.45568 20.7587 8.85535 20.3257 8.40486L15.851 3.74335Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.417 15.0864C10.417 14.1358 9.64639 13.3652 8.6958 13.3652C7.7452 13.3652 6.97461 14.1358 6.97461 15.0864C6.97461 16.037 7.7452 16.8076 8.6958 16.8076C9.64639 16.8076 10.417 16.037 10.417 15.0864Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.97461 7.47852H13.8603" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
