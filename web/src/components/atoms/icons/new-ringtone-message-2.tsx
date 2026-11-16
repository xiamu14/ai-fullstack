import type { IconProps } from './types.ts';

export function NewRingtoneMessage2Icon({
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
      <path d="M18.5664 9.56661L18.5673 10.885C18.5673 11.6643 18.7395 12.4349 19.0713 13.1403L19.5374 14.1308C20.2496 15.6448 19.1453 17.3854 17.4718 17.3854H6.52774C4.85423 17.3854 3.7499 15.6448 4.46212 14.1308L4.92817 13.1403C5.26093 12.4349 5.43217 11.6643 5.43217 10.885L5.43315 9.56661C5.43315 5.93936 8.37348 3 11.9998 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M16.5171 3.58594C17.4725 3.58594 18.247 4.36043 18.247 5.31589C18.247 6.27135 17.4725 7.04584 16.5171 7.04584C15.5616 7.04584 14.7871 6.27135 14.7871 5.31589C14.7871 4.36043 15.5616 3.58594 16.5171 3.58594Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.90234 17.9004C8.90234 19.6119 10.2898 21.0003 12.0013 21.0003C13.7137 21.0003 15.1012 19.6119 15.1012 17.9004" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
