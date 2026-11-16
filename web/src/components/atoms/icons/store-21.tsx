import type { IconProps } from './types.ts';

export function Store21Icon({
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
      <path d="M5.7863 3.83984H18.2141C18.9983 3.83984 19.7008 4.33314 19.98 5.07941L20.8742 7.68113C21.346 8.94307 20.4324 10.2945 19.1082 10.2945H4.89214C3.56793 10.2945 2.65334 8.94307 3.1262 7.68113L4.01939 5.07941C4.29961 4.33314 5.00209 3.83984 5.7863 3.83984Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.79102 10.3037V17.5513C4.79783 19.0001 5.97804 20.1686 7.4268 20.1618H16.5737C18.0225 20.1696 19.2036 19.002 19.2114 17.5533V10.2969" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.53711 20.1587V16.6774C9.53711 15.3172 10.6395 14.2148 11.9997 14.2148C13.3599 14.2148 14.4633 15.3172 14.4633 16.6774V20.1587" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
