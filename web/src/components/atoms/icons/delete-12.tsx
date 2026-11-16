import type { IconProps } from './types.ts';

export function Delete12Icon({
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
      <path d="M18.4009 9.64502L17.8134 17.6866C17.692 19.35 16.3069 20.6389 14.6379 20.6389H8.88457C7.21648 20.6389 5.83046 19.35 5.70903 17.6856L5.12156 9.64502" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.5949 12.1013L9.92621 15.7699M9.92621 12.1013L13.5949 15.7699" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M19.6943 6.62622H3.82594" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.3824 6.62518L14.8996 4.2482C14.7594 3.72425 14.284 3.35999 13.7423 3.35999H9.78605C9.24149 3.35812 8.76422 3.72237 8.6232 4.2482L8.145 6.62518" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
