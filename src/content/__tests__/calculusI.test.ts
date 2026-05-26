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
      "limits-intuitively",
      "one-sided-and-infinite-limits",
      "derivative-as-a-limit",
      "derivative-at-a-point",
      "constant-function-derivative",
      "differentiability-vs-continuity",
      "power-rule",
      "sum-difference-rule",
      "product-rule",
      "quotient-rule"
    ]);
  });

  it("reports the correct lesson count via totalLessons", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    expect(totalLessons(result.course)).toBe(11);
  });

  it("wires derivative-as-a-limit to require functions-refresher and limits-intuitively", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const derivative = eachLesson(result.course).find(
      (entry) => entry.lesson.id === "derivative-as-a-limit"
    );
    expect(derivative?.lesson.prerequisiteLessonIds).toEqual([
      "functions-refresher",
      "limits-intuitively"
    ]);
  });

  it("wires limits-intuitively to require functions-refresher", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const limits = eachLesson(result.course).find(
      (entry) => entry.lesson.id === "limits-intuitively"
    );
    expect(limits?.lesson.prerequisiteLessonIds).toEqual(["functions-refresher"]);
  });

  it("wires one-sided-and-infinite-limits to build on functions-refresher and limits-intuitively", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const lesson = eachLesson(result.course).find(
      (entry) => entry.lesson.id === "one-sided-and-infinite-limits"
    );
    expect(lesson?.lesson.prerequisiteLessonIds).toEqual([
      "functions-refresher",
      "limits-intuitively"
    ]);
  });

  it("wires differentiability-vs-continuity to require one-sided limits and the difference quotient", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const lesson = eachLesson(result.course).find(
      (entry) => entry.lesson.id === "differentiability-vs-continuity"
    );
    expect(lesson?.lesson.prerequisiteLessonIds).toEqual([
      "one-sided-and-infinite-limits",
      "derivative-as-a-limit"
    ]);
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
    expect(counts.get("limits-intuitively")).toBeGreaterThanOrEqual(5);
    expect(counts.get("one-sided-and-infinite-limits")).toBeGreaterThanOrEqual(5);
    expect(counts.get("derivative-as-a-limit")).toBeGreaterThanOrEqual(5);
    expect(counts.get("derivative-at-a-point")).toBeGreaterThanOrEqual(4);
    expect(counts.get("constant-function-derivative")).toBeGreaterThanOrEqual(3);
    expect(counts.get("differentiability-vs-continuity")).toBeGreaterThanOrEqual(5);
    expect(counts.get("power-rule")).toBeGreaterThanOrEqual(5);
    expect(counts.get("sum-difference-rule")).toBeGreaterThanOrEqual(5);
    expect(counts.get("product-rule")).toBeGreaterThanOrEqual(5);
    expect(counts.get("quotient-rule")).toBeGreaterThanOrEqual(5);
  });

  it("wires power-rule to require derivative-as-a-limit", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const lesson = eachLesson(result.course).find((entry) => entry.lesson.id === "power-rule");
    expect(lesson?.lesson.prerequisiteLessonIds).toEqual(["derivative-as-a-limit"]);
  });

  it("places power-rule inside the differentiation-rules module", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const mod = result.course.modules.find((m) => m.id === "differentiation-rules");
    expect(mod).toBeDefined();
    expect(mod!.lessons.map((l) => l.id)).toContain("power-rule");
    expect(mod!.lessons.map((l) => l.id)).toContain("sum-difference-rule");
  });

  it("places the differentiation-rules module after first-principles", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const moduleIds = result.course.modules.map((m) => m.id);
    expect(moduleIds).toEqual(["foundations", "first-principles", "differentiation-rules"]);
  });

  it("wires sum-difference-rule to require power-rule", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const lesson = eachLesson(result.course).find(
      (entry) => entry.lesson.id === "sum-difference-rule"
    );
    expect(lesson?.lesson.prerequisiteLessonIds).toEqual(["power-rule"]);
  });

  it("wires product-rule to require sum-difference-rule", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const lesson = eachLesson(result.course).find((entry) => entry.lesson.id === "product-rule");
    expect(lesson?.lesson.prerequisiteLessonIds).toEqual(["sum-difference-rule"]);
  });

  it("places product-rule inside the differentiation-rules module", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const mod = result.course.modules.find((m) => m.id === "differentiation-rules");
    expect(mod).toBeDefined();
    expect(mod!.lessons.map((l) => l.id)).toContain("product-rule");
  });

  it("wires quotient-rule to require product-rule", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const lesson = eachLesson(result.course).find((entry) => entry.lesson.id === "quotient-rule");
    expect(lesson?.lesson.prerequisiteLessonIds).toEqual(["product-rule"]);
  });

  it("places quotient-rule inside the differentiation-rules module", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const mod = result.course.modules.find((m) => m.id === "differentiation-rules");
    expect(mod).toBeDefined();
    expect(mod!.lessons.map((l) => l.id)).toContain("quotient-rule");
  });

  it("ships glossary terms for the differentiation-rules module", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const ids = result.course.glossary.map((term) => term.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "power-rule",
        "exponent",
        "polynomial",
        "sum-rule",
        "constant-multiple-rule",
        "product-rule",
        "quotient-rule"
      ])
    );
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

  it("ships glossary terms for one-sided and infinite limit vocabulary", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const ids = result.course.glossary.map((term) => term.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "one-sided-limit",
        "infinite-limit",
        "vertical-asymptote",
        "jump-discontinuity"
      ])
    );
  });
});
