import type { IconProps } from './types.ts';

export function TvStandIcon({
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
          <path d="M17.994 2.98828H6.007C4.073 2.98828 2.5 4.56128 2.5 6.49428V13.9953C2.5 15.9293 4.073 17.5033 6.007 17.5033H11.023L7.579 19.6223C7.226 19.8393 7.117 20.3013 7.334 20.6543C7.551 21.0063 8.011 21.1173 8.366 20.9003L12.001 18.6633L15.636 20.9003C15.759 20.9753 15.894 21.0113 16.028 21.0113C16.28 21.0113 16.526 20.8843 16.668 20.6543C16.885 20.3013 16.775 19.8393 16.423 19.6223L12.978 17.5033H17.994C19.928 17.5033 21.5 15.9293 21.5 13.9953V6.49428C21.5 4.56128 19.928 2.98828 17.994 2.98828Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M17.9935 3.61328H6.00746C4.34659 3.61328 3 4.95988 3 6.61977V14.1204C3 15.7813 4.34659 17.1279 6.00746 17.1279H17.9935C19.6544 17.1279 21 15.7813 21 14.1204V6.61977C21 4.95988 19.6544 3.61328 17.9935 3.61328Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M16.0289 20.3854L12.0008 17.9062L7.97266 20.3854" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
