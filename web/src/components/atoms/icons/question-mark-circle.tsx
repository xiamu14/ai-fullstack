import type { IconProps } from './types.ts';

export function QuestionMarkCircleIcon({
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
          <path d="M13.709 12.795L13.568 12.874C12.92 13.236 12.691 13.422 12.696 13.74C12.701 14.154 12.37 14.494 11.956 14.5H11.946C11.536 14.5 11.201 14.171 11.196 13.76C11.179 12.492 12.216 11.912 12.835 11.566L12.976 11.486C13.545 11.173 13.829 10.739 13.829 10.193C13.829 9.29 13.094 8.556 12.191 8.556C11.272 8.556 10.552 9.275 10.552 10.193C10.552 10.607 10.216 10.943 9.802 10.943C9.388 10.943 9.052 10.607 9.052 10.193C9.052 8.463 10.46 7.056 12.191 7.056C13.921 7.056 15.329 8.463 15.329 10.193C15.329 11.296 14.753 12.22 13.709 12.795ZM11.947 16.96C11.533 16.96 11.197 16.639 11.197 16.225V16.195C11.197 15.781 11.533 15.445 11.947 15.445C12.361 15.445 12.697 15.781 12.697 16.195C12.697 16.609 12.361 16.96 11.947 16.96ZM12 2.5C6.761 2.5 2.5 6.762 2.5 12C2.5 17.238 6.761 21.5 12 21.5C17.238 21.5 21.5 17.238 21.5 12C21.5 6.762 17.238 2.5 12 2.5Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M21 12C21 7.02908 16.9709 3 12 3C7.02908 3 3 7.02908 3 12C3 16.9699 7.02908 21 12 21C16.9709 21 21 16.9699 21 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9473 16.2245V16.1963" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M11.9462 13.7496C11.9345 12.8583 12.745 12.4808 13.3473 12.1373C14.0819 11.7326 14.5791 11.0875 14.5791 10.1933C14.5791 8.86815 13.5078 7.80469 12.1914 7.80469C10.8662 7.80469 9.80273 8.86815 9.80273 10.1933" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
