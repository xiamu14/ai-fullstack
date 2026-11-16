import type { IconProps } from './types.ts';

export function MonitorDisplayStandIcon({
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
          <path d="M17.994 2.6582H6.007C4.073 2.6582 2.5 4.2312 2.5 6.1642V13.6652C2.5 15.5992 4.073 17.1732 6.007 17.1732H11.25V19.8432H8.055C7.64 19.8432 7.305 20.1792 7.305 20.5932C7.305 21.0072 7.64 21.3432 8.055 21.3432H15.945C16.359 21.3432 16.695 21.0072 16.695 20.5932C16.695 20.1792 16.359 19.8432 15.945 19.8432H12.75V17.1732H17.994C19.928 17.1732 21.5 15.5992 21.5 13.6652V6.1642C21.5 4.2312 19.928 2.6582 17.994 2.6582Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M17.9935 3.2832H6.00746C4.34659 3.2832 3 4.6298 3 6.28969V13.7903C3 15.4512 4.34659 16.7978 6.00746 16.7978H17.9935C19.6544 16.7978 21 15.4512 21 13.7903V6.28969C21 4.6298 19.6544 3.2832 17.9935 3.2832Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M8.05469 20.7168H15.9445" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M12 17.0039V20.7168" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
