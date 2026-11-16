import type { IconProps } from './types.ts';

export function RemoveCircleIcon({
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
          <path d="M14.866 14.864C14.72 15.01 14.528 15.084 14.336 15.084C14.143 15.084 13.952 15.01 13.805 14.864L11.999 13.057L10.198 14.858C9.905 15.151 9.43 15.151 9.137 14.858C8.845 14.565 8.845 14.091 9.137 13.798L10.938 11.997L9.136 10.194C8.843 9.901 8.843 9.427 9.136 9.134C9.429 8.841 9.903 8.841 10.196 9.134L11.998 10.936L13.8 9.135C14.093 8.842 14.567 8.842 14.86 9.135C15.153 9.427 15.153 9.902 14.86 10.195L13.059 11.997L14.866 13.803C15.159 14.096 15.159 14.571 14.866 14.864ZM12 2.5C6.762 2.5 2.5 6.761 2.5 12C2.5 17.238 6.762 21.5 12 21.5C17.238 21.5 21.5 17.238 21.5 12C21.5 6.761 17.238 2.5 12 2.5Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M21 12C21 7.02908 16.9709 3 12 3C7.02908 3 3 7.02908 3 12C3 16.9699 7.02908 21 12 21C16.9709 21 21 16.9699 21 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M14.3304 9.66646L9.66792 14.329M14.3363 14.3353L9.66602 9.66504" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
