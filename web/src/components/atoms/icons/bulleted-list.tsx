import type { IconProps } from './types.ts';

export function BulletedListIcon({
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
      <path d="M8 17.9961H20.0006" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8 11.9961H20.0006" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8 5.99609H20.0006" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.01132 5.98139V6.04537M4.27058 5.99514C4.27058 6.13916 4.15374 6.2559 4.00972 6.2559C3.86571 6.2559 3.74902 6.13916 3.74902 5.99514C3.74902 5.85112 3.86571 5.73438 4.00972 5.73438C4.15374 5.73438 4.27058 5.85112 4.27058 5.99514Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.01132 12.1103V12.1743M4.27058 12.124C4.27058 12.2681 4.15374 12.3848 4.00972 12.3848C3.86571 12.3848 3.74902 12.2681 3.74902 12.124C3.74902 11.98 3.86571 11.8633 4.00972 11.8633C4.15374 11.8633 4.27058 11.98 4.27058 12.124Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.01132 17.9814V18.0454M4.27058 17.9951C4.27058 18.1392 4.15374 18.2559 4.00972 18.2559C3.86571 18.2559 3.74902 18.1392 3.74902 17.9951C3.74902 17.8511 3.86571 17.7344 4.00972 17.7344C4.15374 17.7344 4.27058 17.8511 4.27058 17.9951Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
