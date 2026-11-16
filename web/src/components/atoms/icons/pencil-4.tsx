import type { IconProps } from './types.ts';

export function Pencil4Icon({
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
          <path d="M9.83429 7.55171C9.70602 7.4573 9.52776 7.48658 9.43358 7.61502L5.48581 12.9983C4.39141 14.4863 4.03621 16.3775 4.49701 18.1535C4.67941 18.8351 5.31301 19.3055 6.01381 19.2671C7.85701 19.1903 9.55621 18.2783 10.641 16.7903L14.5981 11.416C14.6925 11.2879 14.6673 11.1092 14.5391 11.0148C13.5731 10.3041 10.6738 8.16973 9.83429 7.55171Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M15.3909 9.85165C15.5194 9.94602 15.6996 9.91779 15.7937 9.78906L16.3241 9.06244C17.3705 7.64164 17.0633 5.63524 15.6425 4.58884C14.2121 3.54244 12.2057 3.84964 11.1593 5.27044L10.6279 5.99844C10.5343 6.12667 10.5598 6.30481 10.6878 6.39875C11.5059 6.99926 14.2913 9.04379 15.3909 9.85165Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M18.9799 18.6091H13.0413C12.6439 18.6091 12.3213 18.9317 12.3213 19.3291C12.3213 19.7266 12.6439 20.0491 13.0413 20.0491H18.9799C19.3773 20.0491 19.6999 19.7266 19.6999 19.3291C19.6999 18.9317 19.3773 18.6091 18.9799 18.6091Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M4.56381 18.7786C4.75077 19.4898 5.40992 19.9736 6.14425 19.9399C8.05715 19.8512 9.8284 18.903 10.9626 17.3601L16.8777 9.31049C17.9686 7.82642 17.6496 5.73909 16.1656 4.64724C14.6815 3.55732 12.5932 3.8763 11.5023 5.36036L5.58724 13.41C4.45299 14.9528 4.07716 16.9264 4.56381 18.7786Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M13.4609 20H19.6468" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M10.3418 6.9707L15.7172 10.9208" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
