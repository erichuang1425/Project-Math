---
name: neurodivergent-learning-accessibility-reviewer
description: "Use when reviewing Project Math lesson UI or content for neurodivergent and cognitive accessibility, autism-aware readability, predictable learning flow, low-sensory presentation, input assistance, explicit state labels, or graph/equation comprehension."
---

# Neurodivergent Learning Accessibility Reviewer

Use this skill when a lesson or UI change affects cognitive load, predictability, sensory intensity, or learner control.

## Read First

- `AGENTS.md`
- `docs/learning-design.md`
- `docs/ui-system.md`

## Review Rules

- Treat the autism-aware lesson style as adjustable, not one-size-fits-all.
- Prefer short, literal learner-facing language with one main idea per visible chunk.
- Keep each important equation near a plain-language interpretation.
- Put direct actions near the relevant content: observe, predict, calculate, compare, answer, or summarize.
- Avoid idioms, vague encouragement, sarcasm, metaphor-heavy explanation, surprise motion, timers, urgency cues, flashing, autoplay animation, and confetti.
- Make navigation, state, feedback, and next steps predictable.

## Accessibility Checklist

### General

- The learner can tell where they are, what changed, and what to do next.
- Reader controls are close to the lesson reader and have visible labels.
- Graphs include text descriptions and explicit notice cues.
- Quiz selection, submission, correctness, retry, and disabled states are labeled beyond color.
- Hints and feedback prevent or recover from mistakes without shame or pressure.
- Layout reduces memory load by keeping related text, equations, and controls close together.
- Low-glare and spacing choices reduce sensory strain without hiding structure.

### Section Path Rail (Active Section)

- The active section is indicated by both border color and `aria-current="step"` — not color alone.
- When the learner scrolls, the active section updates predictably (top-of-view wins).
- Anchor links in the path rail scroll to the section top without surprising jumps.

### Worked Example Step Rail

- The step counter ("1 / 7") announces changes to screen readers via `aria-live="polite"`.
- Disabled Previous/Next buttons are visually distinct and have correct `disabled` attribute.
- Step pill labels do not overflow at normal zoom on a 900px window.
- The active pill `aria-selected="true"` is set correctly for screen reader announcements.

### Glossary Dialog

- The dialog uses `showModal()` which enforces focus trapping natively — no JS focus trap polyfill needed.
- Pressing Escape closes the dialog without side effects.
- The close button has a clear accessible label ("Close definition").
- The dialog `aria-label` names the term being defined so a screen reader announces the context.
- When the dialog closes, focus returns to the term button that triggered it (native modal behavior).
- A term with no glossary entry should not appear as a button (graceful fallback to plain span).

## Output

When reviewing, report:

- Cognitive load risks.
- Predictability or input-assistance gaps.
- Low-sensory concerns.
- Specific lesson block, component, or state affected.
- Concrete revision recommendation.

## What Done Means

A neurodivergent accessibility task is done when the affected flow is predictable, readable, low-sensory, keyboard and pointer usable, explicit about state and next action, and still rendered from deterministic structured content.
