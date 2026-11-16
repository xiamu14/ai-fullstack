import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function SeenCheckmarkIcon({
  size = 24,
  variant = "line",
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
      {variant === "fill" ? (
        <>
          <path
            clipRule="evenodd"
            d="M20.707 7.48661C20.316 7.09561 19.684 7.09561 19.293 7.48661L12.195 14.5846L8.99901 11.3896C8.60801 10.9996 7.97601 10.9996 7.58501 11.3896C7.19401 11.7806 7.19401 12.4136 7.58501 12.8036L8.44001 13.6586L7.51201 14.5866L4.70701 11.7816C4.31601 11.3906 3.68401 11.3906 3.29301 11.7816C2.90201 12.1726 2.90201 12.8046 3.29301 13.1956L6.47101 16.3736C6.74901 16.6536 7.11901 16.8076 7.51201 16.8076C7.90601 16.8076 8.27501 16.6536 8.55001 16.3766L9.85401 15.0726L11.157 16.3756C11.435 16.6526 11.804 16.8046 12.195 16.8046C12.588 16.8046 12.957 16.6516 13.233 16.3746L20.707 8.90061C21.098 8.50961 21.098 7.87761 20.707 7.48661Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M12.1956 12.3178C12.4516 12.3178 12.7076 12.2198 12.9026 12.0248L16.0246 8.90281C16.4156 8.51181 16.4156 7.87981 16.0246 7.48881C15.6336 7.09781 15.0016 7.09781 14.6106 7.48881L11.4886 10.6108C11.0976 11.0018 11.0976 11.6338 11.4886 12.0248C11.6836 12.2198 11.9396 12.3178 12.1956 12.3178Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M8.29102 12.0966L11.862 15.6677C12.0454 15.851 12.342 15.851 12.5245 15.6677L19.9987 8.19434"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M15.3175 8.19434L12.1953 11.3165"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M4 12.4873L7.18099 15.6683C7.36434 15.8516 7.66013 15.8516 7.84348 15.6683L9.85344 13.6583"
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
