import type { IconProps } from './types.ts';

export function HestagIcon({
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
      <path d="M12.2333 16.1024L13.6221 6.7328H14.7613L13.3725 16.1024H12.2333ZM9.23165 16.1024L10.6269 6.7328H11.7661L10.3773 16.1024H9.23165ZM8.00285 13.6448L8.18845 12.512H15.5229L15.3565 13.6448H8.00285ZM8.48285 10.432L8.64925 9.2992H15.9965L15.8237 10.432H8.48285Z" fill="currentColor"/>
    </svg>
  );
}
