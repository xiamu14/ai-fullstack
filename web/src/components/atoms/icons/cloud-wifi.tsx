import type { IconProps } from './types.ts';

export function CloudWifiIcon({
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
      <path d="M18.5637 17.1021C19.9998 16.4532 21 15.0073 21 13.328C21 10.7321 19.1698 9.18895 16.897 9.18701C16.897 7.55436 15.6165 4.28906 12 4.28906C8.38346 4.28906 7.10303 7.55436 7.10303 9.18701C4.83308 9.20744 3 10.7321 3 13.328C3 15.0073 3.99924 16.4532 5.43632 17.1021" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.9902 19.7108V19.6641" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.1406 17.5473C11.2021 16.6415 12.7813 16.6415 13.8486 17.5415" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.34961 15.2951C10.4736 13.5943 13.5083 13.5943 15.6323 15.2951" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
