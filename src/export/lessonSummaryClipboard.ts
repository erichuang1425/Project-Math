export type LessonSummaryCopyStatus = "idle" | "copying" | "copied" | "failed";

export type ClipboardWriter = (text: string) => Promise<void>;

export type LessonSummaryCopyResult = {
  status: Extract<LessonSummaryCopyStatus, "copied" | "failed">;
};

export async function copyLessonSummaryMarkdown(
  markdown: string,
  writeText?: ClipboardWriter
): Promise<LessonSummaryCopyResult> {
  try {
    const clipboardWriter = writeText ?? getBrowserClipboardWriter();
    await clipboardWriter(markdown);
    return { status: "copied" };
  } catch {
    return { status: "failed" };
  }
}

export function getLessonSummaryCopyStatusMessage(status: LessonSummaryCopyStatus): string {
  switch (status) {
    case "idle":
      return "";
    case "copying":
      return "Copying summary markdown...";
    case "copied":
      return "Summary markdown copied to clipboard.";
    case "failed":
      return "Unable to copy summary markdown. Download summary is still available.";
  }
}

function getBrowserClipboardWriter(): ClipboardWriter {
  const clipboard = globalThis.navigator?.clipboard;

  if (!clipboard || typeof clipboard.writeText !== "function") {
    throw new Error("Clipboard writing is not available.");
  }

  return (text) => clipboard.writeText(text);
}
