import type { Course, Lesson } from "../content/schema";
import type { LearnerState } from "../storage/learnerState";
import {
  buildLessonSummaryExport,
  lessonSummaryExportFileName,
  renderLessonSummaryMarkdown
} from "./lessonSummaryExport";

export function buildLessonSummaryFile(
  course: Course,
  lesson: Lesson,
  learnerState: LearnerState | undefined
): { fileName: string; markdown: string } {
  const summary = buildLessonSummaryExport(course, lesson, learnerState);
  return {
    fileName: lessonSummaryExportFileName(summary),
    markdown: renderLessonSummaryMarkdown(summary)
  };
}

export function downloadTextFile(fileName: string, content: string) {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function triggerLessonSummaryDownload(
  course: Course,
  lesson: Lesson,
  learnerState: LearnerState | undefined
): void {
  const { fileName, markdown } = buildLessonSummaryFile(course, lesson, learnerState);
  downloadTextFile(fileName, markdown);
}
