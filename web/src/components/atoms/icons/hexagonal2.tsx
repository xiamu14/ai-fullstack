import type { IconProps } from './types.ts';

export function Hexagonal2Icon({
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
      <path d="M18.8669 6.76758L13.4102 3.61974C12.5405 3.10998 11.4605 3.10902 10.5917 3.61878L5.13602 6.76566C4.2653 7.26294 3.72386 8.19798 3.72386 9.2079V15.5065C3.72386 16.5154 4.2653 17.4514 5.13314 17.9468L10.5898 21.0946C11.0256 21.349 11.5133 21.4758 12.001 21.4758C12.4877 21.4758 12.9744 21.349 13.4083 21.0956L18.865 17.9478C19.7357 17.4524 20.2762 16.5164 20.2762 15.5065V9.2079C20.2762 8.19702 19.7357 7.26198 18.8669 6.76758Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
