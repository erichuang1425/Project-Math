import { describe, expect, it } from "vitest";
import sourceStudybook from "./fixtures/derivatives-first-principles.studybook.json";
import type { GraphBlock } from "./schema";
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
      title: "Check: linear function"
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
      "derivative-at-a-point",
      "constant-function-derivative"
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
      title: "Check: fixed input"
    });

    if (!quiz || quiz.type !== "quiz") {
      throw new Error("Expected a quiz block for the point derivative lesson.");
    }

    expect(quiz.questions.map((question) => question.id)).toEqual([
      "correct-point-quotient",
      "tangent-slope-at-two"
    ]);
  });

  it("includes the approved constant-function derivative lesson", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    expect(result.studybook.lessons.map((lesson) => lesson.id)).toEqual([
      "derivative-as-a-limit",
      "derivative-at-a-point",
      "constant-function-derivative"
    ]);

    const constantLesson = result.studybook.lessons.find(
      (lesson) => lesson.id === "constant-function-derivative"
    );

    if (!constantLesson) {
      throw new Error("Expected the constant-function derivative lesson.");
    }

    const blocks = constantLesson.sections.flatMap((section) => section.blocks);

    expect(blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "graph",
          id: "constant-function-graph",
          title: "Flat function has zero slope"
        }),
        expect.objectContaining({
          type: "intuition",
          id: "compare-constant-graph-to-rule",
          title: "Compare: graph to numerator"
        }),
        expect.objectContaining({
          type: "workedExample",
          id: "derivative-of-constant-function",
          title: "Derivative of f(x) = 7"
        }),
        expect.objectContaining({
          type: "commonMistake",
          id: "treating-constant-as-slope"
        }),
        expect.objectContaining({
          type: "intuition",
          id: "pause-compare-output-change",
          title: "Pause: compare output values"
        }),
        expect.objectContaining({
          type: "quiz",
          id: "constant-function-check",
          title: "Check: constant function"
        })
      ])
    );

    const example = blocks.find(
      (block) => block.id === "derivative-of-constant-function"
    );

    if (!example || example.type !== "workedExample") {
      throw new Error("Expected a worked example for f(x) = 7.");
    }

    expect(example.steps.map((step) => step.id)).toEqual([
      "constant-start-definition",
      "constant-substitute-function",
      "constant-combine-output-change",
      "constant-simplify-quotient",
      "constant-evaluate-limit"
    ]);
    expect(example.steps[example.steps.length - 1]?.latex).toBe("f'(x)=0");

    const quiz = blocks.find((block) => block.id === "constant-function-check");

    if (!quiz || quiz.type !== "quiz") {
      throw new Error("Expected a quiz block for the constant-function lesson.");
    }

    expect(quiz.questions.map((question) => question.id)).toEqual([
      "constant-output-change-question",
      "constant-derivative-value"
    ]);
  });

  it("keeps the approved autism-aware cues in each deterministic lesson", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    const lessonBlocks = Object.fromEntries(
      result.studybook.lessons.map((lesson) => [
        lesson.id,
        lesson.sections.flatMap((section) => section.blocks)
      ])
    );

    expect(lessonBlocks["derivative-as-a-limit"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "intuition",
          id: "compare-secant-graph-to-rule",
          title: "Compare: graph to quotient"
        }),
        expect.objectContaining({
          type: "intuition",
          id: "pause-predict-safe-step",
          title: "Pause: predict the safe step"
        })
      ])
    );
    expect(lessonBlocks["derivative-at-a-point"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "intuition",
          id: "compare-tangent-graph-to-rule",
          title: "Compare: graph to fixed input"
        }),
        expect.objectContaining({
          type: "intuition",
          id: "pause-compare-fixed-inputs",
          title: "Pause: compare the inputs"
        })
      ])
    );
    expect(lessonBlocks["constant-function-derivative"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "intuition",
          id: "compare-constant-graph-to-rule",
          title: "Compare: graph to numerator"
        }),
        expect.objectContaining({
          type: "intuition",
          id: "pause-compare-output-change",
          title: "Pause: compare output values"
        })
      ])
    );
  });

  it("pairs graph descriptions and quiz feedback with explicit learner cues", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    const blocks = result.studybook.lessons.flatMap((lesson) =>
      lesson.sections.flatMap((section) => section.blocks)
    );
    const secantGraph = blocks.find((block) => block.id === "secant-slope-graph");
    const tangentGraph = blocks.find((block) => block.id === "tangent-at-two-graph");

    expect(secantGraph).toMatchObject({
      type: "graph",
      description: expect.stringContaining("Notice the two marked points first")
    });
    expect(tangentGraph).toMatchObject({
      type: "graph",
      description: expect.stringContaining("Notice the fixed point")
    });

    const firstQuiz = blocks.find((block) => block.id === "first-principles-check");
    const pointQuiz = blocks.find((block) => block.id === "point-derivative-check");

    if (!firstQuiz || firstQuiz.type !== "quiz") {
      throw new Error("Expected first-principles quiz.");
    }
    if (!pointQuiz || pointQuiz.type !== "quiz") {
      throw new Error("Expected point-derivative quiz.");
    }

    const firstQuestion = firstQuiz.questions[0];
    const pointQuestion = pointQuiz.questions[0];

    if (firstQuestion.kind !== "multipleChoice") {
      throw new Error("Expected first-principles question to be multiple choice.");
    }
    if (pointQuestion.kind !== "multipleChoice") {
      throw new Error("Expected point-derivative question to be multiple choice.");
    }

    expect(firstQuestion.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "substitute-zero-first",
          feedback: expect.stringContaining("division by zero")
        })
      ])
    );
    expect(pointQuestion.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mix-variable-and-point",
          feedback: expect.stringContaining("fixed input 2")
        })
      ])
    );
  });

  it("accepts sampled function series for the known graph blocks", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    const graphBlocks = result.studybook.lessons.flatMap((lesson) =>
      lesson.sections.flatMap((section) =>
        section.blocks.filter((block): block is GraphBlock => block.type === "graph")
      )
    );

    const expectedExpressions = new Map([
      ["secant-slope-graph", "y = x^2"],
      ["tangent-at-two-graph", "y = x^2"],
      ["constant-function-graph", "y = 7"]
    ]);

    expectedExpressions.forEach((expression, graphId) => {
      const graph = graphBlocks.find((candidate) => candidate.id === graphId);

      if (!graph) {
        throw new Error(`Expected graph block ${graphId}.`);
      }

      const functionSeries = graph.spec.series.find(
        (series) => series.kind === "function"
      );

      if (!functionSeries || functionSeries.kind !== "function") {
        throw new Error(`Expected graph block ${graphId} to include a function series.`);
      }

      expect(functionSeries.expression).toBe(expression);
      expect(functionSeries.samples?.length).toBeGreaterThan(1);
      if (graphId === "constant-function-graph") {
        expect(functionSeries.samples).toEqual(
          expect.arrayContaining([
            [0, 7],
            [2, 7]
          ])
        );
      } else {
        expect(functionSeries.samples).toEqual(
          expect.arrayContaining([
            [1, 1],
            [2, 4]
          ])
        );
      }
    });
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

  it("rejects invalid sampled function coordinates", () => {
    const studybook = cloneStudybook();
    studybook.lessons[0].sections[0].blocks[4].spec.series[0].samples = [
      [0, 0],
      [1, "not-a-number"]
    ];

    const result = validateStudybook(studybook);

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.lessons[0].sections[0].blocks[4].spec.series[0].samples[1][1]",
          message: "Expected a finite number."
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
