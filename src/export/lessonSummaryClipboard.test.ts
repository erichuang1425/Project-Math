import { describe, expect, it, vi } from "vitest";
import {
  copyLessonSummaryMarkdown,
  getLessonSummaryCopyStatusMessage
} from "./lessonSummaryClipboard";

describe("lesson summary clipboard", () => {
  it("copies the provided markdown through the clipboard writer", async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue();
    const markdown = "# Derivative as a Limit\n\nProgress: Completed\n";

    const result = await copyLessonSummaryMarkdown(markdown, writeText);

    expect(writeText).toHaveBeenCalledWith(markdown);
    expect(result).toEqual({ status: "copied" });
  });

  it("returns a failed state when clipboard writing is unavailable", async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockRejectedValue(new Error("Permission denied"));

    const result = await copyLessonSummaryMarkdown("# Lesson\n", writeText);

    expect(result).toEqual({ status: "failed" });
  });

  it("describes copy states without interrupting the learner", () => {
    expect(getLessonSummaryCopyStatusMessage("idle")).toBe("");
    expect(getLessonSummaryCopyStatusMessage("copying")).toBe(
      "Copying summary markdown..."
    );
    expect(getLessonSummaryCopyStatusMessage("copied")).toBe(
      "Summary markdown copied to clipboard."
    );
    expect(getLessonSummaryCopyStatusMessage("failed")).toBe(
      "Unable to copy summary markdown. Download summary is still available."
    );
  });
});
