import { describe, expect, it } from "vitest";
import { validateContent } from "../validateContent";
import type { ValidationError } from "../validateContent";
import { makeMinimalCourse } from "./makeMinimalCourse";

type AnyCourse = Record<string, any>;

function clone(value: AnyCourse): AnyCourse {
  return JSON.parse(JSON.stringify(value));
}

function messagesAt(errors: ValidationError[], pathSubstring: string): string[] {
  return errors.filter((e) => e.path.includes(pathSubstring)).map((e) => e.message);
}

describe("validateContent", () => {
  it("accepts a minimal valid course", () => {
    const course = makeMinimalCourse();
    const result = validateContent(course);
    if (!result.ok) {
      throw new Error(
        `Expected valid course, got errors: ${JSON.stringify(result.errors, null, 2)}`
      );
    }
    expect(result.course.id).toBe("calc-mini");
    expect(result.course.modules).toHaveLength(1);
  });

  it("rejects an unknown schema version", () => {
    const course = clone(makeMinimalCourse());
    course.schemaVersion = "1.0";
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "schemaVersion")[0]).toMatch(/2\.0/);
    }
  });

  it("rejects duplicate lesson ids inside a module", () => {
    const course = clone(makeMinimalCourse());
    course.modules[0].lessons.push(clone(course.modules[0].lessons[0]));
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "modules[0].lessons[1].id")[0]).toMatch(/Duplicate/);
    }
  });

  it("rejects an unknown block type", () => {
    const course = clone(makeMinimalCourse());
    course.modules[0].lessons[0].sections[0].blocks.push({ type: "mystery", id: "mystery-block" });
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "type")[0]).toMatch(/Unknown block type/);
    }
  });

  it("rejects a quiz whose correctOptionId is missing from options", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const quiz = blocks.find((b: any) => b.type === "quiz");
    quiz.questions[0].correctOptionId = "no-such-option";
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "correctOptionId").join(" ")).toMatch(
        /match one of the question options/
      );
    }
  });

  it("rejects an invalid LaTeX expression", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const latexBlock = blocks.find((b: any) => b.type === "latex");
    latexBlock.latex = "\\frac{1";
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "latex").join(" ")).toMatch(/render with KaTeX/);
    }
  });

  it("rejects a graph whose axis min equals max", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const graph = blocks.find((b: any) => b.type === "graph");
    graph.spec.xAxis.min = 1;
    graph.spec.xAxis.max = 1;
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "xAxis").join(" ")).toMatch(/min must be less than max/);
    }
  });

  it("rejects a term segment pointing at a missing glossary id", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const concept = blocks.find((b: any) => b.type === "concept");
    concept.body.push({ kind: "term", termId: "no-such-term", label: "phantom" });
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "termId").join(" ")).toMatch(/no-such-term/);
    }
  });

  it("rejects a block objectiveId not declared on the lesson", () => {
    const course = clone(makeMinimalCourse());
    course.modules[0].lessons[0].sections[0].blocks[0].objectiveIds = ["ghost-objective"];
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "objectiveIds").join(" ")).toMatch(/ghost-objective/);
    }
  });

  it("rejects prerequisite cycles", () => {
    const course = clone(makeMinimalCourse());
    const second = clone(course.modules[0].lessons[0]);
    second.id = "second-lesson";
    second.slug = "second-lesson";
    second.prerequisiteLessonIds = ["intro-lesson"];
    course.modules[0].lessons[0].prerequisiteLessonIds = ["second-lesson"];
    course.modules[0].lessons.push(second);
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "lessonPrereqs").join(" ")).toMatch(/cycle/);
    }
  });

  it("rejects a prerequisite that does not exist", () => {
    const course = clone(makeMinimalCourse());
    course.modules[0].lessons[0].prerequisiteLessonIds = ["does-not-exist"];
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "lessonPrereqs").join(" ")).toMatch(/does-not-exist/);
    }
  });

  it("rejects ids that are not lowercase kebab-case", () => {
    const course = clone(makeMinimalCourse());
    course.modules[0].lessons[0].id = "BadID";
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "id").join(" ")).toMatch(/kebab-case/);
    }
  });

  it("rejects a non-boolean display on a latex block", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const latex = blocks.find((b: any) => b.type === "latex");
    latex.display = "yes";
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "display").join(" ")).toMatch(/boolean/);
    }
  });

  it("rejects an unknown rich text segment kind", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const concept = blocks.find((b: any) => b.type === "concept");
    concept.body.push({ kind: "marquee", value: "?" });
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "kind").join(" ")).toMatch(/rich text segment kind/);
    }
  });

  it("rejects a term segment whose termId is not lowercase kebab-case", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const concept = blocks.find((b: any) => b.type === "concept");
    concept.body.push({ kind: "term", termId: "BadTermId", label: "phantom" });
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "termId").join(" ")).toMatch(/kebab-case/);
    }
  });

  it("rejects an unknown quiz question kind", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const quiz = blocks.find((b: any) => b.type === "quiz");
    quiz.questions[0] = { ...quiz.questions[0], kind: "ranking" };
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "kind").join(" ")).toMatch(/quiz question kind/);
    }
  });

  it("accepts a valid shortAnswer question and rejects missing feedback", () => {
    const okCourse = clone(makeMinimalCourse());
    const okBlocks = okCourse.modules[0].lessons[0].sections[0].blocks;
    const okQuiz = okBlocks.find((b: any) => b.type === "quiz");
    okQuiz.questions[0] = {
      kind: "shortAnswer",
      id: "q1",
      prompt: [{ kind: "text", value: "Name it." }],
      acceptedAnswers: ["derivative"],
      feedback: { correct: "Right.", incorrect: "Try again." },
      conceptTags: ["derivative"]
    };
    const okResult = validateContent(okCourse);
    expect(okResult.ok).toBe(true);

    const badCourse = clone(okCourse);
    const badBlocks = badCourse.modules[0].lessons[0].sections[0].blocks;
    const badQuiz = badBlocks.find((b: any) => b.type === "quiz");
    delete badQuiz.questions[0].feedback;
    const badResult = validateContent(badCourse);
    expect(badResult.ok).toBe(false);
    if (!badResult.ok) {
      expect(messagesAt(badResult.errors, "feedback").join(" ")).toMatch(
        /Short answer feedback is required/
      );
    }
  });

  it("rejects an unknown graph series kind", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const graph = blocks.find((b: any) => b.type === "graph");
    graph.spec.series[0] = { id: "f", label: "f", kind: "spiral" };
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "kind").join(" ")).toMatch(/graph series kind/);
    }
  });

  it("accepts a points series and a line series, rejecting bad point pairs", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const graph = blocks.find((b: any) => b.type === "graph");
    graph.spec.series = [
      {
        id: "p",
        label: "Special points",
        kind: "points",
        points: [
          [0, 0],
          [1, 1]
        ]
      },
      {
        id: "l",
        label: "Tangent",
        kind: "line",
        through: [
          [0, 0],
          [1, 2]
        ]
      }
    ];
    expect(validateContent(course).ok).toBe(true);

    graph.spec.series[1].through = [[0, 0]];
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "through").join(" ")).toMatch(/two points/);
    }
  });

  it("rejects function samples shorter than two pairs", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const graph = blocks.find((b: any) => b.type === "graph");
    graph.spec.series[0].samples = [[0, 0]];
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "samples").join(" ")).toMatch(/at least two/);
    }
  });

  it("rejects graph annotations that are not unique by id", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    const graph = blocks.find((b: any) => b.type === "graph");
    graph.spec.annotations = [
      { id: "ann", label: "First" },
      { id: "ann", label: "Second" }
    ];
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "annotations").join(" ")).toMatch(/Duplicate/);
    }
  });

  it("rejects a duplicate block id within a lesson", () => {
    const course = clone(makeMinimalCourse());
    const blocks = course.modules[0].lessons[0].sections[0].blocks;
    blocks.push({ ...blocks[0] });
    const result = validateContent(course);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((e) => e.message).join(" ")).toMatch(/Duplicate/);
    }
  });

  it("accepts a revision layer and rejects a non-object one", () => {
    const okCourse = clone(makeMinimalCourse());
    okCourse.modules[0].lessons[0].revision = {
      keyIdeas: ["Slope as limit."],
      recallPrompts: ["State the definition."],
      mistakeIds: ["intro-mistake"],
      quizIds: ["intro-quiz"]
    };
    expect(validateContent(okCourse).ok).toBe(true);

    const badCourse = clone(okCourse);
    badCourse.modules[0].lessons[0].revision = "not-an-object";
    const result = validateContent(badCourse);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(messagesAt(result.errors, "revision").join(" ")).toMatch(/object/);
    }
  });
});
