import type { IconProps } from './types.ts';

export function ChartThreeLine2Icon({
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
      <path d="M19.1496 14.7938C18.0638 14.7938 17.1797 15.6809 17.1797 16.7714V19.1522C17.1797 20.237 18.0638 21.1202 19.1496 21.1202C20.2354 21.1202 21.1195 20.237 21.1195 19.1522V16.7714C21.1195 15.6809 20.2354 14.7938 19.1496 14.7938Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M4.85078 2.88C3.76502 2.88 2.88086 3.76321 2.88086 4.84801V19.152C2.88086 20.2368 3.76502 21.12 4.85078 21.12C5.93654 21.12 6.8207 20.2368 6.8207 19.152V4.84801C6.8207 3.76321 5.93654 2.88 4.85078 2.88Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M12.0012 11.2219C10.9154 11.2219 10.0312 12.1051 10.0312 13.1909V19.1525C10.0312 20.2373 10.9154 21.1205 12.0012 21.1205C13.0869 21.1205 13.9711 20.2373 13.9711 19.1525V13.1909C13.9711 12.1051 13.0869 11.2219 12.0012 11.2219Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
