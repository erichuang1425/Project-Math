# UI System

## UI Intent

The interface should feel like a focused desktop studybook. It should be quiet, readable, and efficient. The learning content is the main surface.

## App Surfaces

MVP surfaces:

- Studybook library.
- Lesson reader.
- Section navigation.
- Block renderer.
- Worked example view.
- Graph view.
- Quiz interaction.
- Revision summary.
- Export action.
- Validation error view.

## Layout Rules

- Use a stable app shell with navigation and a primary reading pane.
- Keep lesson content in a readable measure.
- Keep controls close to the content they affect.
- Do not build a marketing landing page as the first screen.
- Avoid nested cards.
- Use cards only for repeated items, quizzes, modals, or framed tool surfaces.
- Desktop layout should work at narrow and wide windows.

## Typography

- Equations and explanatory text must be visually distinct.
- Use display math for derivations and definitions.
- Use inline math for short symbols only.
- Do not use oversized headings inside compact lesson panels.
- Do not scale font size directly with viewport width.
- Letter spacing should remain normal.

## Color and State

Use restrained color to communicate state:

- Definition.
- Intuition.
- Warning.
- Correct.
- Incorrect.
- Selected.
- Focused.
- Disabled.

Do not rely on color alone. Pair state color with labels, icons, borders, or text.

## Math Rendering

- KaTeX output should align with surrounding text.
- Invalid LaTeX should not crash the lesson view.
- Long equations should wrap or scroll in a controlled way.
- Captions should be close to display equations.

## Graph Rendering

- Graphs must include a title, text description, and axis labels.
- Graphs should have stable dimensions to avoid layout shift.
- The first graph renderer may be simple, but it must be behind `GraphSpec`.
- Do not introduce a graphing library until requirements justify it.

## Quiz Interaction

- A quiz question should have clear selected, submitted, correct, and incorrect states.
- Feedback should appear near the selected answer.
- Retry behavior must be explicit.
- Keyboard selection and submission should be possible.

## Empty and Error States

The UI must handle:

- No studybooks found.
- Studybook failed validation.
- Lesson has no sections.
- Unknown block type.
- Invalid LaTeX.
- Failed local state load.

These states should be direct and useful. Do not hide data errors behind generic messages.

## Accessibility

- All interactive controls need accessible names.
- Focus states must be visible.
- Graphs need textual descriptions.
- Quiz correctness must not rely only on color.
- Navigation order should match reading order.

## What Done Means

UI work is done when:

- The screen works at small and large desktop window sizes.
- Text does not overlap or overflow controls.
- Required states are implemented.
- Keyboard and pointer interactions both work for core flows.
- The UI renders offline without remote assets.
- Relevant component or smoke tests exist.
