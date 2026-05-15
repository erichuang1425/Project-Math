import type { ReactElement } from "react";
import { TangentCurveIllustration } from "./TangentCurveIllustration";
import { LimitIllustration } from "./LimitIllustration";
import { RulesIllustration } from "./RulesIllustration";

const registry: Record<string, () => ReactElement> = {
  "tangent-curve": TangentCurveIllustration,
  limits: LimitIllustration,
  rules: RulesIllustration
};

export function getIllustration(id: string | undefined): ReactElement | null {
  if (!id) return null;
  const factory = registry[id];
  return factory ? factory() : null;
}

export const illustrationIds = Object.keys(registry);
