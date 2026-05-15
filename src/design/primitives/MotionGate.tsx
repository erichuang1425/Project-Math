import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface MotionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMotionAllowed(): boolean {
  const [allowed, setAllowed] = useState(() => !prefersReducedMotion());
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return allowed;
}

export function MotionGate({ children, fallback = null }: MotionGateProps) {
  const allowed = useMotionAllowed();
  return <>{allowed ? children : fallback}</>;
}
