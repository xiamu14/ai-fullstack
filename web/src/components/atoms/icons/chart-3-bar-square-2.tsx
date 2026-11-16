import type { IconProps } from './types.ts';

export function Chart3BarSquare2Icon({
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
      <path d="M16.0476 2.99341H7.95025C5.12006 2.99341 3.35938 4.99135 3.35938 7.81967V15.4481C3.35938 18.2764 5.12006 20.2734 7.95119 20.2734H16.0476C18.8778 20.2734 20.6394 18.2764 20.6394 15.4481V7.81967C20.6394 4.99135 18.8693 2.99341 16.0476 2.99341Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.9998 13.3011V16.0163M11.9681 10.7096V16.0169M8.00195 7.25342V16.0167" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
