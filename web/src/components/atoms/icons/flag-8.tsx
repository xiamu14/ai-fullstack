import type { IconProps } from './types.ts';

export function Flag8Icon({
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
      <path d="M4.8877 13.6882C4.8877 13.6882 7.15371 11.4222 11.8482 13.4314C16.5437 15.4405 19.1133 13.7116 19.1133 13.7116V4.11047C19.1133 4.11047 16.5437 5.83941 11.8482 3.83026C7.15371 1.82208 4.8877 4.08809 4.8877 4.08809V21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
