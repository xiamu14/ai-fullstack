import type { IconProps } from './types.ts';

export function Messages3Icon({
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
      <path d="M11.7939 20.2989C14.1475 20.307 16.5039 19.319 18.1825 17.3275C20.6942 14.348 20.7732 9.87692 18.3612 6.81636C15.2212 2.83075 9.42131 2.58126 5.94734 6.06697C3.40786 8.61415 2.85938 12.3881 4.28218 15.4748C4.40067 15.7711 4.85938 16.5854 5.16728 17.1212C5.34232 17.4257 5.32437 17.8013 5.12239 18.0877C4.91952 18.3741 4.66279 18.7408 4.46261 19.0416C4.10444 19.5793 4.48505 20.2998 5.12957 20.2989L5.62927 20.2987C7.82093 20.2978 11.0302 20.2964 11.7939 20.2989Z" strokeWidth="1.38462" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.08835 9.52283H12.1054M9.08835 13.6961H15.0739" strokeWidth="1.38462" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
