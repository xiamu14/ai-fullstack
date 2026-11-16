import type { IconProps } from './types.ts';

export function PenAlt2Icon({
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
      <path d="M7.78313 3H16.2178C19.1659 3 21 5.08119 21 8.02638V15.9736C21 18.9188 19.1659 21 16.2169 21H7.78313C4.83503 21 3 18.9188 3 15.9736V8.02638C3 5.08119 4.84378 3 7.78313 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M17.3811 10.8948L16.6203 11.2557C16.1883 11.461 15.6746 11.3715 15.3369 11.0339L13.6011 9.29715C13.2626 8.95953 13.174 8.4458 13.3783 8.01477L13.7403 7.25391" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.51 11.2062L14.717 15.9884C14.717 15.9884 10.1129 15.5622 7.88867 16.7453C9.07278 14.5221 8.64759 9.91797 8.64759 9.91797L13.4288 9.125" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M7.88867 16.7466L11.7008 12.9355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
