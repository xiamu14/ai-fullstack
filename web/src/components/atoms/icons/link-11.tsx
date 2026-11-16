import type { IconProps } from './types.ts';

export function Link11Icon({
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
      <path d="M9.97363 13.9053C11.5965 16.075 14.671 16.5187 16.8407 14.8958C17.0285 14.7547 17.2065 14.601 17.3719 14.4356L19.6224 12.1852C21.505 10.2364 21.4505 7.13071 19.5017 5.24806C17.6006 3.41211 14.5864 3.41211 12.6843 5.24806" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.0259 10.0969C12.4031 7.92723 9.32856 7.48356 7.15888 9.10644C6.9711 9.24752 6.79306 9.40124 6.62765 9.56664L4.37723 11.8171C2.49457 13.7659 2.54906 16.8715 4.49787 18.7542C6.39901 20.5911 9.4132 20.5911 11.3153 18.7542" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
