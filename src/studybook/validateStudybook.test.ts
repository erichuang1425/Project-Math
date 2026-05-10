import { describe, expect, it } from "vitest";
import sourceStudybook from "./fixtures/derivatives-first-principles.studybook.json";
import { validateStudybook } from "./validateStudybook";

type MutableStudybook = Record<string, any>;

function cloneStudybook(): MutableStudybook {
  return JSON.parse(JSON.stringify(sourceStudybook)) as MutableStudybook;
}

function allBlockTypes(studybook: MutableStudybook) {
  return new Set(
    studybook.lessons.flatMap((lesson: MutableStudybook) =>
      lesson.sections.flatMap((section: MutableStudybook) =>
        section.blocks.map((block: MutableStudybook) => block.type)
      )
    )
  );
}

describe("validateStudybook", () => {
  it("accepts the derivatives first-principles sample lesson", () => {
    const result = validateStudybook(sourceStudybook);

    expect(result.ok).toBe(true);
    expect(allBlockTypes(sourceStudybook)).toEqual(
      new Set([
        "title",
        "concept",
        "intuition",
        "latex",
        "graph",
        "workedExample",
        "commonMistake",
        "quiz",
        "summary"
      ])
    );
  });

  it("includes the linear-function first-principles example and short-answer check", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    const blocks = result.studybook.lessons[0].sections.flatMap(
      (section) => section.blocks
    );
    const linearExample = blocks.find(
      (block) => block.id === "derivative-of-linear-function"
    );

    expect(linearExample).toMatchObject({
      type: "workedExample",
      title: "Derivative of f(x) = 3x - 5"
    });

    if (!linearExample || linearExample.type !== "workedExample") {
      throw new Error("Expected a worked example for a linear function.");
    }

    expect(linearExample.steps.map((step) => step.id)).toEqual([
      "linear-start-definition",
      "linear-substitute-function",
      "linear-expand",
      "linear-combine-terms",
      "linear-cancel-h",
      "linear-evaluate-limit"
    ]);
    expect(linearExample.steps[linearExample.steps.length - 1]?.latex).toBe(
      "f'(x)=3"
    );

    const quiz = blocks.find((block) => block.id === "linear-function-check");
    expect(quiz).toMatchObject({
      type: "quiz",
      title: "Linear function check"
    });

    if (!quiz || quiz.type !== "quiz") {
      throw new Error("Expected a quiz block for the linear function example.");
    }

    const shortAnswer = quiz.questions.find(
      (question) => question.id === "slope-of-linear-function"
    );
    expect(shortAnswer).toMatchObject({
      kind: "shortAnswer",
      acceptedAnswers: ["3", "f'(x)=3", "f prime of x equals 3"]
    });
  });

  it("includes the point-derivative lesson with a fixed-input example and quiz", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    expect(result.studybook.lessons.map((lesson) => lesson.id)).toEqual([
      "derivative-as-a-limit",
      "derivative-at-a-point"
    ]);

    const pointLesson = result.studybook.lessons.find(
      (lesson) => lesson.id === "derivative-at-a-point"
    );

    if (!pointLesson) {
      throw new Error("Expected the derivative-at-a-point lesson.");
    }

    const blocks = pointLesson.sections.flatMap((section) => section.blocks);
    const pointDefinition = blocks.find(
      (block) => block.id === "point-derivative-definition"
    );
    expect(pointDefinition).toMatchObject({
      type: "latex",
      latex: "f'(a)=\\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h}"
    });

    const graph = blocks.find((block) => block.id === "tangent-at-two-graph");
    expect(graph).toMatchObject({
      type: "graph",
      title: "Tangent slope at x = 2"
    });

    const pointExample = blocks.find(
      (block) => block.id === "derivative-value-of-x-squared-at-two"
    );
    expect(pointExample).toMatchObject({
      type: "workedExample",
      title: "Derivative of f(x) = x^2 at x = 2"
    });

    if (!pointExample || pointExample.type !== "workedExample") {
      throw new Error("Expected a worked example for f'(2).");
    }

    expect(pointExample.steps.map((step) => step.id)).toEqual([
      "point-start-definition",
      "point-substitute-function",
      "point-expand-square",
      "point-combine-terms",
      "point-factor-h",
      "point-cancel-h",
      "point-evaluate-limit"
    ]);
    expect(pointExample.steps[pointExample.steps.length - 1]?.latex).toBe(
      "f'(2)=4"
    );

    const quiz = blocks.find((block) => block.id === "point-derivative-check");
    expect(quiz).toMatchObject({
      type: "quiz",
      title: "Point derivative check"
    });

    if (!quiz || quiz.type !== "quiz") {
      throw new Error("Expected a quiz block for the point derivative lesson.");
    }

    expect(quiz.questions.map((question) => question.id)).toEqual([
      "correct-point-quotient",
      "tangent-slope-at-two"
    ]);
  });

  it("rejects unknown block types before rendering", () => {
    const studybook = cloneStudybook();
    studybook.lessons[0].sections[0].blocks[0].type = "paragraph";

    const result = validateStudybook(studybook);

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.lessons[0].sections[0].blocks[0].type"
        })
      ])
    );
  });

  it("rejects duplicate block ids within a section", () => {
    const studybook = cloneStudybook();
    const blocks = studybook.lessons[0].sections[0].blocks;
    blocks[1].id = blocks[0].id;

    const result = validateStudybook(studybook);

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.lessons[0].sections[0].blocks[1].id"
        })
      ])
    );
  });

  it("rejects invalid LaTeX", () => {
    const studybook = cloneStudybook();
    studybook.lessons[0].sections[0].blocks[3].latex = "\\frac{1}{";

    const result = validateStudybook(studybook);

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "LaTeX must render with KaTeX."
        })
      ])
    );
  });

  it("rejects graph specs without axis labels", () => {
    const studybook = cloneStudybook();
    studybook.lessons[0].sections[0].blocks[4].spec.xAxis.label = "";

    const result = validateStudybook(studybook);

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.lessons[0].sections[0].blocks[4].spec.xAxis.label"
        })
      ])
    );
  });

  it("rejects multiple-choice questions with a missing correct option", () => {
    const studybook = cloneStudybook();
    const quiz = studybook.lessons[0].sections[1].blocks.find(
      (block: MutableStudybook) => block.id === "first-principles-check"
    );
    quiz.questions[0].correctOptionId = "missing-option";

    const result = validateStudybook(studybook);

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining(".correctOptionId"),
          message: "Correct option id must match one of the question options."
        })
      ])
    );
  });
});
