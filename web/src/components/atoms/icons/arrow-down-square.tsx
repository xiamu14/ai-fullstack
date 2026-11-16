import type { IconProps } from './types.ts';

export function ArrowDownSquareIcon({
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
          <path d="M16.3299 2.00012C19.7199 2.00012 21.9999 4.38012 21.9999 7.91012V16.0801C21.9999 19.6201 19.7199 22.0001 16.3299 22.0001H7.65988C4.27088 22.0001 1.99988 19.6201 1.99988 16.0801V7.91012C1.99988 4.38012 4.27088 2.00012 7.65988 2.00012H16.3299ZM11.9999 7.17012C11.5799 7.17012 11.2499 7.50012 11.2499 7.92012V14.2701L8.77988 11.7901C8.63988 11.6501 8.43988 11.5701 8.24988 11.5701C8.06088 11.5701 7.86988 11.6501 7.71988 11.7901C7.42988 12.0801 7.42988 12.5601 7.71988 12.8501L11.4699 16.6201C11.7499 16.9001 12.2499 16.9001 12.5299 16.6201L16.2799 12.8501C16.5699 12.5601 16.5699 12.0801 16.2799 11.7901C15.9799 11.5001 15.5099 11.5001 15.2099 11.7901L12.7499 14.2701V7.92012C12.7499 7.50012 12.4099 7.17012 11.9999 7.17012Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M7.66588 21.25H16.3349C19.3549 21.25 21.2499 19.111 21.2499 16.084V7.916C21.2499 4.889 19.3649 2.75 16.3349 2.75H7.66588C4.63588 2.75 2.74988 4.889 2.74988 7.916V16.084C2.74988 19.111 4.63588 21.25 7.66588 21.25Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9999 16.086V7.914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M15.7478 12.3223L11.9998 16.0863L8.25183 12.3223" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
