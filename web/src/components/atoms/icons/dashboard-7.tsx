import type { IconProps } from './types.ts';

export function Dashboard7Icon({
  size = 24,
  variant: _variant = 'line',
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
      <path d="M8.41213 3.36H16.5094C19.3396 3.36 21.1013 5.35794 21.1013 8.18532V15.8147C21.1013 18.642 19.3396 20.64 16.5085 20.64H8.41213C5.58194 20.64 3.82125 18.642 3.82125 15.8147V8.18532C3.82125 5.35794 5.59035 3.36 8.41213 3.36Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.4702 10.4437H9.45214C8.40226 10.4437 7.74376 11.1873 7.74376 12.239V15.0785C7.74376 16.1303 8.39946 16.8738 9.45214 16.8738H15.4702C16.5239 16.8738 17.1786 16.1303 17.1786 15.0785V12.239C17.1786 11.1873 16.5239 10.4437 15.4702 10.4437Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M16.6826 7.12688H8.24062" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
