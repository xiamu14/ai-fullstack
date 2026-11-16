import type { IconProps } from './types.ts';

export function DeliveryBox5Icon({
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
      <path d="M20.1221 8.84332V15.1388C20.1221 15.9729 19.6766 16.7444 18.9546 17.161L13.5025 20.3088C12.7795 20.7263 11.8894 20.7263 11.1665 20.3088L5.71444 17.161C4.99242 16.7444 4.54688 15.9729 4.54688 15.1388V8.84332C4.54688 8.00828 4.99242 7.23769 5.71444 6.82016L11.1665 3.67243C11.8894 3.25584 12.7795 3.25584 13.5025 3.67243L18.9546 6.82016C19.6766 7.23769 20.1221 8.00828 20.1221 8.84332Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.87128 7.64624L12.3325 11.9625L19.7927 7.64624" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.3379 20.6398V11.9559" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
