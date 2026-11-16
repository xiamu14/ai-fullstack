import type { IconProps } from './types.ts';

export function ChartThreeLine7Icon({
  size = 24,
  variant: _variant = 'fill',
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
      <path d="M6.76502 11.9908H4.07318C3.41462 11.9908 2.88086 12.5246 2.88086 13.1832V18.9057C2.88086 19.5633 3.41462 20.098 4.07318 20.098H6.76502C7.42358 20.098 7.95734 19.5633 7.95734 18.9057V13.1832C7.95734 12.5246 7.42358 11.9908 6.76502 11.9908Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M13.0867 7.93762H10.415C9.75645 7.93762 9.22266 8.47138 9.22266 9.12994V18.9056C9.22266 19.5642 9.75645 20.0979 10.415 20.0979H13.0867C13.7452 20.0979 14.279 19.5642 14.279 18.9056V9.12994C14.279 8.47138 13.7452 7.93762 13.0867 7.93762Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M19.9283 3.84375H16.7392C16.0806 3.84375 15.5469 4.37751 15.5469 5.03607V18.9657C15.5469 19.6242 16.0806 20.158 16.7392 20.158H19.9283C20.5869 20.158 21.1206 19.6242 21.1206 18.9657V5.03607C21.1206 4.37751 20.5869 3.84375 19.9283 3.84375Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
