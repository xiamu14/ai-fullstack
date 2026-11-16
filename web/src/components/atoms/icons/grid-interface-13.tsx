import type { IconProps } from './types.ts';

export function GridInterface13Icon({
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
      <path d="M7.78909 3H16.2103C19.1536 3 20.9857 5.07733 20.9857 8.01866V15.9534C20.9857 18.8937 19.1536 20.972 16.2093 20.972H7.78909C4.84483 20.972 3.01367 18.8937 3.01367 15.9534V8.01866C3.01367 5.07733 4.85359 3 7.78909 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.0273 3.00977V20.9993M8.99414 3.00977V20.9993" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
