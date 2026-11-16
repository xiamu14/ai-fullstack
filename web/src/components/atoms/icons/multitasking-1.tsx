import type { IconProps } from './types.ts';

export function Multitasking1Icon({
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
      <path d="M19.6023 20.25H4.39532C3.98132 20.25 3.64532 20.586 3.64532 21C3.64532 21.414 3.98132 21.75 4.39532 21.75H19.6023C20.0163 21.75 20.3523 21.414 20.3523 21C20.3523 20.586 20.0163 20.25 19.6023 20.25Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M4.3952 3.75H19.6022C20.0162 3.75 20.3522 3.414 20.3522 3C20.3522 2.586 20.0162 2.25 19.6022 2.25H4.3952C3.9812 2.25 3.6452 2.586 3.6452 3C3.6452 3.414 3.9812 3.75 4.3952 3.75Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M17.404 5.82007H6.59504C4.59504 5.82007 2.96704 7.44807 2.96704 9.44907V14.5231C2.96704 16.5241 4.59504 18.1521 6.59504 18.1521H17.404C19.405 18.1521 21.033 16.5241 21.033 14.5231V9.44907C21.033 7.44807 19.405 5.82007 17.404 5.82007Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
