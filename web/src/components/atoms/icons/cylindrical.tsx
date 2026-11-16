import type { IconProps } from './types.ts';

export function CylindricalIcon({
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
      <path d="M5.37695 6.5V17.5005" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.623 6.5V17.5005" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.6224 17.5007C18.6224 19.4336 15.6574 21.0005 11.9997 21.0005C8.34197 21.0005 5.37695 19.4336 5.37695 17.5007C5.37695 15.5679 8.34197 14.001 11.9997 14.001C15.6574 14.001 18.6224 15.5679 18.6224 17.5007Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.6224 6.49974C18.6224 8.4326 15.6574 9.99949 11.9997 9.99949C8.34197 9.99949 5.37695 8.4326 5.37695 6.49974C5.37695 4.56689 8.34197 3 11.9997 3C15.6574 3 18.6224 4.56689 18.6224 6.49974Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
