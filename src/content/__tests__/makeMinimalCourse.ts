import type { Course } from "../schema";

export function makeMinimalCourse(): Course {
  return {
    schemaVersion: "2.0",
    id: "calc-mini",
    slug: "calc-mini",
    title: "Mini Calculus",
    subject: "math",
    level: "intro",
    summary: "A small valid course used for validator tests.",
    illustrationId: "tangent-curve",
    prerequisites: ["algebra"],
    modules: [
      {
        id: "intro-module",
        title: "Intro Module",
        summary: "One lesson in one module.",
        lessons: [
          {
            id: "intro-lesson",
            slug: "intro-lesson",
            title: "Intro Lesson",
            summary: "Cover every block type for the validator.",
            objectives: [
              { id: "obj-define", text: "Define the difference quotient" },
              { id: "obj-evaluate", text: "Evaluate a one-step limit" }
            ],
            prerequisiteLessonIds: [],
            estimatedMinutes: 15,
            difficulty: "intro",
            sections: [
              {
                id: "main",
                title: "Main",
                blocks: [
                  {
                    type: "title",
                    id: "intro-title",
                    title: "Intro Lesson Title",
                    kicker: "Lesson 1",
                    objectiveIds: ["obj-define"]
                  },
                  {
                    type: "concept",
                    id: "intro-concept",
                    title: "What is a derivative?",
                    body: [
                      { kind: "text", value: "A " },
                      { kind: "term", termId: "derivative", label: "derivative" },
                      { kind: "text", value: " is an instantaneous slope." }
                    ]
                  },
                  {
                    type: "intuition",
                    id: "intro-intuition",
                    title: "Intuition",
                    body: [{ kind: "text", value: "Picture a tangent." }]
                  },
                  {
                    type: "latex",
                    id: "intro-latex",
                    latex: "f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}",
                    caption: "Derivative as a limit",
                    display: true
                  },
                  {
                    type: "graph",
                    id: "intro-graph",
                    title: "Tangent example",
                    description: "Curve with tangent at x = 1.",
                    spec: {
                      xAxis: { label: "x", min: -2, max: 2 },
                      yAxis: { label: "y", min: -1, max: 4 },
                      series: [
                        {
                          kind: "function",
                          id: "f",
                          label: "f(x) = x^2",
                          expression: "x^2",
                          domain: [-2, 2],
                          samples: [
                            [-2, 4],
                            [-1, 1],
                            [0, 0],
                            [1, 1],
                            [2, 4]
                          ]
                        }
                      ]
                    }
                  },
                  {
                    type: "workedExample",
                    id: "intro-worked",
                    title: "Compute f'(x) for f(x) = x^2",
                    goal: "Use first principles.",
                    steps: [
                      {
                        id: "step-write",
                        label: "Write the definition",
                        explanation: "Start with the limit definition.",
                        latex: "\\frac{f(x+h)-f(x)}{h}"
                      },
                      {
                        id: "step-cancel",
                        label: "Cancel h",
                        explanation: "Simplify the numerator.",
                        latex: "2x+h"
                      }
                    ],
                    interpretation: "The slope is 2x."
                  },
                  {
                    type: "commonMistake",
                    id: "intro-mistake",
                    title: "Forgetting the limit",
                    misconception: "Treat h as zero too early.",
                    incorrectStep: "Replace h with 0 in the numerator.",
                    whyWrong: "0/0 is indeterminate.",
                    correction: "Simplify algebraically before taking the limit."
                  },
                  {
                    type: "quiz",
                    id: "intro-quiz",
                    title: "Check",
                    questions: [
                      {
                        kind: "multipleChoice",
                        id: "q1",
                        prompt: [{ kind: "text", value: "What is f'(x) for f(x) = x^2?" }],
                        options: [
                          {
                            id: "a",
                            text: [{ kind: "text", value: "2x" }],
                            feedback: "Correct."
                          },
                          {
                            id: "b",
                            text: [{ kind: "text", value: "x^2" }],
                            feedback: "That is f, not f'."
                          }
                        ],
                        correctOptionId: "a",
                        conceptTags: ["derivative"]
                      }
                    ]
                  },
                  {
                    type: "summary",
                    id: "intro-summary",
                    items: [[{ kind: "text", value: "Derivative = limit of slopes." }]]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    glossary: [
      {
        id: "derivative",
        term: "derivative",
        definition: "Instantaneous slope of a function at a point."
      }
    ]
  };
}
