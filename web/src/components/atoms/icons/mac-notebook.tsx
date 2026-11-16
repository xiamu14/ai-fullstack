import type { IconProps } from './types.ts';

export function MacNotebookIcon({
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
          <path d="M20.949 16.2461H3.052C2.609 16.2461 2.25 16.6051 2.25 17.0461V17.5531C2.25 19.0301 3.452 20.2311 4.929 20.2311H19.071C20.549 20.2311 21.75 19.0301 21.75 17.5531V17.0461C21.75 16.6051 21.39 16.2461 20.949 16.2461Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M11.446 6.06855H12.796C13.216 6.06855 13.546 6.39855 13.546 6.81855C13.546 7.22855 13.216 7.56855 12.796 7.56855H11.446C11.036 7.56855 10.696 7.22855 10.696 6.81855C10.696 6.39855 11.036 6.06855 11.446 6.06855ZM4.33594 14.8186H19.666C19.946 14.8186 20.166 14.5986 20.166 14.3186V6.67855C20.166 4.88855 18.826 3.76855 16.656 3.76855H7.34594C5.17594 3.76855 3.83594 4.88855 3.83594 6.67855V14.3186C3.83594 14.5986 4.05594 14.8186 4.33594 14.8186Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M3 16.4169V16.9238C3 18.2646 4.08778 19.3524 5.42854 19.3524H18.5715C19.9122 19.3524 21 18.2646 21 16.9238V16.4169C21 16.1133 20.7538 15.8672 20.4493 15.8672H3.54973C3.24616 15.8672 3 16.1133 3 16.4169Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M19.668 15.8668V7.66076C19.668 5.99698 18.3195 4.64844 16.6567 4.64844H7.34045C5.67666 4.64844 4.32812 5.99698 4.32812 7.66076V15.8668" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.3242 7.67578H12.6737" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
