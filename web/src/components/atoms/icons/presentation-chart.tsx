import type { IconProps } from './types.ts';

export function PresentationChartIcon({
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
      <path d="M15.9785 11.9568V11.2374" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M7.08813 2.99457H16.9117C18.9673 2.99457 20.6329 4.66017 20.6329 6.71569V12.1006C20.6329 14.1552 18.9673 15.8218 16.9117 15.8218H7.08813C5.0326 15.8218 3.367 14.1552 3.367 12.1006V6.71569C3.367 4.66017 5.0326 2.99457 7.08813 2.99457Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.9997 15.8218V20.2746M6.65625 20.2746L11.9997 15.8218L17.3432 20.2746" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.02173 11.957V6.85876" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 11.957V9.51752" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
