import type { IconProps } from './types.ts';

export function PieChart4Icon({
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
      <path d="M18.6253 11.0289C18.3772 7.03312 15.058 3.86908 10.9997 3.86908C9.06176 3.86908 7.29229 4.59063 5.94535 5.77973C4.35953 7.17971 3.35938 9.22778 3.35938 11.5095C3.35938 14.0802 4.62905 16.3545 6.57554 17.7393C7.82399 18.6275 9.35087 19.1498 10.9997 19.1498C11.7605 19.1498 12.4953 19.0386 13.1888 18.8316C13.4431 18.7557 13.57 18.4779 13.4783 18.229L11.2383 12.1562C11.1226 11.8425 11.3547 11.5095 11.6891 11.5095H18.1597C18.425 11.5095 18.6417 11.2937 18.6253 11.0289Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M20.6389 14.0327C20.6586 13.768 20.4415 13.5525 20.1762 13.5525H14.9634C14.629 13.5525 14.3969 13.8855 14.5126 14.1992L16.3171 19.0915C16.409 19.3405 16.6862 19.4695 16.9276 19.3591C18.9901 18.415 20.4625 16.4043 20.6389 14.0327Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.1767 11.6824L5.94531 5.77966" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
