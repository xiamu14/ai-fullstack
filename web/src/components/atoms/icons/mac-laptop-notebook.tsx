import type { IconProps } from './types.ts';

export function MacLaptopNotebookIcon({
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
          <path d="M19.9619 6.42233C19.9619 4.80333 18.6449 3.48633 17.0259 3.48633H6.97891C5.35991 3.48633 4.04291 4.80333 4.04291 6.42233V13.1433H19.9619V6.42233Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M13.3115 18.0026H10.6955C10.2815 18.0026 9.94547 17.6666 9.94547 17.2526C9.94547 16.8386 10.2815 16.5026 10.6955 16.5026H13.3115C13.7255 16.5026 14.0615 16.8386 14.0615 17.2526C14.0615 17.6666 13.7255 18.0026 13.3115 18.0026ZM21.3425 17.3206L20.1125 14.6436H3.89347L2.64647 17.3586C2.38347 18.0786 2.48847 18.8826 2.92747 19.5106C3.36647 20.1386 4.08547 20.5136 4.85147 20.5136H19.1535C19.9195 20.5136 20.6385 20.1386 21.0775 19.5106C21.5165 18.8826 21.6215 18.0776 21.3425 17.3206Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M17.0243 3.98633C18.37 3.98633 19.4597 5.07605 19.4597 6.42167V14.4265L20.8856 17.5295C21.3273 18.735 20.4351 20.0125 19.1508 20.0125H4.84913C3.56579 20.0125 2.67261 18.736 3.11433 17.5295L4.54117 14.4265V6.42167C4.54117 5.07605 5.63186 3.98633 6.97651 3.98633H17.0243Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M10.6934 17.2539H13.3087" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M19.4431 14.4277H4.55859" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
