import type { IconProps } from './types.ts';

export function EmailOpen2Icon({
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
      <path d="M3 10.5244C3 9.52223 3.48941 8.58331 4.31157 8.0112L10.4715 3.71942C11.3899 3.0792 12.6101 3.0792 13.5285 3.71942L19.6884 8.0112C20.5096 8.58331 21 9.52223 21 10.5244V16.369C21 19.1342 19.1552 20.7669 16.4183 20.7601H7.58173C4.84476 20.7669 3 19.1342 3 16.369V10.5244Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M3.38477 9.04102L9.92801 14.3145C11.1608 15.2865 12.8975 15.2865 14.1215 14.3145L20.62 9.04102" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
