import type { IconProps } from './types.ts';

export function GridInterface16Icon({
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
      <path d="M7.78301 3H16.2175C19.1655 3 20.9995 5.08113 20.9995 8.02625V15.9733C20.9995 18.9184 19.1655 20.9995 16.2165 20.9995H7.78301C4.83498 20.9995 3 18.9184 3 15.9733V8.02625C3 5.08113 4.84374 3 7.78301 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 3V20.9995" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M20.9995 12H3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
