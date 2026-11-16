import type { IconProps } from './types.ts';

export function DocumentPaper3LinesIcon({
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
      <path d="M7.96332 21H16.037C18.3119 21 20.1566 19.1552 20.1566 16.8804V7.11957C20.1566 4.84476 18.3119 3 16.037 3H7.96332C5.68851 3 3.84375 4.84476 3.84375 7.11957V16.8804C3.84375 19.1552 5.68851 21 7.96332 21Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.3096 15.9194H8.68945M15.3096 11.8632H8.68945M11.2158 7.81641H8.68993" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
