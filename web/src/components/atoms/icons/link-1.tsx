import type { IconProps } from './types.ts';

export function Link1Icon({
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
      <path d="M5.88475 9.70703L4.73775 10.854C2.42075 13.171 2.42075 16.948 4.73775 19.265C7.04675 21.574 10.8317 21.582 13.1487 19.265L14.2957 18.118" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.1152 14.3008L19.2623 13.1538C21.5792 10.8368 21.5792 7.05975 19.2623 4.74275C16.9533 2.43375 13.1683 2.42575 10.8513 4.74275L9.70427 5.88975" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.6367 9.45703L9.4043 14.6894" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
