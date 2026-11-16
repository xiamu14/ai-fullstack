import type { IconProps } from './types.ts';

export function AiChip2Icon({
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
      <path d="M5.02148 15.0835C5.02148 17.3614 6.44696 18.9746 8.73162 18.9746H15.2694C17.555 18.9746 18.9727 17.3614 18.9727 15.0835V8.92234C18.9727 6.63768 17.555 5.02344 15.2694 5.02344H8.73162C6.45377 5.02344 5.02148 6.63768 5.02148 8.92234V15.0835Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.61328 20.9975V18.9766M14.3872 20.9975V18.9766" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M5.02097 9.61719H3M5.02097 14.3835H3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.61328 5.02487V3.00391M14.3872 5.02487V3.00391" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M20.9995 9.61719H18.9707M20.9995 14.3835H18.9707" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M7.94189 14.7412L10.3409 9.25781L12.8088 14.7412" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.58447 13.3301H12.1658" strokeWidth="1.5" stroke="currentColor"/>
      <path d="M15.4546 14.7406V9.45898" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
