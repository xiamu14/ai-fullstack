import type { IconProps } from './types.ts';

export function DollarCircle2Icon({
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
      <path d="M20.64 11.58C20.64 6.80792 16.7721 2.94 12 2.94C7.22792 2.94 3.36 6.80792 3.36 11.58C3.36 16.3521 7.22792 20.22 12 20.22C16.7721 20.22 20.64 16.3521 20.64 11.58Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.9748 10.0284V9.95732C13.9748 9.27735 13.4237 8.72626 12.7437 8.72626H11.5126C10.6916 8.72626 10.0256 9.39131 10.0256 10.2133C10.0256 11.0343 10.6916 11.7003 11.5126 11.7003H12.5457C13.335 11.7003 13.9758 12.3401 13.9758 13.1294C13.9758 13.9196 13.335 14.5595 12.5457 14.5595H11.2567C10.5767 14.5595 10.0256 14.0074 10.0256 13.3274" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.0037 15.4714V14.5644M12.0037 8.72341V7.69501" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
