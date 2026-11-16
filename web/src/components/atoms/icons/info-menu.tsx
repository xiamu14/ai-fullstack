import type { IconProps } from './types.ts';

export function InfoMenuIcon({
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
          <path d="M11.999 16.0117C10.762 16.0117 9.755 17.0187 9.755 18.2557C9.755 19.4937 10.762 20.5007 11.999 20.5007C13.237 20.5007 14.245 19.4937 14.245 18.2557C14.245 17.0187 13.237 16.0117 11.999 16.0117Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M11.999 9.75586C10.762 9.75586 9.755 10.7629 9.755 11.9999C9.755 13.2379 10.762 14.2449 11.999 14.2449C13.237 14.2449 14.245 13.2379 14.245 11.9999C14.245 10.7629 13.237 9.75586 11.999 9.75586Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M11.999 7.989C13.237 7.989 14.245 6.982 14.245 5.744C14.245 4.507 13.237 3.5 11.999 3.5C10.762 3.5 9.755 4.507 9.755 5.744C9.755 6.982 10.762 7.989 11.999 7.989Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M21 16.2169V7.78216C21 4.84281 18.9188 3 15.9736 3H8.02638C5.08119 3 3 4.83308 3 7.78216V16.2159C3 19.165 5.08119 21 8.02638 21H15.9736C18.9188 21 21 19.165 21 16.2169Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9708 15.8404H11.9068M11.957 16.0997C11.813 16.0997 11.6962 15.9828 11.6962 15.8388C11.6962 15.6948 11.813 15.5781 11.957 15.5781C12.101 15.5781 12.2178 15.6948 12.2178 15.8388C12.2178 15.9828 12.101 16.0997 11.957 16.0997Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9708 11.9381H11.9068M11.957 12.1973C11.813 12.1973 11.6962 12.0805 11.6962 11.9365C11.6962 11.7925 11.813 11.6758 11.957 11.6758C12.101 11.6758 12.2178 11.7925 12.2178 11.9365C12.2178 12.0805 12.101 12.1973 11.957 12.1973Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9708 8.03964H11.9068M11.957 8.2989C11.813 8.2989 11.6962 8.18206 11.6962 8.03804C11.6962 7.89403 11.813 7.77734 11.957 7.77734C12.101 7.77734 12.2178 7.89403 12.2178 8.03804C12.2178 8.18206 12.101 8.2989 11.957 8.2989Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
