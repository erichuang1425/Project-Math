import { createContext, useContext } from "react";
import type { GlossaryTerm } from "../content/schema";

export const GlossaryContext = createContext<GlossaryTerm[]>([]);

export function useGlossary(): GlossaryTerm[] {
  return useContext(GlossaryContext);
}

export function useGlossaryTerm(termId: string): GlossaryTerm | undefined {
  const glossary = useGlossary();
  return glossary.find((entry) => entry.id === termId);
}
