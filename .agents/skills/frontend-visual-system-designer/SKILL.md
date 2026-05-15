---
name: frontend-visual-system-designer
description: "Use when designing or reviewing Project Math frontend visual language, lesson-reader composition, desktop polish, calm microinteractions, visual hierarchy, or avoiding generic AI/SaaS aesthetics without changing studybook schema or app behavior."
---

# Frontend Visual System Designer

Use this skill when a frontend slice needs a Project Math visual direction, not a generic app makeover.

## Read First

- `AGENTS.md`
- `docs/ui-system.md`
- `docs/architecture.md`
- `docs/learning-design.md`

## Visual Direction

- Make the app feel like a refined desktop studybook for mathematical thinking: calm, precise, tactile, structured, and quietly premium.
- Let math content, graphs, worked examples, mistakes, and quizzes remain the primary visual signal.
- Use spacing, borders, type scale, focus states, and restrained color to create hierarchy before adding decoration.
- Prefer tactile microinteractions: clear hover, selected, focus, disabled, submitted, correct, and incorrect states near the learner action.
- Avoid cheap SaaS gradients, generic hero styling, glassmorphism, card soup, surprise motion, confetti, flashing, streak pressure, and decorative UI that competes with math.

## Design Checklist

- Preserve the existing studybook flow: validated content renders through reusable blocks.
- Keep the Tauri shell, storage, export, schema, and lesson content out of visual-only slices.
- Keep reader controls close to the lesson reader and avoid a broad settings surface unless requested.
- Ensure visual states use text, border, icon, or shape cues in addition to color.
- Keep graph and equation attention cues direct: state what to notice, then show it.
- Do not add UI frameworks, font packages, animation libraries, graphing libraries, or runtime dependencies.

## Output

When proposing or reviewing a visual-system change, report:

- Surfaces affected.
- Visual principle applied.
- Accessibility and low-sensory impact.
- Files expected to change.
- Verification or smoke path needed.

## What Done Means

A visual-system task is done when the changed surface feels consistent with Project Math, preserves deterministic offline rendering, avoids decorative noise, keeps text and controls readable at narrow and wide desktop sizes, and documents any visual QA limitation.
