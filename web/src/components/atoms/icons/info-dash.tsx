import type { IconProps } from './types.ts';

export function InfoDashIcon({
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
          <path d="M13.9845 20H10.0215C9.46848 20 9.02148 20.447 9.02148 21C9.02148 21.553 9.46848 22 10.0215 22H13.9845C14.5375 22 14.9845 21.553 14.9845 21C14.9845 20.447 14.5375 20 13.9845 20Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M13.9845 2H10.0215C9.46848 2 9.02148 2.447 9.02148 3C9.02148 3.553 9.46848 4 10.0215 4H13.9845C14.5375 4 14.9845 3.553 14.9845 3C14.9845 2.447 14.5375 2 13.9845 2Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M3 14.9806C3.553 14.9806 4 14.5336 4 13.9806V10.0186C4 9.46556 3.553 9.01855 3 9.01855C2.447 9.01855 2 9.46556 2 10.0186V13.9806C2 14.5336 2.447 14.9806 3 14.9806Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M6.958 2.02729C4.305 2.33729 2.419 4.22529 2.037 6.95729C1.961 7.50429 2.342 8.00929 2.889 8.08629C2.936 8.09229 2.982 8.09529 3.028 8.09529C3.52 8.09529 3.947 7.73429 4.018 7.23429C4.275 5.39229 5.432 4.21829 7.19 4.01329C7.738 3.95029 8.132 3.45329 8.067 2.90429C8.004 2.35629 7.525 1.96029 6.958 2.02729Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M7.19002 19.9873C5.43002 19.7813 4.27402 18.6103 4.01702 16.7753C3.94002 16.2283 3.43502 15.8433 2.88802 15.9243C2.34102 16.0003 1.96102 16.5063 2.03702 17.0523C2.41802 19.7773 4.30302 21.6633 6.95802 21.9733C6.99702 21.9783 7.03702 21.9803 7.07502 21.9803C7.57602 21.9803 8.00702 21.6053 8.06702 21.0963C8.13102 20.5483 7.73903 20.0513 7.19002 19.9873Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M21 9.01868C20.447 9.01868 20 9.46568 20 10.0187V13.9807C20 14.5337 20.447 14.9807 21 14.9807C21.553 14.9807 22 14.5337 22 13.9807V10.0187C22 9.46568 21.553 9.01868 21 9.01868Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M21.0674 15.9238C20.5164 15.8458 20.0154 16.2288 19.9394 16.7768C19.6834 18.6118 18.5314 19.7818 16.7784 19.9868C16.2294 20.0518 15.8374 20.5478 15.9014 21.0968C15.9614 21.6058 16.3924 21.9808 16.8934 21.9808C16.9314 21.9808 16.9714 21.9788 17.0104 21.9738C19.6594 21.6638 21.5404 19.7778 21.9204 17.0518C21.9964 16.5048 21.6154 15.9998 21.0674 15.9238Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M16.7784 4.01378C18.5304 4.21778 19.6824 5.39178 19.9394 7.23378C20.0084 7.73478 20.4374 8.09578 20.9284 8.09578C20.9744 8.09578 21.0204 8.09278 21.0674 8.08578C21.6154 8.00978 21.9964 7.50478 21.9204 6.95778C21.5394 4.22578 19.6574 2.33578 17.0104 2.02778C16.4494 1.96078 15.9664 2.35678 15.9014 2.90478C15.8374 3.45278 16.2304 3.95078 16.7784 4.01378Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M11 15.7012C11 16.2542 11.447 16.7012 12 16.7012C12.553 16.7012 13 16.2542 13 15.7012V11.3922C13 10.8402 12.553 10.3922 12 10.3922C11.447 10.3922 11 10.8402 11 11.3922V15.7012Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
          <path d="M12 9.32317C12.553 9.32317 13 8.85217 13 8.30017C13 7.74717 12.553 7.30017 12 7.30017C11.447 7.30017 11 7.74717 11 8.30017V8.34717C11 8.90017 11.447 9.32317 12 9.32317Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
        </>
      ) : (
        <>
          <path d="M13.9825 21H10.0195M13.9825 3H10.0195" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M3 13.9805V10.0176" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M3.02734 7.09531C3.33967 4.86234 4.82151 3.28321 7.07394 3.01953" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M3.02734 16.9141C3.33967 19.147 4.82151 20.7164 7.07394 20.9801" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M20.998 13.9805V10.0176" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M16.8926 20.9811C19.145 20.7174 20.6171 19.148 20.9294 16.915" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M16.8926 3.01953C19.145 3.28321 20.6171 4.86234 20.9294 7.09531" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
          <path d="M12 15.701V11.3917M12 8.3465V8.29883" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
        </>
      )}
    </svg>
  );
}
