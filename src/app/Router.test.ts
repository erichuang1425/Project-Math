import { describe, expect, it } from "vitest";
import { routeFromHash, routeToHash } from "./Router";

describe("Router", () => {
  it("decodes empty hash as home", () => {
    expect(routeFromHash("")).toEqual({ kind: "home" });
    expect(routeFromHash("#")).toEqual({ kind: "home" });
    expect(routeFromHash("#/")).toEqual({ kind: "home" });
  });

  it("decodes course route", () => {
    expect(routeFromHash("#/course/calculus-i")).toEqual({
      kind: "course",
      courseId: "calculus-i"
    });
  });

  it("decodes lesson route", () => {
    expect(routeFromHash("#/course/calculus-i/lesson/derivative-as-a-limit")).toEqual({
      kind: "lesson",
      courseId: "calculus-i",
      lessonId: "derivative-as-a-limit"
    });
  });

  it("falls back to home on malformed input", () => {
    expect(routeFromHash("#/garbage/path")).toEqual({ kind: "home" });
  });

  it("round-trips every route shape", () => {
    const routes = [
      { kind: "home" as const },
      { kind: "course" as const, courseId: "calculus-i" },
      {
        kind: "lesson" as const,
        courseId: "calculus-i",
        lessonId: "derivative-as-a-limit"
      }
    ];
    for (const route of routes) {
      expect(routeFromHash(routeToHash(route))).toEqual(route);
    }
  });
});
