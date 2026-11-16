import type { IconProps } from './types.ts';

export function BookmarkIcon({
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
          <path d="M15.07 2C17.78 2 19.97 3.07 20 5.79V20.97C20 21.14 19.96 21.31 19.88 21.46C19.75 21.7 19.53 21.88 19.26 21.96C19 22.04 18.71 22 18.47 21.86L11.99 18.62L5.5 21.86C5.351 21.939 5.18 21.99 5.01 21.99C4.45 21.99 4 21.53 4 20.97V5.79C4 3.07 6.2 2 8.9 2H15.07ZM15.75 8.04H8.22C7.79 8.04 7.44 8.39 7.44 8.83C7.44 9.269 7.79 9.62 8.22 9.62H15.75C16.18 9.62 16.53 9.269 16.53 8.83C16.53 8.39 16.18 8.04 15.75 8.04Z" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M19.7381 6.15364C19.7381 3.40276 17.8574 2.3 15.1496 2.3H8.7907C6.16614 2.3 4.19922 3.32757 4.19922 5.97018V20.694C4.19922 21.4198 4.98017 21.8769 5.61275 21.5221L11.9947 17.9421L18.3215 21.516C18.9551 21.8729 19.7381 21.4158 19.7381 20.689V6.15364Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M8.26953 9.02803H15.5878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
