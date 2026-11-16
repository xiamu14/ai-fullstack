import type { IconProps } from './types.ts';

export function InfoCircleAlt2Icon({
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
          <path d="M12.756 15.693C12.756 16.107 12.42 16.443 12.006 16.443C11.592 16.443 11.256 16.107 11.256 15.693V11.394C11.256 10.98 11.592 10.644 12.006 10.644C12.42 10.644 12.756 10.98 12.756 11.394V15.693ZM11.25 8.291C11.25 7.877 11.586 7.541 12 7.541C12.414 7.541 12.75 7.877 12.75 8.291C12.75 8.705 12.414 9.073 12 9.073C11.586 9.073 11.25 8.768 11.25 8.354V8.291ZM12 2.5C6.762 2.5 2.5 6.761 2.5 12C2.5 17.238 6.762 21.5 12 21.5C17.238 21.5 21.5 17.238 21.5 12C21.5 6.761 17.238 2.5 12 2.5Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M3 12C3 16.9699 7.02908 21 12 21C16.9709 21 21 16.9699 21 12C21 7.02908 16.9709 3 12 3C7.02908 3 3 7.02908 3 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M12.0057 15.6932V11.3936M12 8.35426V8.29102" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
