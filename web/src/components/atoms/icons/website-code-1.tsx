import type { IconProps } from './types.ts';

export function WebsiteCode1Icon({
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
          <path d="M21.0924 7.18C21.2721 7.18 21.4121 7.02238 21.3818 6.84518C20.9318 4.20846 18.98 2.5 16.2173 2.5H7.78328C5.01958 2.5 3.06774 4.20846 2.61771 6.84518C2.58747 7.02238 2.72741 7.18 2.90718 7.18H21.0924Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M16.742 14.8007L14.374 17.1687C14.227 17.3157 14.036 17.3887 13.844 17.3887C13.651 17.3887 13.46 17.3157 13.313 17.1687C13.02 16.8757 13.02 16.4017 13.313 16.1087L15.151 14.2707L13.313 12.4317C13.02 12.1387 13.02 11.6637 13.313 11.3707C13.607 11.0767 14.082 11.0787 14.374 11.3707L16.742 13.7397C17.035 14.0327 17.035 14.5077 16.742 14.8007ZM10.687 16.1087C10.98 16.4017 10.98 16.8757 10.687 17.1687C10.541 17.3157 10.349 17.3887 10.157 17.3887C9.965 17.3887 9.773 17.3157 9.627 17.1687L7.259 14.8007C6.966 14.5077 6.966 14.0327 7.259 13.7397L9.627 11.3707C9.92 11.0777 10.394 11.0777 10.687 11.3707C10.98 11.6637 10.98 12.1387 10.687 12.4317L8.849 14.2707L10.687 16.1087ZM2.8 8.67969C2.63431 8.67969 2.5 8.814 2.5 8.97969V15.9737C2.5 19.2787 4.623 21.4997 7.783 21.4997H16.217C19.377 21.4997 21.5 19.2787 21.5 15.9737V8.97969C21.5 8.814 21.3657 8.67969 21.2 8.67969H2.8Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M7.78313 3H16.2178C19.1659 3 21 5.08119 21 8.02638V15.9736C21 18.9198 19.1659 21 16.2169 21H7.78313C4.83503 21 3 18.9198 3 15.9736V8.02638C3 5.08119 4.84378 3 7.78313 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M10.1573 11.9023L7.78906 14.2706L10.1573 16.6388" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M13.8438 11.9023L16.212 14.2706L13.8438 16.6388" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M3.02539 7.92969H20.9767" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
