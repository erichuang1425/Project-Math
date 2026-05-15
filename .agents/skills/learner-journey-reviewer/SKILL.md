---
name: learner-journey-reviewer
description: "Use when reviewing the end-to-end experience of a learner moving through a lesson or the full studybook: onboarding to dashboard, lesson entry, section progression, step rail navigation, glossary interaction, quiz flow, mistake recovery, progress feedback, export, and return paths."
---

# Learner Journey Reviewer

Use this skill to audit whether a complete learning flow — from the dashboard to finished lesson — is coherent, low-friction, and recoverable for the learner.

## Read First

- `AGENTS.md`
- `docs/product-brief.md`
- `docs/learning-design.md`
- `docs/ui-system.md`

## Related Skills

- Use `neurodivergent-learning-accessibility-reviewer` for cognitive load, predictability, and sensory checks inside individual lesson blocks.
- Use `motivation-ux-reviewer` for whether the app supports sustained engagement without performative reward patterns.
- Use `frontend-visual-system-designer` for visual hierarchy and layout within each stage of the journey.

## Journey Stages to Review

### 1. Dashboard Entry

- The learner can identify the course, overall progress, and what to do next without scrolling.
- The selected lesson label makes current position clear.
- The primary action ("Open selected lesson") is obvious.
- No lesson is silently locked or grayed without explanation.

### 2. Lesson Entry

- The lesson title, summary, section path, and estimated time orient the learner before any math appears.
- The "Step 1 of 2" label and section path rail are visible on first load.
- The first section's active state in the path rail is set correctly.

### 3. Section Progression

- Scrolling through a long section doesn't lose the learner's place in the path rail.
- The IntersectionObserver active-section highlight updates as the learner scrolls.
- Anchor links in the path rail work and scroll the matching section to a comfortable viewport position.

### 4. Worked Example Step Rail

- The step rail is legible at desktop width (all step pills visible or wrapping gracefully).
- The active step pill is visually distinct (border, background, number badge).
- Previous/Next buttons are correctly disabled at the first and last steps.
- Step 1 loads immediately with no interaction required.
- Clicking a rail pill jumps directly to that step without side effects.

### 5. Glossary Interaction

- Term links are visually distinguished from plain bold text (dotted underline).
- Opening a dialog traps focus inside it (native modal behavior).
- Pressing Escape closes the dialog and returns focus to the triggering term button.
- Clicking the backdrop closes the dialog.
- The Close button label is unambiguous.
- If the glossary entry has a LaTeX formula, it renders correctly inside the dialog.

### 6. Quiz Flow

- The learner can attempt a quiz question, see feedback, retry if incorrect, and move on.
- Attempt count and result are preserved across quiz re-opens in the same session.
- Short-answer normalization (trim, lowercase) does not silently reject correct answers.
- Multiple-choice feedback maps to the selected option.

### 7. Progress and Export

- Marking a lesson complete updates the status label immediately.
- Copy summary and Download summary both produce correct markdown.
- The footer message changes to "This lesson is saved as complete." after completion.

### 8. Return to Dashboard

- The back-to-dashboard path is keyboard accessible.
- The dashboard shows the updated progress count after the learner returns.

## Review Output

When reviewing, report:

- Journey stage affected.
- Specific component, block, or state that breaks or confuses the flow.
- Reproduction path (what learner action leads to the issue).
- Concrete revision recommendation.

## What Done Means

A learner journey task is done when each stage can be completed end-to-end by a first-time learner using only keyboard or pointer, without unexplained dead ends, broken state labels, or silent failures.
