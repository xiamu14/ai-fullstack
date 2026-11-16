import type { IconProps } from './types.ts';

export function Home84Icon({
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
      <path d="M21 10.785L13.3086 4.47435C12.5478 3.8497 11.4522 3.8497 10.6914 4.47435L3 10.785" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.48633 9.5625L5.88838 17.9126C6.08979 19.1132 7.12892 19.9918 8.34514 19.9918H15.6531C16.8703 19.9918 17.9095 19.1132 18.1109 17.9126L19.5129 9.5625" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.6038 12.8908C14.6038 14.3288 13.4382 15.4945 12.0002 15.4945C10.5621 15.4945 9.39648 14.3288 9.39648 12.8908C9.39648 11.4527 10.5621 10.2871 12.0002 10.2871C13.4382 10.2871 14.6038 11.4527 14.6038 12.8908Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
