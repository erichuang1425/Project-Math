---
name: ux-quality-reviewer
description: Use when reviewing lesson UI, block rendering, navigation, quiz interaction, graph presentation, responsive desktop layout, or accessibility.
---

# UX Quality Reviewer

Use this skill to review whether the app feels like a focused desktop studybook and whether the UI is usable for learning.

## Read First

- `docs/product-brief.md`
- `docs/ui-system.md`
- `docs/learning-design.md`

## Related Local Skills

- Use `frontend-visual-system-designer` for visual language, desktop polish, microinteractions, and Project Math-specific aesthetic direction.
- Use `design-token-architect` for CSS variables, semantic visual tokens, spacing rhythm, focus rings, and state color systems.
- Use `neurodivergent-learning-accessibility-reviewer` for deep cognitive accessibility, autism-aware readability, low-sensory flow, and input assistance.
- Use `frontend-regression-visual-qa` for visual regression checks, responsive layout checks, keyboard/focus checks, and smoke-test reporting after frontend changes.

## Review Checklist

- The first screen supports studying, not marketing.
- Lesson navigation is clear.
- Reading width is comfortable.
- Equations, examples, graphs, and quizzes have stable layout.
- Text does not overflow or overlap at narrow desktop sizes.
- Controls have accessible names.
- Focus states are visible.
- Quiz states are clear: unselected, selected, submitted, correct, incorrect, retry.
- Error states are specific and useful.
- Visual styling does not compete with math content.

## Interaction Checklist

- Pointer and keyboard users can navigate core flows.
- Graph descriptions are available as text.
- Feedback appears near the user action.
- Disabled states explain or imply why action is unavailable.

## What Done Means

A UX quality task is done when:

- The reviewed flow is usable at small and large desktop window sizes.
- Core interactions work with keyboard and pointer.
- Required states are visible and understandable.
- Issues are reported with exact screen, component, and reproduction details.
