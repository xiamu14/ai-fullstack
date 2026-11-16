import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function PaperBagIcon({
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
            d="M19.621 3.32031H4.379C3.343 3.32031 2.5 4.18731 2.5 5.25431V7.08131C2.5 8.14731 3.343 9.01431 4.379 9.01431H19.621C20.657 9.01431 21.5 8.14731 21.5 7.08131V5.25431C21.5 4.18731 20.657 3.32031 19.621 3.32031Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M14.6404 14.87H9.3604C8.9504 14.87 8.6104 14.53 8.6104 14.12C8.6104 13.71 8.9504 13.37 9.3604 13.37H14.6404C15.0504 13.37 15.3904 13.71 15.3904 14.12C15.3904 14.53 15.0504 14.87 14.6404 14.87ZM19.7204 10.5H4.2804C4.0004 10.5 3.7804 10.73 3.7804 11V15.87C3.7804 18.75 5.63039 20.68 8.38039 20.68H15.6204C18.3704 20.68 20.2204 18.75 20.2204 15.87V11C20.2204 10.73 20.0004 10.5 19.7204 10.5Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M4.3787 3.82031H19.6203C20.3822 3.82031 21 4.46247 21 5.25447V7.08075C21 7.87275 20.3822 8.51491 19.6203 8.51491H4.3787C3.61686 8.51491 3 7.87275 3 7.08075V5.25447C3 4.46247 3.61686 3.82031 4.3787 3.82031Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M9.36133 12.9102H14.6387"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M4.27734 8.51562V15.8684C4.27734 18.3962 5.85064 20.1816 8.38134 20.1816H15.6183C18.148 20.1816 19.7233 18.3962 19.7233 15.8684V8.51562"
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
