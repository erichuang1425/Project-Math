import { describe, expect, it } from "vitest";
import courseJson from "../fixtures/courses/calculus-i.course.json";
import { validateContent } from "../validateContent";
import { eachLesson, totalLessons } from "../courseHelpers";

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
