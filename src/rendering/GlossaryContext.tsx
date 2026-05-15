import { createContext, useContext } from "react";
import type { GlossaryEntry } from "../studybook/schema";

type GlossaryContextValue = {
  entries: GlossaryEntry[];
  openEntry: (termId: string) => void;
};

export const GlossaryContext = createContext<GlossaryContextValue | null>(null);

export function useGlossary(): GlossaryContextValue | null {
  return useContext(GlossaryContext);
}
