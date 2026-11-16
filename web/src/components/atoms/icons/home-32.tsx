import type { IconProps } from './types.ts';

export function Home32Icon({
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
      <path d="M21 9.95611L13.4741 3.9986C12.6101 3.31557 11.3899 3.31557 10.5259 3.9986L3 9.95611" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.49609 8.77539V17.4504C4.49609 19.1424 5.86799 20.5143 7.55999 20.5143H16.4393C18.1313 20.5143 19.5032 19.1424 19.5032 17.4504V8.77539" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.0508 12.1719V15.7271M13.9484 12.1719V15.7271" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
