import type { IconProps } from './types.ts';

export function AddUserIcon({
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
          <path d="M9.5 15.0152C13.5668 15.0152 17 15.6844 17 18.2687C17 20.8531 13.5448 21.5 9.5 21.5C5.4332 21.5 2 20.8298 2 18.2464C2 15.6621 5.45422 15.0152 9.5 15.0152ZM18.999 7.5C19.4952 7.5 19.8979 7.90945 19.8979 8.41162V9.58786H21.101C21.5962 9.58786 22 9.99731 22 10.4995C22 11.0016 21.5962 11.4111 21.101 11.4111H19.8979V12.5884C19.8979 13.0906 19.4952 13.5 18.999 13.5C18.5038 13.5 18.1 13.0906 18.1 12.5884V11.4111H16.899C16.4027 11.4111 16 11.0016 16 10.4995C16 9.99731 16.4027 9.58786 16.899 9.58786H18.1V8.41162C18.1 7.90945 18.5038 7.5 18.999 7.5ZM9.5 2.5C12.2546 2.5 14.4626 4.73663 14.4626 7.52684C14.4626 10.3171 12.2546 12.5537 9.5 12.5537C6.74543 12.5537 4.53737 10.3171 4.53737 7.52684C4.53737 4.73663 6.74543 2.5 9.5 2.5Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M9.877 15.2062C6.033 15.2062 2.75 15.7872 2.75 18.1152C2.75 20.4432 6.013 21.0452 9.877 21.0452C13.722 21.0452 17.004 20.4632 17.004 18.1362C17.004 15.8092 13.742 15.2062 9.877 15.2062Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M9.87761 11.8859C12.4006 11.8859 14.4456 9.8409 14.4456 7.3179C14.4456 4.7949 12.4006 2.7499 9.87761 2.7499C7.35561 2.7499 5.31058 4.7949 5.31058 7.3179C5.30161 9.8319 7.33161 11.8769 9.84661 11.8859H9.87761Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M19.2031 8.6691V12.6791" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M21.25 10.674H17.16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
