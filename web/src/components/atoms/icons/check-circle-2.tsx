import type { IconProps } from './types.ts';

export function CheckCircle2Icon({
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
      <path d="M13.2614 3.15332C13.7927 3.237 14.3103 3.36835 14.8163 3.54641C19.4468 5.21901 21.8443 10.3282 20.1717 14.9588C18.4991 19.5893 13.3899 21.9868 8.75936 20.3142C7.70268 19.9328 6.76179 19.3704 5.95906 18.6776C5.56694 18.3497 5.21763 17.9926 4.91016 17.6073" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M3.48066 15.2083C3.26368 14.642 3.09341 14.0387 3 13.416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.18706 5.04883C5.7531 5.40689 5.34736 5.80291 4.99805 6.22811" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M3.5537 8.60742C3.29877 9.22041 3.11975 9.87135 3.01562 10.5408" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.4309 3.15234C9.80822 3.24673 9.20496 3.40727 8.63867 3.63398" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M20.9991 5.42676C16.2353 8.09473 13.2793 12.4032 11.8753 15.041C10.913 13.4258 9.69281 11.9897 8.20898 10.7374" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
