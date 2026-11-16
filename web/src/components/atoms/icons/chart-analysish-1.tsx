import type { IconProps } from './types.ts';

export function ChartAnalysish1Icon({
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
      <path d="M7.54569 4.54877H16.4546C18.4488 4.54877 20.0647 6.16467 20.0647 8.15886V13.0486C20.0647 15.0419 18.4488 16.6587 16.4546 16.6587H7.54569C5.55151 16.6587 3.93561 15.0419 3.93561 13.0486V8.15886C3.93561 6.16467 5.55151 4.54877 7.54569 4.54877Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.0006 12.797V8.02313M15.7259 12.7969V10.3254M8.27539 12.7972V9.61393" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.5257 20.2733L12.0007 16.6857L8.47461 20.2733" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 2.99438V4.55891" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
