import type { IconProps } from './types.ts';

export function FolderFile1Icon({
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
      <path d="M15.2309 20.6279C18.4524 20.6279 20.3505 18.729 20.3505 15.5084L20.3756 11.039C20.3756 7.75306 19.1837 6.10966 15.9546 6.10966H13.4075C12.7611 6.10779 12.153 5.80373 11.764 5.28795L10.9424 4.19484C10.5543 3.67813 9.94627 3.37314 9.2999 3.37314H7.4998C4.27828 3.37314 3.09563 5.27117 3.09563 8.48803V15.5084C3.09563 18.729 4.99739 20.6279 8.22637 20.6279H15.2309Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.3039 15.5719H11.5181" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
