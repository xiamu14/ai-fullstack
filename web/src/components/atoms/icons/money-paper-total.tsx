import type { IconProps } from './types.ts';

export function MoneyPaperTotalIcon({
  size = 24,
  variant = 'line',
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
      {variant === 'fill' ? (
        <>
          <path d="M17.8022 12.2419H16.4554C16.0579 12.2419 15.7354 11.9193 15.7354 11.5219C15.7354 11.1245 16.0579 10.8019 16.4554 10.8019H17.8022C18.1997 10.8019 18.5222 11.1245 18.5222 11.5219C18.5222 11.9193 18.1997 12.2419 17.8022 12.2419ZM11.999 17.2051C10.391 17.2051 9.08256 15.9005 9.08256 14.2963C9.08256 12.6864 10.391 11.3779 11.999 11.3779C13.607 11.3779 14.9155 12.6864 14.9155 14.2963C14.9155 15.9005 13.607 17.2051 11.999 17.2051ZM7.54368 17.7811H6.1968C5.79936 17.7811 5.4768 17.4585 5.4768 17.0611C5.4768 16.6627 5.79936 16.3411 6.1968 16.3411H7.54368C7.94112 16.3411 8.26368 16.6627 8.26368 17.0611C8.26368 17.4585 7.94112 17.7811 7.54368 17.7811ZM17.5795 7.93146H6.42048C4.30272 7.93146 2.88 9.41658 2.88 11.6265V16.9651C2.88 19.176 4.30272 20.6611 6.42048 20.6611H17.5786C19.6973 20.6611 21.12 19.176 21.12 16.9651V11.6265C21.12 9.41658 19.6973 7.93146 17.5795 7.93146Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M11.9989 12.8175C11.1849 12.8175 10.5225 13.4799 10.5225 14.2959C10.5225 15.1061 11.1849 15.7647 11.9989 15.7647C12.813 15.7647 13.4754 15.1061 13.4754 14.2959C13.4754 13.4799 12.813 12.8175 11.9989 12.8175Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M6.96375 6.49127H17.037C17.4345 6.49127 17.757 6.16871 17.757 5.77127C17.757 5.37383 17.4345 5.05127 17.037 5.05127H6.96375C6.56631 5.05127 6.24375 5.37383 6.24375 5.77127C6.24375 6.16871 6.56631 6.49127 6.96375 6.49127Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M8.82329 3.9375H15.1765C15.574 3.9375 15.8965 3.61494 15.8965 3.2175C15.8965 2.82006 15.574 2.4975 15.1765 2.4975H8.82329C8.42585 2.4975 8.10329 2.82006 8.10329 3.2175C8.10329 3.61494 8.42585 3.9375 8.82329 3.9375Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M6.42089 8.29126H17.5791C19.4659 8.29126 20.64 9.62324 20.64 11.5081V16.8425C20.64 18.7274 19.4659 20.0594 17.5782 20.0594H6.42089C4.53411 20.0594 3.36 18.7274 3.36 16.8425V11.5081C3.36 9.62324 4.53971 8.29126 6.42089 8.29126Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M6.19688 16.9462H7.54379" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M17.8019 11.4037H16.455" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M14.1953 14.1754C14.1953 12.962 13.2118 11.9794 11.9994 11.9794C10.7861 11.9794 9.80251 12.962 9.80251 14.1754C9.80251 15.3887 10.7861 16.3713 11.9994 16.3713C13.2118 16.3713 14.1953 15.3887 14.1953 14.1754Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M6.96376 5.65689H17.0375" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M8.82376 3.10126H15.1763" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
