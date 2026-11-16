import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function FilterIcon({
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
            d="M18.5611 14.0196C20.4611 14.0196 22 15.5325 22 17.3992C22 19.2648 20.4611 20.7778 18.5611 20.7778C16.6623 20.7778 15.1223 19.2648 15.1223 17.3992C15.1223 15.5325 16.6623 14.0196 18.5611 14.0196ZM10.0833 15.958C10.9155 15.958 11.5911 16.6217 11.5911 17.4393C11.5911 18.2558 10.9155 18.9206 10.0833 18.9206H3.50777C2.67555 18.9206 2 18.2558 2 17.4393C2 16.6217 2.67555 15.958 3.50777 15.958H10.0833ZM5.43887 3C7.33886 3 8.87774 4.51298 8.87774 6.37856C8.87774 8.24523 7.33886 9.75821 5.43887 9.75821C3.53999 9.75821 2 8.24523 2 6.37856C2 4.51298 3.53999 3 5.43887 3ZM20.4933 4.89833C21.3244 4.89833 22 5.56203 22 6.37856C22 7.19618 21.3244 7.85989 20.4933 7.85989H13.9178C13.0856 7.85989 12.4101 7.19618 12.4101 6.37856C12.4101 5.56203 13.0856 4.89833 13.9178 4.89833H20.4933Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M10.3301 16.5929H4.02942"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M13.1405 6.90039H19.4412"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M8.72629 6.84625C8.72629 5.5506 7.66813 4.5 6.36314 4.5C5.05816 4.5 4 5.5506 4 6.84625C4 8.14191 5.05816 9.19251 6.36314 9.19251C7.66813 9.19251 8.72629 8.14191 8.72629 6.84625Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M19.9997 16.5538C19.9997 15.2581 18.9424 14.2075 17.6374 14.2075C16.3316 14.2075 15.2734 15.2581 15.2734 16.5538C15.2734 17.8494 16.3316 18.9 17.6374 18.9C18.9424 18.9 19.9997 17.8494 19.9997 16.5538Z"
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
