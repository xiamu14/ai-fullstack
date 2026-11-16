import type { IconProps } from './types.ts';

export function CubeIcon({
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
      <path d="M9.265 3H18.945C20.08 3 21 3.92 21 5.055V14.735C21 15.545 20.678 16.322 20.105 16.895L16.895 20.105C16.322 20.678 15.545 21 14.735 21H5.055C3.92 21 3 20.08 3 18.945V9.265C3 8.455 3.322 7.678 3.895 7.105L7.105 3.895C7.678 3.322 8.455 3 9.265 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.00098 14.9973L15.791 14.9971H20.991" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.00098 14.9971L3.60156 20.3968" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8 14.9973V8.68734V3.27734" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M3.06055 8.68766L8 8.6875L15.7905 8.68766" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.7891 20.8169V9.08691C15.7891 8.82691 15.8791 8.57691 16.0591 8.37691L20.3791 3.58691" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
