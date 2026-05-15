---
name: design-token-architect
description: "Use when introducing, naming, reviewing, or refactoring Project Math CSS variables, semantic visual tokens, spacing rhythm, focus rings, reader surfaces, state colors, or future token foundations without adding token packages or UI frameworks."
---

# Design Token Architect

Use this skill when visual consistency depends on named values rather than one-off CSS.

## Read First

- `AGENTS.md`
- `docs/ui-system.md`
- `docs/architecture.md`

## Token Rules

- Prefer semantic tokens over cosmetic names: surface, text, muted text, border, focus, selected, correct, incorrect, warning, graph, math, reader, and spacing roles.
- Keep tokens small and local until repetition proves they should move wider.
- Preserve existing reader CSS variable behavior, including font family, text size, line height, block spacing, low-glare surfaces, and KaTeX readability.
- Use tokens to clarify intent, not to create a large design system before the app needs one.
- Do not add design-token packages, UI frameworks, font packages, build steps, or runtime dependencies.

## Review Checklist

- Inventory the touched CSS values before naming new tokens.
- Reuse existing CSS variables when they already express the role.
- Keep state tokens distinguishable without relying on color alone.
- Keep spacing consistent around lesson sections, block surfaces, graph canvases, quiz controls, and reader controls.
- Keep focus rings visible and calm across pointer and keyboard use.
- Preserve offline behavior and CSS module ownership.

## Output

When proposing or reviewing token work, report:

- Token roles added or reused.
- CSS files affected.
- Raw values intentionally left local.
- Accessibility states covered.
- Any app surfaces that should wait for a later slice.

## What Done Means

A token task is done when named values reduce meaningful duplication, state roles remain accessible, the app still uses existing CSS modules, no dependency is added, and unrelated visual restyling is avoided.
