import type { IconProps } from './types.ts';

export function SmartPhone3Icon({
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
      <path d="M18.3758 17.3815L18.3748 6.61751C18.3748 4.62 16.7548 3 14.7573 3H9.24154C7.24402 3 5.62402 4.62 5.62402 6.61849L5.625 17.3825C5.625 19.38 7.245 21 9.24251 21H14.7573C16.7558 21 18.3758 19.38 18.3758 17.3815Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.0002 17.3306V17.2824M12.0002 17.0293C11.862 17.0293 11.75 17.1413 11.75 17.2791C11.75 17.4173 11.862 17.5293 12.0002 17.5293C12.1385 17.5293 12.2505 17.4173 12.2505 17.2791C12.2505 17.1413 12.1385 17.0293 12.0002 17.0293Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
