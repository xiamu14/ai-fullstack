import { getIconProps } from "./accessibility.ts";
import type { IconProps } from "./types.ts";

export function QuestionMarkDashIcon({
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
            d="M13.9806 22H10.0176C9.46558 22 9.01758 21.553 9.01758 21C9.01758 20.447 9.46558 20 10.0176 20H13.9806C14.5326 20 14.9806 20.447 14.9806 21C14.9806 21.553 14.5326 22 13.9806 22Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M13.9805 4H10.0175C9.46552 4 9.01752 3.553 9.01752 3C9.01752 2.447 9.46552 2 10.0175 2H13.9805C14.5325 2 14.9805 2.447 14.9805 3C14.9805 3.553 14.5325 4 13.9805 4Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M3 14.9814C2.448 14.9814 2 14.5344 2 13.9814V10.0204C2 9.46739 2.448 9.02039 3 9.02039C3.552 9.02039 4 9.46739 4 10.0204V13.9814C4 14.5344 3.552 14.9814 3 14.9814Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M21 14.9814C20.448 14.9814 20 14.5344 20 13.9814V10.0204C20 9.46739 20.448 9.02039 21 9.02039C21.552 9.02039 22 9.46739 22 10.0204V13.9814C22 14.5344 21.552 14.9814 21 14.9814Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M11.7364 17.5811C11.1844 17.5811 10.7364 17.1341 10.7364 16.5811C10.7364 16.0281 11.1844 15.5591 11.7364 15.5591C12.2884 15.5591 12.7364 15.9841 12.7364 16.5371V16.5811C12.7364 17.1341 12.2884 17.5811 11.7364 17.5811Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M11.7341 14.8945C11.1881 14.8945 10.7421 14.4555 10.7341 13.9075C10.7151 12.4195 11.9031 11.7565 12.6121 11.3605L12.7581 11.2795C13.5871 10.8215 13.5871 10.2345 13.5871 10.0405C13.5871 9.16549 12.8751 8.45349 12.0001 8.45349C11.1091 8.45349 10.4121 9.15049 10.4121 10.0405C10.4121 10.5935 9.96411 11.0405 9.41211 11.0405C8.85911 11.0405 8.41211 10.5935 8.41211 10.0405C8.41211 8.06249 10.0221 6.45349 12.0001 6.45349C13.9781 6.45349 15.5871 8.06249 15.5871 10.0405C15.5871 11.3055 14.9291 12.3645 13.7351 13.0235L13.5881 13.1065C12.9551 13.4595 12.7311 13.6295 12.7341 13.8815C12.7421 14.4335 12.3001 14.8865 11.7481 14.8945H11.7341Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M7.076 21.9805C7.037 21.9805 6.998 21.9785 6.959 21.9735C4.305 21.6645 2.419 19.7785 2.037 17.0525C1.961 16.5055 2.342 16.0005 2.889 15.9235C3.428 15.8405 3.941 16.2285 4.018 16.7755C4.275 18.6115 5.431 19.7825 7.19 19.9875C7.739 20.0505 8.132 20.5475 8.068 21.0965C8.009 21.6055 7.576 21.9805 7.076 21.9805Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M16.8895 21.9805C16.3895 21.9805 15.9575 21.6055 15.8975 21.0965C15.8335 20.5475 16.2255 20.0515 16.7745 19.9875C18.5285 19.7825 19.6815 18.6115 19.9375 16.7755C20.0145 16.2285 20.5195 15.8405 21.0665 15.9235C21.6135 16.0005 21.9945 16.5055 21.9185 17.0525C21.5365 19.7785 19.6555 21.6645 17.0075 21.9735C16.9675 21.9785 16.9285 21.9805 16.8895 21.9805Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M3.02894 8.09574C2.98294 8.09574 2.93594 8.09274 2.88894 8.08574C2.34194 8.00974 1.96094 7.50374 2.03694 6.95674C2.41894 4.22574 4.30494 2.33674 6.95894 2.02774C7.49994 1.95974 8.00394 2.35574 8.06794 2.90474C8.13194 3.45274 7.73894 3.94974 7.18994 4.01374C5.43194 4.21874 4.27594 5.39274 4.01794 7.23474C3.94794 7.73474 3.51994 8.09574 3.02894 8.09574Z"
            fill="currentColor"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M20.9263 8.09573C20.4353 8.09573 20.0073 7.73473 19.9373 7.23473C19.6793 5.39173 18.5273 4.21773 16.7753 4.01373C16.2263 3.94973 15.8333 3.45273 15.8973 2.90473C15.9613 2.35573 16.4643 1.96173 17.0063 2.02773C19.6543 2.33573 21.5353 4.22473 21.9183 6.95673C21.9943 7.50373 21.6133 8.00973 21.0663 8.08573C21.0193 8.09273 20.9723 8.09573 20.9263 8.09573Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </>
      ) : (
        <>
          <path
            d="M13.9805 21H10.0176"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M13.9805 3H10.0176"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M3 13.9815V10.0195"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M21 13.9815V10.0195"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M11.7363 16.5371V16.5809"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M11.7346 13.8952C11.7219 12.93 12.5996 12.5204 13.2524 12.1487C14.0483 11.7099 14.5874 11.0113 14.5874 10.0422C14.5874 8.6061 13.4266 7.4541 12.0002 7.4541C10.5641 7.4541 9.41211 8.6061 9.41211 10.0422"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M3.02734 16.9141C3.33967 19.147 4.82151 20.7174 7.07394 20.9801"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M16.8906 20.9801C19.1431 20.7164 20.6152 19.147 20.9275 16.9141"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M3.02734 7.09532C3.33967 4.86234 4.82151 3.28321 7.07394 3.01953"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M16.8906 3.01953C19.1431 3.28321 20.6152 4.86234 20.9275 7.09532"
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
