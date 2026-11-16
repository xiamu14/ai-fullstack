import type { SVGProps } from "react";

export function getIconProps(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  const named = Boolean(props["aria-label"] || props["aria-labelledby"]);
  return {
    ...props,
    "aria-hidden": props["aria-hidden"] ?? (named ? undefined : true),
    role: props.role ?? (named ? "img" : undefined),
  };
}
