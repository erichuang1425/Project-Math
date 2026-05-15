import { describe, expect, it } from "vitest";
import courseJson from "../fixtures/courses/calculus-i.course.json";
import { validateContent } from "../validateContent";
import { eachLesson, totalLessons } from "../courseHelpers";

describe("calculus-i course fixture", () => {
  it("passes content validation", () => {
    const result = validateContent(courseJson);
    if (!result.ok) {
      const summary = result.errors
        .map((error) => `${error.path}: ${error.message}`)
        .join("\n");
      throw new Error(`calculus-i.course.json is invalid:\n${summary}`);
    }
    expect(result.course.id).toBe("calculus-i");
  });

  it("contains the three migrated derivatives lessons", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    const lessons = eachLesson(result.course).map((entry) => entry.lesson.id);
    expect(lessons).toEqual([
      "derivative-as-a-limit",
      "derivative-at-a-point",
      "constant-function-derivative"
    ]);
  });

  it("reports the correct lesson count via totalLessons", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    expect(totalLessons(result.course)).toBe(3);
  });

  it("ships a non-empty glossary", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Fixture failed to validate.");
    expect(result.course.glossary.length).toBeGreaterThanOrEqual(5);
    expect(result.course.glossary.map((term) => term.id)).toContain("derivative");
  });
});
