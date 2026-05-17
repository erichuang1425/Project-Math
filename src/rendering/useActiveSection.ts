import { useEffect, useState } from "react";

export type UseActiveSectionOptions = {
  sectionIds: readonly string[];
  initialSectionId?: string;
  rootMargin?: string;
};

/**
 * Tracks which section heading is "active" (the one the reader is reading) by
 * observing the section elements with IntersectionObserver.
 *
 * The first section is active by default. If `initialSectionId` points to a
 * section other than the first one, that element is scrolled into view and
 * marked active on mount so deep-links resume mid-lesson.
 *
 * Returns `null` only when `sectionIds` is empty.
 */
export function useActiveSection({
  sectionIds,
  initialSectionId,
  rootMargin = "0px 0px -70% 0px"
}: UseActiveSectionOptions): string | null {
  const firstSectionId = sectionIds[0] ?? null;
  const [activeSectionId, setActiveSectionId] = useState<string | null>(firstSectionId);

  // Reset to the first section whenever the section list changes (e.g. lesson change).
  useEffect(() => {
    setActiveSectionId(firstSectionId);
  }, [firstSectionId]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    if (sectionIds.length === 0) return;

    const sectionEls = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sectionEls.length === 0) return;

    if (initialSectionId && initialSectionId !== firstSectionId) {
      const target = sectionEls.find((el) => el.id === initialSectionId);
      if (target) {
        target.scrollIntoView({ block: "start" });
        setActiveSectionId(initialSectionId);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSectionId(visible[0].target.id);
      },
      { rootMargin, threshold: 0 }
    );
    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds, initialSectionId, firstSectionId, rootMargin]);

  return activeSectionId;
}
