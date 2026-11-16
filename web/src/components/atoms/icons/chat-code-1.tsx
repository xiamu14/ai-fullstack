import type { IconProps } from './types.ts';

export function ChatCode1Icon({
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
      <path d="M10.955 20.2064L9.53351 18.7849C9.12876 18.3801 8.58 18.1534 8.00789 18.1534H6.93957C4.764 18.1534 3 16.3894 3 14.2139V7.29894C3 5.12337 4.764 3.35938 6.93957 3.35938H17.0614C19.237 3.35938 21 5.12337 21 7.29894V14.2139C21 16.3894 19.237 18.1534 17.0614 18.1534H15.9931C15.421 18.1534 14.8722 18.3801 14.4675 18.7849L13.045 20.2064C12.468 20.7834 11.533 20.7834 10.955 20.2064Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.85485 8.88672L6.56836 11.1732L8.85485 13.4587" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.1445 8.88672L17.431 11.1732L15.1445 13.4587" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M12.8192 8.88672L11.1826 13.4587" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
