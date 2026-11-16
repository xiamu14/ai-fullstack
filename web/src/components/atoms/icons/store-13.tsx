import type { IconProps } from './types.ts';

export function Store13Icon({
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
      <path d="M9.14368 8.05831C9.14368 9.62567 7.81639 10.896 6.30601 10.896C4.79563 10.896 3.24789 9.5827 3.46834 8.05831C3.58509 7.25222 3.96618 5.98283 4.29871 4.96751C4.61442 4.00728 5.50926 3.35999 6.51991 3.35999H17.4092C18.4152 3.35999 19.3072 4.00169 19.6266 4.95536C19.9667 5.97349 20.3561 7.24848 20.4738 8.05831C20.6934 9.5827 19.1456 10.896 17.6362 10.896C16.1258 10.896 14.7985 9.62567 14.7985 8.05831" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.13501 7.16998V8.05734C9.13501 9.62469 10.4054 10.895 11.9727 10.895C13.54 10.895 14.8103 9.62469 14.8103 8.05734V7.16998" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.35376 10.2225V17.8809C4.36123 19.4108 5.6082 20.6457 7.13912 20.6382H16.8029C18.3338 20.6475 19.5817 19.4136 19.5911 17.8827V17.8809V10.215" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M16.2305 13.5737V13.5637" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.49414 20.6264V17.1246C9.49414 15.7562 10.6029 14.6475 11.9713 14.6475C13.3397 14.6475 14.4494 15.7562 14.4494 17.1246V20.6264" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
