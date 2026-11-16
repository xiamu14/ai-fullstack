import type { IconProps } from './types.ts';

export function ChartBoard1Icon({
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
      <path d="M7.22636 3.26721H16.7714C18.9076 3.26721 20.6394 4.99895 20.6394 7.13513V12.3733C20.6394 14.5095 18.9076 16.2412 16.7714 16.2412H7.22636C5.09111 16.2412 3.35938 14.5095 3.35938 12.3733V7.13513C3.35938 4.99895 5.09111 3.26721 7.22636 3.26721Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.52344 7.75311V11.7564M15.4741 8.57497V11.7554M12.1858 9.8757V11.756" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M7.25391 20.0006H16.7467" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.96901 16.2431L9.35718 20.0036M14.0311 16.2431L14.6429 20.0036" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
