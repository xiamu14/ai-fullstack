import type { IconProps } from './types.ts';

export function Checkmark2Icon({
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
      <path d="M9.37501 17.8127C9.11901 17.8127 8.86301 17.7147 8.66801 17.5197L4.29301 13.1448C3.90201 12.7538 3.90201 12.1217 4.29301 11.7308C4.68401 11.3398 5.31601 11.3398 5.70701 11.7308L9.37501 15.3988L18.293 6.48075C18.684 6.08975 19.316 6.08975 19.707 6.48075C20.098 6.87175 20.098 7.50375 19.707 7.89475L10.082 17.5197C9.88701 17.7147 9.63101 17.8127 9.37501 17.8127Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
