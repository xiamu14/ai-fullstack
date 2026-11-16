import type { IconProps } from './types.ts';

export function VerticalBarChart2Icon({
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
      <path d="M20.6394 19.3143H3.35938" strokeWidth="1.44" strokeLinecap="round" stroke="currentColor"/>
      <path d="M9.69644 19.3127V13.5516H6.00965C5.50028 13.5516 5.08777 13.9813 5.08777 14.5119V19.3127" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.304 19.3128V8.7525H10.6172C10.1078 8.7525 9.69531 9.18219 9.69531 9.7128V19.3128" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.9117 19.3139V4.91277C18.9117 4.3822 18.4992 3.95251 17.9899 3.95251H15.2249C14.7155 3.95251 14.303 4.3822 14.303 4.91277V19.3139" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
