import { describe, expect, it } from "vitest";
import courseJson from "../fixtures/courses/calculus-i.course.json";
import { validateContent } from "../validateContent";
import { eachLesson, totalLessons } from "../courseHelpers";
import type { Block, Lesson, RichTextSegment } from "../schema";

function countTermSegments(lesson: Lesson): number {
  let count = 0;
  const visitRich = (segments: RichTextSegment[] | undefined) => {
    if (!segments) return;
    for (const seg of segments) if (seg.kind === "term") count++;
  };
  const visitRows = (rows: RichTextSegment[][] | undefined) => {
    if (!rows) return;
    for (const row of rows) visitRich(row);
  };
  const visitBlock = (block: Block) => {
    switch (block.type) {
      case "title":
        visitRows(block.objectives);
        break;
      case "concept":
        visitRich(block.body);
        visitRows(block.keyIdeas);
        break;
      case "intuition":
        visitRich(block.body);
        visitRich(block.takeaway);
        break;
      case "summary":
        visitRows(block.items);
        break;
      case "quiz":
        for (const q of block.questions) {
          visitRich(q.prompt);
          if (q.kind === "multipleChoice") {
            for (const opt of q.options) visitRich(opt.text);
          }
        }
        break;
      default:
        break;
    }
  };
  for (const section of lesson.sections) {
    for (const block of section.blocks) visitBlock(block);
  }
  return count;
}

describe("calculus-i course fixture", () => {
  it("passes content validation", () => {
    const result = validateContent(courseJson);
    if (!result.ok) {
      const summary = result.errors.map((error) => `${error.path}: ${error.message}`).join("\n");
      throw new Error(`calculus-i.course.json is invalid:\n${summary}`);
    }
    expect(result.course.id).toBe("calculus-i");
  });

  it("orders foundations before the first-principles lessons", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const lessons = eachLesson(result.course).map((entry) => entry.lesson.id);
    expect(lessons).toEqual([
      "functions-refresher",
      "derivative-as-a-limit",
      "derivative-at-a-point",
      "constant-function-derivative"
    ]);
  });

  it("reports the correct lesson count via totalLessons", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    expect(totalLessons(result.course)).toBe(4);
  });

  it("wires derivative-as-a-limit to require functions-refresher", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const derivative = eachLesson(result.course).find(
      (entry) => entry.lesson.id === "derivative-as-a-limit"
    );
    expect(derivative?.lesson.prerequisiteLessonIds).toEqual(["functions-refresher"]);
  });

  it("authors term segments in every lesson, including the first-principles trio", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const counts = new Map<string, number>();
    for (const { lesson } of eachLesson(result.course)) {
      counts.set(lesson.id, countTermSegments(lesson));
    }
    for (const [lessonId, count] of counts) {
      expect(count, `lesson ${lessonId} should author at least one term segment`).toBeGreaterThan(
        0
      );
    }
    expect(counts.get("derivative-as-a-limit")).toBeGreaterThanOrEqual(5);
    expect(counts.get("derivative-at-a-point")).toBeGreaterThanOrEqual(4);
    expect(counts.get("constant-function-derivative")).toBeGreaterThanOrEqual(3);
  });

  it("ships a non-empty glossary covering the new functions terms", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    expect(result.course.glossary.length).toBeGreaterThanOrEqual(5);
    const ids = result.course.glossary.map((term) => term.id);
    expect(ids).toContain("derivative");
    expect(ids).toEqual(
      expect.arrayContaining([
        "function",
        "domain",
        "range",
        "input",
        "output",
        "function-notation"
      ])
    );
  });
});
