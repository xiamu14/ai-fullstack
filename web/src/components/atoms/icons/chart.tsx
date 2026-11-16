import type { IconProps } from './types.ts';

export function ChartIcon({
  size = 24,
  variant = 'line',
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
      {variant === 'fill' ? (
        <>
          <path d="M16.669 2.00037C20.07 2.00037 21.99 3.92937 22 7.33037V16.6704C22 20.0704 20.07 22.0004 16.669 22.0004H7.33C3.929 22.0004 2 20.0704 2 16.6704V7.33037C2 3.92937 3.929 2.00037 7.33 2.00037H16.669ZM12.5 6.13037C12.219 5.96037 11.879 5.96037 11.61 6.13037C11.339 6.29937 11.19 6.61037 11.219 6.92037V17.1104C11.27 17.5404 11.629 17.8604 12.049 17.8604C12.48 17.8604 12.839 17.5404 12.879 17.1104V6.92037C12.919 6.61037 12.77 6.29937 12.5 6.13037ZM7.83 9.41037C7.56 9.24037 7.219 9.24037 6.95 9.41037C6.679 9.58037 6.53 9.88937 6.56 10.2004V17.1104C6.599 17.5404 6.959 17.8604 7.389 17.8604C7.82 17.8604 8.179 17.5404 8.219 17.1104V10.2004C8.25 9.88937 8.099 9.58037 7.83 9.41037ZM17.089 13.0404C16.82 12.8704 16.48 12.8704 16.2 13.0404C15.929 13.2104 15.78 13.5094 15.82 13.8304V17.1104C15.86 17.5404 16.219 17.8604 16.65 17.8604C17.07 17.8604 17.429 17.5404 17.48 17.1104V13.8304C17.509 13.5094 17.36 13.2104 17.089 13.0404Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M7.37109 10.2017V17.0619" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M12.0391 6.91913V17.0618" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M16.6289 13.8268V17.0619" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M16.6857 2H7.31429C4.04762 2 2 4.31208 2 7.58516V16.4148C2 19.6879 4.0381 22 7.31429 22H16.6857C19.9619 22 22 19.6879 22 16.4148V7.58516C22 4.31208 19.9619 2 16.6857 2Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
