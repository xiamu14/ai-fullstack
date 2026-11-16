import type { IconProps } from './types.ts';

export function Chart3BarTimeIcon({
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
      <path d="M7.52148 11.5293V16.4968M11.5532 8.69342V16.4967M15.5194 13.7017V16.4964" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.7699 3.47345H7.47266C4.65089 3.47345 2.88086 5.47139 2.88086 8.29972V15.9281C2.88086 18.7564 4.64249 20.7535 7.47266 20.7535H15.5691C18.4001 20.7535 20.1609 18.7564 20.1609 15.9281V13.0997" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M21.1213 5.87531C21.1213 7.7318 19.6159 9.23718 17.7595 9.23718C15.9029 9.23718 14.3984 7.7318 14.3984 5.87531C14.3984 4.01882 15.9029 2.51343 17.7595 2.51343C19.6159 2.51343 21.1213 4.01882 21.1213 5.87531Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.8033 6.74898L17.7402 6.1136V4.7475" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
