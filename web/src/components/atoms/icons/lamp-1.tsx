import type { IconProps } from './types.ts';

export function Lamp1Icon({
  size = 24,
  variant: _variant = 'fill',
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
      <path d="M13.4678 3.02852C8.9613 2.11562 4.98035 5.5349 4.98035 9.89521C4.98035 12.4423 6.33758 14.6682 8.36734 15.8882H11.2804V10.3453C11.2804 9.94772 11.6027 9.62535 12.0004 9.62535C12.398 9.62535 12.7204 9.94772 12.7204 10.3453V15.8882H15.6583C18.0633 14.4239 19.5125 11.5189 18.8655 8.40252C18.3061 5.72476 16.1445 3.57591 13.4678 3.02852Z" fill="currentColor"/>
      <path d="M15.0583 17.3282H8.95276V18.0671C8.95276 19.7472 10.3258 21.1203 12.006 21.1203C13.6854 21.1203 15.0583 19.7471 15.0583 18.0671V17.3282Z" fill="currentColor"/>
    </svg>
  );
}
