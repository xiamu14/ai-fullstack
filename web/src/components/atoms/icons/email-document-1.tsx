import type { IconProps } from './types.ts';

export function EmailDocument1Icon({
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
      <path d="M6.45605 13.2597V5.42584C6.45605 4.11816 7.51562 3.05859 8.8233 3.05859H15.1603C16.4679 3.05859 17.5188 4.11816 17.5275 5.41708L17.5363 13.2597" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.78125 6.22754H14.4097M9.78125 9.3745H12.0142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M17.5177 5.21289C19.6378 5.68576 21 7.65408 21 10.0009V16.0489C21 18.7547 19.1932 20.9507 16.5146 20.942H7.47665C4.79805 20.9507 3 18.7547 3 16.0489V10.0009C3 7.65408 4.35341 5.68576 6.46378 5.21289" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.4698 13.2598C14.1007 13.2598 9.90659 13.2598 5.52344 13.2598" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
