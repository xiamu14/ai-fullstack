import type { IconProps } from './types.ts';

export function InfoMenu2Icon({
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
      <path d="M12 17C10.897 17 10 17.897 10 19C10 20.103 10.897 21 12 21C13.103 21 14 20.103 14 19C14 17.897 13.103 17 12 17Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M12 7C13.103 7 14 6.103 14 5C14 3.897 13.103 3 12 3C10.897 3 10 3.897 10 5C10 6.103 10.897 7 12 7Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M12 10C10.897 10 10 10.897 10 12C10 13.103 10.897 14 12 14C13.103 14 14 13.103 14 12C14 10.897 13.103 10 12 10Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
