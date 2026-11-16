import type { IconProps } from './types.ts';

export function DeliveryBox4Icon({
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
      <path d="M12.2917 19.6634C12.2703 18.9473 11.67 18.383 10.949 18.4044C10.229 18.4258 9.66278 19.0232 9.68418 19.7393C9.70461 20.4564 10.3059 21.0197 11.0259 20.9993C11.7459 20.9779 12.3131 20.3795 12.2917 19.6634Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M3.8125 6.73975L5.89367 7.35077L10.4248 18.5379" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.2012 19.2162L20.1892 16.0142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M16.9338 14.8994L14.2455 15.9366C13.3095 16.2985 12.464 15.8656 12.1001 14.9315L9.16126 7.73983C8.7964 6.80578 9.12429 5.92136 10.0642 5.55844L12.7515 4.52127C13.6914 4.15835 14.533 4.59229 14.8969 5.52634L17.8367 12.718C18.2006 13.6521 17.8736 14.5365 16.9338 14.8994Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.7891 7.67282L12.9644 7.21924" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
