import type { IconProps } from './types.ts';

export function DeliveryBox3Icon({
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
          <path d="M12.0907 11.4201C12.2395 11.5062 12.4229 11.5062 12.5717 11.4201L19.6361 7.32979C19.7905 7.24037 19.8284 7.03223 19.7023 6.90596C19.551 6.75447 19.3841 6.6178 19.1942 6.5069L13.7452 3.36866C12.8745 2.85986 11.7926 2.86082 10.9267 3.3677L5.47197 6.50786C5.2824 6.61959 5.11541 6.75677 4.96402 6.90893C4.83832 7.03526 4.87628 7.24304 5.03051 7.33234L12.0907 11.4201Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M13.2982 12.6642C13.15 12.75 13.0587 12.9083 13.0587 13.0796V20.7367C13.0587 20.9259 13.2388 21.0637 13.4134 20.9909C13.5262 20.9438 13.6367 20.889 13.7441 20.8265L19.1988 17.6864C20.0657 17.1776 20.6033 16.2435 20.6033 15.246V8.94848C20.6033 8.92489 20.6026 8.90145 20.6012 8.87812C20.5896 8.67846 20.3568 8.5774 20.1837 8.6776L13.2982 12.6642Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M11.6187 13.0871C11.6187 12.9158 11.5274 12.7575 11.3792 12.6717L4.48747 8.68103C4.31451 8.58088 4.08152 8.68171 4.07022 8.88126C4.06896 8.90349 4.06827 8.92582 4.06827 8.94827V15.2458C4.06827 16.2433 4.60683 17.1793 5.47659 17.6871L10.9256 20.8254C11.0355 20.8892 11.1488 20.9452 11.2646 20.9931C11.4393 21.0653 11.6187 20.9274 11.6187 20.7385V13.0871Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M4.54688 8.84332V15.1388C4.54688 15.9729 4.99242 16.7444 5.71444 17.161L11.1665 20.3088C11.8894 20.7263 12.7795 20.7263 13.5025 20.3088L18.9546 17.161C19.6766 16.7444 20.1221 15.9729 20.1221 15.1388V8.84332C20.1221 8.00828 19.6766 7.23769 18.9546 6.82016L13.5025 3.67243C12.7795 3.25584 11.8894 3.25584 11.1665 3.67243L5.71444 6.82016C4.99242 7.23769 4.54688 8.00828 4.54688 8.84332Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M19.8002 7.64624L12.339 11.9625L4.87875 7.64624" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M12.3379 20.6398V11.9559" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M15.7678 5.32404L8.30664 9.64027V12.2705" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
