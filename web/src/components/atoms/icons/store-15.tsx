import type { IconProps } from './types.ts';

export function Store15Icon({
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
      <path d="M9.0987 9.38763C9.0987 10.9802 7.74993 12.2711 6.21527 12.2711C4.68063 12.2711 3.33185 11.0278 3.33185 9.38763C3.33185 8.55912 3.83717 6.33233 4.17624 5.30021C4.49568 4.32506 5.40545 3.66748 6.43198 3.66748H17.4977C18.5205 3.66748 19.4265 4.31945 19.7506 5.289C20.0962 6.32299 20.6118 8.55632 20.6118 9.38763C20.6118 10.9381 19.263 12.2711 17.7284 12.2711C16.1937 12.2711 14.8441 10.9802 14.8441 9.38763" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.50586 14.4976V16.1592C4.50586 18.6027 6.02743 20.3288 8.47278 20.3288H15.4679C17.9142 20.3288 19.4357 18.6027 19.4357 16.1592V14.4976" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.08813 8.48999V9.39135C9.08813 10.9839 10.379 12.2747 11.9716 12.2747C13.5641 12.2747 14.855 10.9839 14.855 9.39135V8.48999" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
