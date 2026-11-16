import type { IconProps } from './types.ts';

export function FolderFileEditIcon({
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
      <path d="M15.2309 20.6279C18.4524 20.6279 20.3505 18.729 20.3505 15.5084L20.3756 11.0389C20.3756 7.75303 19.1837 6.10963 15.9546 6.10963H13.4075C12.7611 6.10776 12.153 5.8037 11.764 5.28792L10.9424 4.19481C10.5543 3.6781 9.94627 3.37311 9.2999 3.37311H7.4998C4.27828 3.37311 3.09563 5.27114 3.09563 8.488V15.5084C3.09563 18.729 4.99739 20.6279 8.22637 20.6279H15.2309Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.4196 16.2091L9.72 16.3257C9.20797 16.4115 8.75562 15.9853 8.81158 15.4695L8.88899 14.7476C8.92724 14.3988 9.07273 14.0714 9.30684 13.8093L12.3549 10.4815C12.7159 10.0925 13.323 10.0692 13.7128 10.4293L14.3555 11.0252C14.7454 11.3852 14.7686 11.9924 14.4078 12.3823L11.3933 15.6728C11.1387 15.9564 10.7954 16.1466 10.4196 16.2091Z" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}
