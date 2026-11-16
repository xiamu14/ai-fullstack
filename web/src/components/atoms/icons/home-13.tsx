import type { IconProps } from './types.ts';

export function Home13Icon({
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
      <path d="M3.44727 17.9114C3.45602 19.6218 4.85121 21.0083 6.57135 20.9995H17.4196C19.1387 21.017 20.5436 19.6306 20.5524 17.9114V10.0521C20.5349 9.3856 20.2197 8.74638 19.6797 8.34164L13.7555 3.61514C12.7203 2.79495 11.2521 2.79495 10.2082 3.61514L4.31123 8.3504C3.77125 8.75514 3.44727 9.3856 3.44727 10.0608V17.9114Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.43359 20.9987L8.43164 15.0443C8.43067 13.0751 10.0273 11.4785 11.9965 11.4785C13.9647 11.4785 15.5603 13.0741 15.5613 15.0424L15.5642 20.9987" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 16.1445V21.0004" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
