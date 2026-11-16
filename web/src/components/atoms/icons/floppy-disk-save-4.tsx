import type { IconProps } from './types.ts';

export function FloppyDiskSave4Icon({
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
      <path d="M15.8509 3.74334C15.3945 3.26854 14.7641 3 14.1054 3H7.7821C4.84279 3 3 5.08019 3 8.02631V15.9735C3 18.9186 4.83403 20.9998 7.7821 20.9998H16.2167C19.1657 20.9998 20.9998 18.9186 20.9998 15.9735V10.0802C20.9998 9.45559 20.7585 8.85527 20.3255 8.40479L15.8509 3.74334Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.05664 21.0004V17.6758C8.05664 16.663 8.87685 15.8418 9.8897 15.8418H14.1123C15.1242 15.8418 15.9454 16.663 15.9454 17.6758V21.0004" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.05664 3V7.64978" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
