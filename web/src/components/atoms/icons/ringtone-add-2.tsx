import type { IconProps } from './types.ts';

export function RingtoneAdd2Icon({
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
      <path d="M11.9995 3C8.37239 3 5.43311 5.93928 5.43311 9.56643L5.43214 10.8848C5.43214 11.6651 5.25993 12.4347 4.92815 13.1401L4.46211 14.1305C3.74991 15.6444 4.85421 17.3851 6.52768 17.3851H17.4714C19.1449 17.3851 20.2492 15.6444 19.537 14.1305L19.0709 13.1401C18.7392 12.4347 18.567 11.6651 18.567 10.8848L18.566 9.56643C18.566 5.93928 15.6257 3 11.9995 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.9983 12.4669V8.55273M10.041 10.5105H13.9552" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.90039 17.9004C8.90039 19.6118 10.2878 21.0002 11.9992 21.0002C13.7116 21.0002 15.099 19.6118 15.099 17.9004" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
