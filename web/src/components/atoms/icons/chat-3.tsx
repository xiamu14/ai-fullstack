import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function Chat3Icon({
  size = 24,
  variant: _variant = "line",
  ...props
}: IconProps) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox={"0 0 24 24"}
      width={size}
      {...getIconProps(props)}
    >
      <path
        d="M8.01987 18.4322L9.07527 19.4876C9.50396 19.9163 10.1989 19.9163 10.6276 19.4876L11.6829 18.4322C11.9837 18.1314 12.3909 17.9633 12.8159 17.9633H13.6097C15.2247 17.9633 16.5341 16.6539 16.5341 15.0381V9.90307C16.5341 8.2882 15.2247 6.97875 13.6097 6.97875H6.094C4.47821 6.97875 3.16876 8.2882 3.16876 9.90307V15.0381C3.16876 16.6539 4.47821 17.9633 6.094 17.9633H6.88695C7.31191 17.9633 7.71912 18.1314 8.01987 18.4322Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.08374 6.979V6.23181C7.08374 4.61789 8.39131 3.31125 10.0117 3.31125H17.5276C19.1414 3.31125 20.449 4.61789 20.449 6.23181V11.3677C20.449 12.9882 19.1414 14.2949 17.5276 14.2949H16.7346C16.6673 14.2949 16.601 14.3024 16.5338 14.3089"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M11.9559 12.5963V12.6633M12.2275 12.6107C12.2275 12.7615 12.1051 12.8838 11.9543 12.8838C11.8035 12.8838 11.6813 12.7615 11.6813 12.6107C11.6813 12.4597 11.8035 12.3375 11.9543 12.3375C12.1051 12.3375 12.2275 12.4597 12.2275 12.6107Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
      <path
        d="M7.45785 12.5963V12.6633M7.7294 12.6107C7.7294 12.7615 7.60702 12.8838 7.45619 12.8838C7.30534 12.8838 7.18314 12.7615 7.18314 12.6107C7.18314 12.4597 7.30534 12.3375 7.45619 12.3375C7.60702 12.3375 7.7294 12.4597 7.7294 12.6107Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.44"
      />
    </svg>
  );
}
