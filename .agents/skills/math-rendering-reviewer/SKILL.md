---
name: math-rendering-reviewer
description: Use when adding or reviewing LaTeX, KaTeX rendering, derivative content, worked examples, graphs, quiz math, or math correctness rules.
---

# Math Rendering Reviewer

Use this skill for math correctness, LaTeX quality, graph meaning, and feedback in math quizzes.

## Read First

- `docs/learning-design.md`
- `docs/content-schema.md`
- `docs/ui-system.md`
- `docs/testing-strategy.md`

## Math Correctness Checklist

- Symbols are defined before use.
- Difference quotient notation is correct.
- Limit notation is present where required.
- Algebra steps are valid and sufficiently explicit.
- Domain restrictions and `h != 0` assumptions are not hidden.
- The final derivative matches the worked steps.
- Common mistakes identify the wrong step and correction.
- Quiz feedback explains the concept, not only whether the answer is right.

## LaTeX Checklist

- KaTeX can render every expression.
- Inline math is short.
- Multi-step derivations use display math or worked-step math.
- Escapes are correct inside JSON strings.
- Long equations have a wrapping or scrolling plan.
- Invalid LaTeX has a controlled fallback.

## Graph Checklist

- Axis labels are present.
- The graph description explains what the learner should notice.
- Special points or lines match the lesson text.
- Expression strings are not evaluated by an unsafe parser.
- Color is not the only way to distinguish series.

## What Done Means

A math rendering task is done when:

- All changed LaTeX renders in KaTeX.
- Math claims match the lesson objective and examples.
- Graph data and captions agree.
- Tests or fixtures cover the changed math content.
- Any unresolved math uncertainty is called out explicitly.