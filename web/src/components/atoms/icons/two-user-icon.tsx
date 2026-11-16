import type { SVGProps } from 'react';
  export interface TwoUserIconProps
  extends Omit<SVGProps<SVGSVGElement>, 'color' | 'fontSize'> {
  color?: string;
  fontSize?: number | string;
}

export function TwoUserIcon({
  color = 'currentColor',
  fontSize = 24,
  ...props
}: TwoUserIconProps) {
  return (
    <svg
      aria-hidden="true"
      color={color}
      fill="none"
      height={fontSize}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      width={fontSize}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M9.59 15.21C13.28 15.21 16.43 15.77 16.43 18C16.43 20.23 13.3 20.81 9.59 20.81C5.9 20.81 2.75 20.25 2.75 18.02C2.75 15.78 5.88 15.21 9.59 15.21Z" />
      <path d="M9.59 12.02C7.17 12.02 5.21 10.06 5.21 7.63C5.21 5.21 7.17 3.25 9.59 3.25C12.01 3.25 13.98 5.21 13.98 7.63C13.99 10.05 12.04 12.01 9.62 12.02H9.59Z" />
      <path d="M16.48 10.88C18.09 10.66 19.32 9.28 19.32 7.62C19.32 5.98 18.13 4.62 16.56 4.36" />
      <path d="M18.6 14.73C20.15 14.96 21.23 15.51 21.23 16.63C21.23 17.4 20.72 17.9 19.9 18.21" />
    </svg>
  );
}
