import type { IconProps } from './types.ts';

export function ArrowRight3Icon({
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
      <path d="M12.6998 11.7487H3.74976" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.699 16.7497L20.636 11.7487L12.699 6.7477V16.7497Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
