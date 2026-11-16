import type { IconProps } from './types.ts';

export function Docuemnt2LinesIcon({
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
      <path d="M13.7855 3.00004C14.344 3.00004 14.8782 3.22674 15.2644 3.62955L19.0561 7.57884C19.4219 7.96121 19.6272 8.47007 19.6272 8.99839V17.1636C19.6418 19.2195 18.0238 20.9163 15.9698 21L8.04403 20.999C5.9716 20.9533 4.32825 19.236 4.37398 17.1636V6.65646C4.42263 4.61711 6.09419 2.99128 8.13451 3.00004H13.7855Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.2192 15.3528H8.9233M12.2134 11.6719H8.92188" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M14.2695 3.0625V5.95514C14.2686 7.36692 15.4118 8.51211 16.8236 8.51503H19.5625" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
