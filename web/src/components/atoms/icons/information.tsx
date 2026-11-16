import type { IconProps } from './types.ts';

export function InformationIcon({
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
      <path d="M21 15.0944C21 17.8596 19.1552 20.1072 16.4183 20.1004H7.58173C4.84476 20.1072 3 17.8596 3 15.0944V8.91315C3 6.15088 4.84476 3.90039 7.58173 3.90039H16.4183C19.1552 3.90039 21 6.15088 21 8.91315V15.0944Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.69141 13.0078H9.39141M6.69141 15.8825H12.9914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M16.7515 10.8165H14.2665C13.9581 10.8165 13.709 10.5665 13.709 10.259V8.22646C13.709 7.91803 13.9581 7.66895 14.2665 7.66895H16.7515C17.0589 7.66895 17.309 7.91803 17.309 8.22646V10.259C17.309 10.5665 17.0589 10.8165 16.7515 10.8165Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
