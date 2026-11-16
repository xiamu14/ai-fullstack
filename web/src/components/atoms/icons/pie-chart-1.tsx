import type { IconProps } from './types.ts';

export function PieChart1Icon({
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
      <path d="M20.6394 11.6339C20.6394 6.86275 16.7714 2.9939 11.9994 2.9939C7.22729 2.9939 3.35938 6.86275 3.35938 11.6339C3.35938 16.406 7.22729 20.2739 11.9994 20.2739C16.7714 20.2739 20.6394 16.406 20.6394 11.6339Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.7012 2.99768V10.97C11.7012 11.5002 12.131 11.93 12.6612 11.93H20.6335" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
