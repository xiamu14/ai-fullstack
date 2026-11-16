import type { IconProps } from './types.ts';

export function Delete2Icon({
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
      <path d="M5.18449 18.2262C5.18449 20.0857 6.68209 21.5996 8.52241 21.5996H14.9995C16.8389 21.5996 18.3365 20.0857 18.3365 18.2262V11.0636C18.3365 10.9046 18.2076 10.7756 18.0485 10.7756H5.47249C5.31344 10.7756 5.18449 10.9046 5.18449 11.0636V18.2262Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M17.9237 4.95746H15.6984L15.0408 3.52418C14.7288 2.84162 14.0405 2.40002 13.2888 2.40002H10.2312C9.48045 2.40002 8.7931 2.84066 8.48013 3.52418L7.82253 4.95746H5.59725C4.55469 4.95746 3.70605 5.80514 3.70605 6.8477V7.89218C3.70605 8.68898 4.35405 9.33698 5.15085 9.33698H18.3701C19.1659 9.33698 19.8139 8.68898 19.8139 7.89218V6.8477C19.8139 5.80514 18.9662 4.95746 17.9237 4.95746Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
