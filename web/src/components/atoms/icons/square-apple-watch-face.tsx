import type { IconProps } from './types.ts';

export function SquareAppleWatchFaceIcon({
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
          <path d="M15.2071 21.2451H8.85907C8.44507 21.2451 8.10907 21.5811 8.10907 21.9951C8.10907 22.4091 8.44507 22.7451 8.85907 22.7451H15.2071C15.6211 22.7451 15.9571 22.4091 15.9571 21.9951C15.9571 21.5811 15.6211 21.2451 15.2071 21.2451Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M8.85947 2.74512H15.2075C15.6215 2.74512 15.9575 2.40912 15.9575 1.99512C15.9575 1.58112 15.6215 1.24512 15.2075 1.24512H8.85947C8.44547 1.24512 8.10947 1.58112 8.10947 1.99512C8.10947 2.40912 8.44547 2.74512 8.85947 2.74512Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M14.7533 13.1156C15.1133 13.3256 15.2233 13.7856 15.0133 14.1456C14.8733 14.3756 14.6233 14.5056 14.3733 14.5056C14.2433 14.5056 14.1033 14.4756 13.9833 14.4056L11.5733 12.9656C11.3433 12.8256 11.2033 12.5856 11.2033 12.3156V9.21564C11.2033 8.79564 11.5433 8.46564 11.9533 8.46564C12.3733 8.46564 12.7033 8.79564 12.7033 9.21564V11.8956L14.7533 13.1156ZM18.0633 5.84564C17.3733 5.15564 16.3533 4.78564 15.1233 4.78564H8.95327C6.46327 4.78564 4.97327 6.23564 4.97327 8.66564V15.2556C4.97327 17.6956 6.50327 19.2056 8.95327 19.2056H15.1133C17.6033 19.2056 19.0833 17.7456 19.0833 15.3156V8.66564C19.0933 7.49564 18.7333 6.52565 18.0633 5.84564Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M8.82617 22H15.1743" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M8.82617 2H15.1743" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M8.91991 5.29102H15.0864C17.2323 5.29102 18.561 6.48237 18.5545 8.67264V15.3191C18.5545 17.5094 17.2259 18.7072 15.0799 18.7072H8.91991C6.78045 18.7072 5.44531 17.4878 5.44531 15.264V8.67264C5.44531 6.48237 6.78045 5.29102 8.91991 5.29102Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M14.3379 13.7636L11.9238 12.3236V9.21875" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
