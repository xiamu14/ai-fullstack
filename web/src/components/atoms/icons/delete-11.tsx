import type { IconProps } from './types.ts';

export function Delete11Icon({
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
      <path d="M8.37099 4.40083C8.68803 3.72878 9.3644 3.3 10.1075 3.3H13.413C14.1561 3.3 14.8325 3.72878 15.1495 4.40082L15.7748 5.72633H17.7061C18.7665 5.72633 19.6261 6.58594 19.6261 7.64633V7.77531C19.6261 8.3055 19.1964 8.73531 18.6661 8.73531H4.85437C4.32419 8.73531 3.89437 8.3055 3.89437 7.77531V7.64633C3.89437 6.58594 4.75399 5.72633 5.81437 5.72633H7.74568L8.37099 4.40083Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M18.1516 8.83875V17.6983C18.1516 19.2889 16.8622 20.5783 15.2716 20.5783H8.41782C6.82723 20.5783 5.53781 19.2889 5.53781 17.6983V8.83875" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.0724 12.12L13.3031 14.9419" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.44683 13.4475L10.1306 16.458" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
