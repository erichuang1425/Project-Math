import katex from "katex";

export type LatexRenderResult =
  | { ok: true; html: string }
  | { ok: false; message: string };

export function renderLatexToHtml(
  latex: string,
  displayMode: boolean
): LatexRenderResult {
  try {
    return {
      ok: true,
      html: katex.renderToString(latex, {
        displayMode,
        strict: "warn",
        throwOnError: true
      })
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Invalid LaTeX"
    };
  }
}

export function isLatexRenderable(
  latex: string,
  displayMode = false
): boolean {
  return renderLatexToHtml(latex, displayMode).ok;
}
