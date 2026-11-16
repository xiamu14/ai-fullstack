import type { IconProps } from './types.ts';

export function Bookmark2Icon({
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
          <path d="M16.217 21.5H7.783C4.623 21.5 2.5 19.279 2.5 15.974V8.027C2.5 4.721 4.623 2.5 7.783 2.5H16.218C19.377 2.5 21.5 4.721 21.5 8.027V15.974C21.5 19.279 19.377 21.5 16.217 21.5ZM8.06381 5.9843V14.8367C8.06381 15.6188 8.93111 15.9221 9.61142 15.5388L12.0109 14.1767L14.3869 15.5347C15.0663 15.923 15.9369 15.6159 15.9369 14.8342L15.9355 5.98403C15.9354 5.4318 15.4877 4.98418 14.9355 4.98419L9.06379 4.9843C8.51152 4.98431 8.06381 5.43203 8.06381 5.9843Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M7.78313 3H16.2178C19.1659 3 21 5.08119 21 8.02735V15.9736C21 18.9188 19.1659 21 16.2169 21H7.78313C4.83503 21 3 18.9188 3 15.9736V8.02735C3 5.08119 4.84378 3 7.78313 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M7.91211 3V14.3916C7.91211 14.7944 8.34606 15.0464 8.69535 14.8479L12.0151 12.9642L15.3038 14.844C15.6541 15.0435 16.089 14.7915 16.089 14.3886L16.087 3.0973" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
