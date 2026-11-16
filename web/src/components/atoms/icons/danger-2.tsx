import type { IconProps } from './types.ts';

export function Danger2Icon({
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
      <path d="M4.81397 20.4368H19.197C20.779 20.4368 21.772 18.7268 20.986 17.3528L13.8 4.7878C13.009 3.4048 11.015 3.4038 10.223 4.7868L3.02497 17.3518C2.23897 18.7258 3.23097 20.4368 4.81397 20.4368Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.0018 13.4148V10.3148" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.994 16.5H12.004" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
