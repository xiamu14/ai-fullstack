import type { IconProps } from './types.ts';

export function TranslateLanguage4Icon({
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
      <path d="M7.78313 3H16.2178C19.1659 3 21 5.08119 21 8.02638V15.9736C21 18.9188 19.1659 21 16.2169 21H7.78313C4.83503 21 3 18.9188 3 15.9736V8.02638C3 5.08119 4.84378 3 7.78313 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.6387 14.9844C13.3684 15.2763 13.7907 15.3181 14.6274 15.3181C15.1139 15.3181 15.7989 15.0982 16.2562 15.0009" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.0078 16.2235L14.4568 11.4258L16.9067 16.2235" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.80859 10.5703C9.04113 11.5258 9.48676 12.3956 10.0871 13.1253C10.2934 13.3734 10.5201 13.607 10.7623 13.8239" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.4151 8.64453C12.4734 8.76713 12.1747 13.09 7.39355 14.5534" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M7.09375 8.64453H14.0427" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.3887 7.77734V8.64232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
