import type { IconProps } from './types.ts';

export function Copy2Icon({
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
      <path d="M15.5654 6.68609C15.709 6.68609 15.8254 6.56969 15.8254 6.42609C15.8254 4.07609 14.3154 2.49609 12.0554 2.49609H6.28537C4.02537 2.49609 2.50537 4.07609 2.50537 6.42609V11.8661C2.50537 14.2261 4.02537 15.8061 6.28537 15.8061H6.37537C6.54106 15.8061 6.67537 15.6718 6.67537 15.5061V12.1261C6.67537 8.97609 8.89537 6.68609 11.9454 6.68609H15.5654Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M17.7215 8.18579H11.9485C9.69148 8.18579 8.17548 9.76979 8.17548 12.1258V17.5648C8.17548 19.9208 9.69148 21.5048 11.9485 21.5048H17.7205C19.9775 21.5048 21.4945 19.9208 21.4945 17.5648V12.1258C21.4945 9.76979 19.9785 8.18579 17.7215 8.18579Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
