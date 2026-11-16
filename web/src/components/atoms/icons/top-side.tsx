import type { IconProps } from './types.ts';

export function TopSideIcon({
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
      <path d="M21 7.78216V16.2169C21 19.165 18.9188 21 15.9736 21H8.02638C5.08119 21 3 19.165 3 16.2159V7.78216C3 4.83405 5.08119 3 8.02638 3H15.9736C18.9188 3 21 4.84281 21 7.78216Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.6038 15.6479L12.0002 12.8438L9.39648 15.6479" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M21 8.54297H3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
