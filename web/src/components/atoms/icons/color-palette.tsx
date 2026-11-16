import type { IconProps } from './types.ts';

export function ColorPaletteIcon({
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
      <path d="M3.05859 17.2802C3.05859 19.1361 4.56241 20.64 6.41838 20.64C8.27435 20.64 9.77816 19.1361 9.77816 17.2802V6.71977C9.77816 4.86382 8.27435 3.35999 6.41838 3.35999C4.56241 3.35999 3.05859 4.86382 3.05859 6.71977V17.2802Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.79297 19.6572L17.0977 11.3535C18.409 10.0412 18.409 7.9134 17.0977 6.60105C15.7853 5.28964 13.6575 5.28964 12.3452 6.60105L9.77749 9.1697" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.41812 20.6399L16.9782 20.6396C18.8341 20.6396 20.338 19.1358 20.338 17.2798C20.338 15.4239 18.8341 13.92 16.9782 13.92H14.5301" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.41827 17.3208V17.3561M6.56145 17.3284C6.56145 17.4079 6.49693 17.4724 6.4174 17.4724C6.33787 17.4724 6.27344 17.4079 6.27344 17.3284C6.27344 17.2488 6.33787 17.1844 6.4174 17.1844C6.49693 17.1844 6.56145 17.2488 6.56145 17.3284Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
