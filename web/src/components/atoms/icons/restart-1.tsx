import type { IconProps } from './types.ts';

export function Restart1Icon({
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
      <path d="M18.3646 5.63672L16.6434 7.3579M5.63672 18.3647L7.3579 16.6425M18.3646 18.3647L16.6434 16.6425M5.63672 5.63672L7.3579 7.3579" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 3V5.43437M12 21V18.5656M21 12H18.5656M3 12H5.43437" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
