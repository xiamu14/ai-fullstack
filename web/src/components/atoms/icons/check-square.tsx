import type { IconProps } from './types.ts';

export function CheckSquareIcon({
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
          <path d="M15.993 10.222L11.375 14.84C11.228 14.987 11.037 15.06 10.845 15.06C10.652 15.06 10.461 14.987 10.314 14.84L8.005 12.531C7.712 12.238 7.712 11.763 8.005 11.47C8.298 11.177 8.772 11.177 9.065 11.47L10.845 13.249L14.932 9.161C15.225 8.868 15.7 8.868 15.993 9.161C16.286 9.454 16.286 9.929 15.993 10.222ZM16.217 2.5H7.782C4.623 2.5 2.5 4.721 2.5 8.027V15.975C2.5 19.28 4.623 21.5 7.782 21.5H16.216C19.376 21.5 21.5 19.28 21.5 15.975V8.027C21.5 4.721 19.377 2.5 16.217 2.5Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M7.78216 3H16.2169C19.165 3 21 5.08119 21 8.02638V15.9736C21 18.9188 19.165 21 16.2159 21H7.78216C4.83405 21 3 18.9188 3 15.9736V8.02638C3 5.08119 4.84281 3 7.78216 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M8.53516 12.0003L10.845 14.3091L15.4627 9.69141" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
