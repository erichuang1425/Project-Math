import type { LucideIcon, LucideProps } from "lucide-react";

export interface IconProps extends LucideProps {
  source: LucideIcon;
}

export function Icon({
  source: Source,
  size = 18,
  strokeWidth = 2,
  "aria-hidden": ariaHidden = true,
  ...rest
}: IconProps) {
  return <Source size={size} strokeWidth={strokeWidth} aria-hidden={ariaHidden} {...rest} />;
}
