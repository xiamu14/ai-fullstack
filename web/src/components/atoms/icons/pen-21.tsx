import type { IconProps } from './types.ts';

export function Pen21Icon({
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
      <path d="M17.4028 5.90149L15.7381 4.68805C14.7311 3.95557 13.3199 4.17733 12.5865 5.18341L6.38582 13.7831C5.91254 14.457 5.66294 15.2615 5.66966 16.0852L5.68982 18.368C5.69846 19.2983 6.59318 19.9636 7.48694 19.7034L9.64022 19.0765C10.5004 18.826 11.2492 18.2903 11.7637 17.5588L17.8972 9.05413C18.6316 8.04613 18.4098 6.63589 17.4028 5.90149Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
