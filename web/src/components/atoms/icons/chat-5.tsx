import type { IconProps } from './types.ts';

export function Chat5Icon({
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
      <path d="M9.44094 18.0967L10.8056 19.466C11.3605 20.0227 12.2581 20.0227 12.812 19.466L14.1775 18.0967C14.5661 17.7068 15.0929 17.4884 15.6422 17.4884H16.6677C18.7563 17.4884 20.4488 15.7893 20.4488 13.6936V7.03196C20.4488 4.93636 18.7563 3.23813 16.6677 3.23813H6.95075C4.8622 3.23813 3.16876 4.93636 3.16876 7.03196V13.6936C3.16876 15.7893 4.8622 17.4884 6.95075 17.4884H7.97634C8.52556 17.4884 9.05237 17.7068 9.44094 18.0967Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
