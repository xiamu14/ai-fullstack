import type { IconProps } from './types.ts';

export function ReplaySquare6Icon({
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
      <path d="M8.50146 20.399L5.61562 17.5133L8.50146 14.6362" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="black"/>
      <path d="M15.5081 3.12L18.3852 5.99718L15.5081 8.87426" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="black"/>
      <path d="M18.3855 11.76V13.5745C18.3855 14.6194 17.9705 15.6215 17.2316 16.3603C16.4928 17.0992 15.4907 17.5142 14.4458 17.5142H5.61562" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="black"/>
      <path d="M5.61562 11.759V9.93597C5.61562 8.8911 6.03079 7.88902 6.76966 7.15016C7.50852 6.41129 8.5106 5.99622 9.55551 5.99622H18.3855" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="black"/>
    </svg>
  );
}
