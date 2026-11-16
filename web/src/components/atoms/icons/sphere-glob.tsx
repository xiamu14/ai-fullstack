import type { IconProps } from './types.ts';

export function SphereGlobIcon({
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
      <path d="M12 21C16.9709 21 21 16.9707 21 11.9998C21 7.02889 16.9709 3 12 3C7.02908 3 3 7.02889 3 11.9998C3 16.9707 7.02908 21 12 21Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M21 11.9994C21 13.9872 16.9709 15.5994 12 15.5994C7.02908 15.5994 3 13.9872 3 11.9994C3 10.0116 7.02908 8.39941 12 8.39941C16.9709 8.39941 21 10.0116 21 11.9994Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
