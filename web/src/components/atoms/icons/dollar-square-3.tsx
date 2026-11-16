import type { IconProps } from './types.ts';

export function DollarSquare3Icon({
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
      <path d="M7.95092 2.94H16.0481C18.8779 2.94 20.64 4.9385 20.64 7.76549V15.3954C20.64 18.2224 18.8779 20.22 16.0472 20.22H7.95092C5.12018 20.22 3.36 18.2224 3.36 15.3954V7.76549C3.36 4.9385 5.12863 2.94 7.95092 2.94Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.0874 9.94051V9.86544C14.0874 9.14673 13.5048 8.56312 12.7861 8.56312H11.4838C10.6159 8.56312 9.91125 9.26776 9.91125 10.1357C9.91125 11.0045 10.6159 11.7082 11.4838 11.7082H12.5769C13.411 11.7082 14.0884 12.3847 14.0884 13.2197C14.0884 14.0548 13.411 14.7313 12.5769 14.7313H11.2136C10.4948 14.7313 9.9122 14.1477 9.9122 13.429" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 15.695V14.7361M12 8.55932V7.47187" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
