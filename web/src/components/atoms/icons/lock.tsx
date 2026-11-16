import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function LockIcon({ size = 24, variant = "line", ...props }: IconProps) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox={"0 0 24 24"}
      width={size}
      {...getIconProps(props)}
    >
      {variant === "fill" ? (
        <>
          <path
            d="M11.9848 2C15.0535 2 17.5227 4.41479 17.5227 7.39601V8.92935C19.2451 9.46696 20.5 11.0261 20.5 12.8884V17.8253C20.5 20.1308 18.5886 22 16.2322 22H7.7688C5.41136 22 3.5 20.1308 3.5 17.8253V12.8884C3.5 11.0261 4.75595 9.46696 6.47729 8.92935V7.39601C6.48745 4.41479 8.95667 2 11.9848 2ZM11.9949 13.3843C11.5072 13.3843 11.1109 13.7718 11.1109 14.2488V16.4549C11.1109 16.9419 11.5072 17.3294 11.9949 17.3294C12.4928 17.3294 12.8891 16.9419 12.8891 16.4549V14.2488C12.8891 13.7718 12.4928 13.3843 11.9949 13.3843ZM12.0051 3.73904C9.94232 3.73904 8.26569 5.36878 8.25553 7.37613V8.7137H15.7445V7.39601C15.7445 5.37871 14.0678 3.73904 12.0051 3.73904Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M16.424 9.44781V7.30081C16.424 4.78781 14.386 2.74977 11.873 2.74977C9.35998 2.73881 7.31398 4.76681 7.30298 7.28081V7.30081V9.44781"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M15.6832 21.2496H8.04224C5.94824 21.2496 4.25024 19.5526 4.25024 17.4576V13.1686C4.25024 11.0736 5.94824 9.37662 8.04224 9.37662H15.6832C17.7772 9.37662 19.4752 11.0736 19.4752 13.1686V17.4576C19.4752 19.5526 17.7772 21.2496 15.6832 21.2496Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M11.8635 14.2027V16.4237"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}
