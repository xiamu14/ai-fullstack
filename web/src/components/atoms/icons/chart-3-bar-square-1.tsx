import type { IconProps } from './types.ts';

export function Chart3BarSquare1Icon({
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
      <path d="M7.95118 2.99341H16.0485C18.8786 2.99341 20.6394 4.99135 20.6394 7.81967V15.4481C20.6394 18.2764 18.8786 20.2734 16.0476 20.2734H7.95118C5.121 20.2734 3.35938 18.2764 3.35938 15.4481V7.81967C3.35938 4.99135 5.1294 2.99341 7.95118 2.99341Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8 13.3011V16.0163M12.0317 10.7096V16.0169M15.9979 7.25342V16.0167" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
