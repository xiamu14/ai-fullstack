import type { IconProps } from './types.ts';

export function IntegrationIcon({
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
      <path d="M8.27208 3H10.4503L12 4.55516L13.5497 3H15.7279L17.2643 4.54415V6.7357H19.4558L21 8.27208V10.4503L19.4448 12L21 13.5497V15.7279L19.4559 17.2643H17.2643V19.4558L15.7279 21H13.5496L12 19.4449L10.4503 21H8.27208L6.73569 19.4558V17.2643H4.54416L3 15.7279V13.5496L4.55515 12L3 10.4503V8.27208L4.54416 6.73569H6.7357V4.54416L8.27208 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 19.458V17.1518" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12 4.52832V6.88116" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.25 15.9023C13.25 15.2119 12.6904 14.6523 12 14.6523C11.3096 14.6523 10.75 15.2119 10.75 15.9023C10.75 16.5926 11.3096 17.1523 12 17.1523C12.6904 17.1523 13.25 16.5926 13.25 15.9023Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M13.25 8.13086C13.25 8.82122 12.6904 9.38086 12 9.38086C11.3096 9.38086 10.75 8.82122 10.75 8.13086C10.75 7.4405 11.3096 6.88086 12 6.88086C12.6904 6.88086 13.25 7.4405 13.25 8.13086Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.54541 12H6.86481" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M19.4668 12H17.1359" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.11475 13.25C8.8051 13.25 9.36475 12.6904 9.36475 12C9.36475 11.3096 8.8051 10.75 8.11475 10.75C7.42439 10.75 6.86475 11.3096 6.86475 12C6.86475 12.6904 7.42439 13.25 8.11475 13.25Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.8857 13.25C15.1954 13.25 14.6357 12.6904 14.6357 12C14.6357 11.3096 15.1954 10.75 15.8857 10.75C16.5761 10.75 17.1357 11.3096 17.1357 12C17.1357 12.6904 16.5761 13.25 15.8857 13.25Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
