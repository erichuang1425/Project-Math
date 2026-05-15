# Learning Design

## Teaching Model

Lessons should be structured around clear objectives, small conceptual steps, worked examples, common mistakes, and retrieval practice.

The learner should always know:

- What idea is being introduced.
- Why it matters.
- What the formal notation means.
- How the idea appears in an example.
- What mistake to avoid.
- How to check understanding.

## Lesson Structure

Each lesson should contain:

1. Title and summary.
2. Prerequisites.
3. Learning objectives.
4. Sections with ordered blocks.
5. Worked examples.
6. Common mistakes.
7. Quizzes.
8. Revision prompts or summary blocks.
9. Optional export notes.

## First Topic Outline

**Derivatives from First Principles**

Recommended lesson sequence:

1. Average rate of change.
2. Secant slope between two points.
3. Difference quotient.
4. Limit as the second point approaches the first.
5. Definition of the derivative.
6. Worked example: derivative of `f(x) = x^2`.
7. Worked example: derivative of a linear function.
8. Graph interpretation: secant line approaching tangent line.
9. Common mistakes.
10. Quiz and revision summary.

## Math Explanation Rules

- Define symbols before using them in a new context.
- Separate intuition from formal definition.
- Show algebraic transformations step by step in first-principles examples.
- State when `h != 0` is required.
- State that substituting `h = 0` too early can create division by zero.
- Use limits to explain why cancellation happens before substitution.
- Avoid claiming a derivative exists without checking the limit context.

## Worked Example Pattern

Every worked example should include:

- Goal.
- Given function.
- Starting definition.
- Substitution.
- Algebra steps.
- Limit step.
- Final result.
- Short interpretation.

Example skeleton:

```text
Goal: Find f'(x) from first principles for f(x) = x^2.
Start: f'(x) = lim_{h -> 0} (f(x + h) - f(x)) / h
Substitute: lim_{h -> 0} ((x + h)^2 - x^2) / h
Expand: lim_{h -> 0} (x^2 + 2xh + h^2 - x^2) / h
Simplify: lim_{h -> 0} (2xh + h^2) / h
Factor: lim_{h -> 0} h(2x + h) / h, with h != 0 before the limit
Cancel: lim_{h -> 0} (2x + h)
Evaluate: 2x
```

## Common Mistake Pattern

Every common mistake should include:

- The misconception.
- The incorrect step.
- Why it is wrong.
- The corrected step.
- A quick check the learner can apply next time.

## Quiz Pattern

Every quiz item should include:

- Prompt.
- Expected answer or options.
- Correct answer.
- Feedback for correct and incorrect answers.
- Concept tag.
- Optional hint.

Distractors should be plausible and tied to common mistakes.

## Revision Layers

Revision should be content-aware, not a separate notes app:

- Key definitions.
- "Try again without looking" prompts.
- Mistake review.
- Quiz retry history.
- Exportable summary.

## Accessibility and Readability

- Avoid walls of text.
- Keep equations near the explanation they support.
- Use display math for multi-step derivations.
- Use inline math only for short symbols and expressions.
- Ensure graph descriptions are available as text.
- Do not rely on color alone to communicate correctness.

## Approved Autism-Aware Deterministic Lesson Style

Status: approved by the user on 2026-05-14. Use this as the default lesson style for deterministic derivatives lessons unless later learner review identifies a concrete change.

Autism-aware lessons should:

- Use short, literal learner-facing sentences.
- Avoid idioms, jokes, vague encouragement, sarcasm, and metaphor-heavy explanations.
- Break reading into visible chunks with one main idea per chunk.
- Put a direct action near each chunk: observe, predict, calculate, compare, answer, or summarize.
- Place each important equation near a plain-language interpretation.
- Use graphs and equations as attention anchors, then state exactly what to notice.
- Add a short compare cue after each graph when a graph supports a formula or worked example.
- Keep worked-example step labels action-oriented, such as "Write the definition" or "Expand the square".
- Tie quiz distractors to the same misconception named in the nearby common mistake block.
- Add at least one deterministic pause prompt before the final quiz using existing block types.
- Treat these choices as adjustable. Do not assume one autistic-friendly setting fits every learner.

For derivatives lessons, a preferred micro-flow is:

1. Observe the object: two points, one fixed input, a quotient, or a graph.
2. Predict the next safe action.
3. Calculate with algebraic steps.
4. Compare the result with the graph or plain-language meaning.
5. Answer a deterministic check.
6. Summarize the rule and the mistake to avoid.

## What Done Means

A lesson or content task is done when:

- Objectives match the rendered content.
- Every LaTeX expression renders in KaTeX.
- Worked examples include all required steps.
- Common mistakes follow the required pattern.
- Quiz feedback is deterministic and specific.
- The content passes schema validation.
