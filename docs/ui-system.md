# UI System

## Intent

Project-Math should feel like a polished MOOC shell wrapped around a focused, distraction-free reader. The shell pulls a low-motivation learner in with warmth, illustration, and visible progress. The reader stays calm and structured. Both modes share tokens, primitives, and accessibility floor.

## Display Modes

Both modes are first-class. Switching toggles `data-mode` on `<html>`. Both must pass the manual smoke checklist below.

### Polished (default)

- Warm neutral surfaces (cream/sand), deep indigo accent (#3b3aa1-ish), amber highlight on calls-to-action.
- Subtle elevation (1–2px shadows) on cards.
- 120–180ms transform/opacity transitions on hover, focus, and route change, gated behind `@media (prefers-reduced-motion: no-preference)`.
- Course/lesson cards carry inline SVG illustrations from `src/design/illustrations/`.
- Progress is loud-but-quiet: rings on course cards, chips on lessons, daily-progress stat in the top bar.

### Calm (opt-in)

- Higher-contrast warm neutrals (off-cream pane on warm-stone background; `--reader-pane-bg` ≈ `#ece6d4`).
- No elevation, no transitions, no decorative illustration.
- Reading rule visible at all section boundaries; no nested cards.
- Status communicated with text + icon + border. No color-only cues.
- WCAG AA contrast across the surface.

## Tokens

All color/space/radius/elevation/typography lives in `src/design/tokens.css`. CSS Modules consume tokens; nothing reads a literal color. Reader tokens (`--reader-*`) remain a layered subset that adapts to the active mode.

## Primitives

Lives in `src/design/primitives/`. Every screen composes from these:

- `Button` (primary, ghost, subtle)
- `Card` (with optional illustration slot)
- `Pill` (status chips: not-started / in-progress / complete / locked)
- `ProgressRing` (course cards)
- `ProgressBar` (lesson + module)
- `Stat` (daily progress, time-on-task)
- `Dialog` (shortcuts, glossary)
- `Icon` (wraps `lucide-react`)

## App Surfaces

- **Courses dashboard** — grid of `CourseCard` plus a `ContinueCard` for the in-progress lesson.
- **Course detail** — header with course illustration and overall progress; module accordions listing lessons with status chips, estimated time, and prerequisites.
- **Reader** — `Breadcrumb` (Course / Module / Lesson); sticky lesson sidebar with active-section indicator (IntersectionObserver); main lesson pane; collapsible reader controls.
- **Shortcuts dialog** — opened with `?`; lists `g h` / `g c` / `g l` and reader shortcuts.
- **Glossary popover** — `<dialog>` element opened by term segments in rich text.
- **Validation error view** — shows every validator error inline with file location.

## Layout Rules

- Stable shell: top bar (always) + lesson sidebar (only inside the reader) + main pane.
- `.readerPane` `max-width` scales with text size: `min(calc(68ch * var(--reader-font-scale)), 1120px)`. Line length stays comfortable at every reader text size.
- Cards are reserved for course tiles, module accordions, and dialog surfaces. No nested cards.
- Controls stay near the content they affect; reader controls collapse by default.
- Skip links: "Skip to lesson content" + "Skip to next section".

## Typography

- System sans for UI; system serif for body math context; KaTeX for equations.
- Display math for derivations and definitions; inline math for short symbols only.
- No oversized headings inside compact panels.
- Reader text scale: 0.85, 1.0, 1.2, 1.35rem.
- Reader line height: 1.5, 1.65, 1.8, 1.9 multipliers.
- Labels in reader controls remain literal: "Reader font", "Text size", "Line spacing", "Calm mode".

## Color & State

Semantic state tokens: `accent`, `focus`, `selected`, `warning`, `correct`, `incorrect`, `disabled`. Every state pairs color with icon + label + border. Calm mode flattens decorative color but keeps state recognizable.

## Motion

- All motion gated behind `prefers-reduced-motion: no-preference` and the `<MotionGate>` helper.
- Allowed: opacity, transform translate/scale up to 4px / 1.02, 120–180ms.
- Forbidden: marquee, parallax, attention-grabbing pulses, color flashes, decorative timers.
- Calm mode disables all motion regardless of OS preference.

## Block-Level Quality

- Worked examples carry a numbered step rail with action-cue chips ("Write the definition", "Expand", "Take limit") and a clear final-answer band.
- Common-mistake blocks open with the misconception, then the incorrect step, then the correction.
- Quiz states: no answer / answer ready / submitted (correct/needs review). "Press Enter to submit" hint visible when an answer is ready. Correctness shown via icon + label + border.
- Graphs are keyboard-focusable; pair the SVG with a text description of annotations.

## Empty / Error / Loading States

Required surfaces handle:

- No courses found.
- Course failed validation (with each error and its block ID).
- Lesson has no blocks.
- Unknown block type (renders a labelled placeholder, never throws).
- Invalid LaTeX (renders the source verbatim with an error pill).
- Failed local state load (surfaces a storage notice; learner can keep reading).
- Loading is uncommon (everything is bundled) but a thin skeleton card is provided for slow async fixture loads.

## Accessibility Floor

- Keyboard and pointer both work for every flow.
- Focus visible (3px ring, 2px offset).
- Tab order matches reading order.
- Skip links land at lesson content + next section.
- Live regions announce route changes and quiz state transitions.
- Calm mode passes WCAG AA contrast across surface, text, and state.

## Manual Smoke Checklist (every PR)

In both Polished and Calm modes, on a desktop window ranging 900px → 1600px:

1. Courses dashboard renders cards and the Continue card.
2. Click a course → course detail shows modules and progress.
3. Click a lesson → reader loads; sidebar reflects current section; breadcrumb is truthful.
4. Bump text size to 1.35 → line length stays comfortable, no overlap.
5. Take a quiz, submit → correctness shown via icon + label + border, not color alone.
6. Open a glossary term → popover opens; Escape closes it; focus returns to the trigger.
7. Toggle the other display mode → palette and motion behave per the rules above.
8. Export lesson summary → clipboard contains valid markdown.

## What Done Means

A UI change is done when:

- Both Polished and Calm modes render correctly.
- Reduced-motion users see no transitions.
- Text/measure scales gracefully with reader text size.
- New states are added to the smoke checklist above when relevant.
- Component + accessibility tests exist for the affected surface.
