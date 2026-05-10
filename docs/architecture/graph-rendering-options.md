# Graph Rendering Options

Date: 2026-05-10

## Decision

Use the internal deterministic SVG renderer path and extend it only as needed. Do not add a graphing library for the current derivatives lessons.

The first implementation slice keeps `GraphSpec` as the lesson contract, adds explicit sampled points to function series, and renders those samples as SVG polylines. Expression strings remain display labels only until a reviewed parser is deliberately introduced.

## Known Graph Requirements

### 1. Secant Line Approaching Tangent Slope

Source: `src/studybook/fixtures/derivatives-first-principles.studybook.json`, block `secant-slope-graph`.

The graph needs to show:

- `y = x^2` over a small domain.
- The points `(1, 1)` and `(2, 4)`.
- A secant line through those points.
- A base point annotation at `x = 1`.
- Labeled axes, ticks, title, description, and accessible text.

The lesson text describes the second point moving toward `x = 1`, but the current content specifies a static graph. No animation or slider is required yet.

### 2. Tangent Slope at x = 2

Source: `src/studybook/fixtures/derivatives-first-principles.studybook.json`, block `tangent-at-two-graph`.

The graph needs to show:

- `y = x^2` over a small domain.
- A fixed point `(2, 4)` and nearby point `(3, 9)`.
- A secant line for `h = 1`.
- A tangent line at `(2, 4)` with slope `4`.
- Point annotations, labeled axes, ticks, title, description, and accessible text.

This is the second known requirement because it requires two distinct line series on the same function context: one secant line and one tangent line.

## Options Considered

| Option | Fit for deterministic lessons | Supports both known requirements | Dependency weight | Desktop/Tauri suitability | Testability | Export/future document compatibility | Implementation complexity | UI architecture risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Existing in-repo SVG `GraphView` as-is | Strong contract, deterministic and offline | Partial: axes, ticks, points, lines, labels, and annotations work; function curves are not plotted | None | Strong, pure React/SVG | Good DOM-level assertions | Strong, SVG is document-friendly | Already implemented | Low |
| Internal deterministic SVG extension | Best fit: explicit data in `GraphSpec`, no expression evaluation | Full for current needs if function series can carry sampled points | None | Strong, no native changes | Good DOM and snapshot-style assertions for paths, labels, and descriptions | Strong, SVG can later be embedded or converted by export layers | Small to moderate | Low |
| Internal deterministic Canvas renderer | Deterministic if fed explicit points | Full visually, but text and accessibility need duplicate DOM content | None | Strong runtime fit | Weaker: pixel tests are more brittle than SVG DOM tests | Moderate: raster export is easy, vector document export is weaker | Moderate | Low |
| Lightweight plotting/charting library | Could work if fed explicit data | Usually yes for sampled curves and line overlays, but annotations/math semantics vary | Adds runtime dependency | Usually fine in Tauri if bundled locally | Mixed: often wrapper-specific or canvas-heavy | Mixed: SVG libraries export better than canvas libraries | Moderate plus dependency review | Medium if a React wrapper or library model shapes the renderer |
| Heavier interactive graphing library | More capability than needed | Yes, often with pan/zoom, tooltips, interactions, and expression parsing | High | Bundled desktop footprint and update surface grow | Mixed to poor for deterministic lesson assertions | Mixed, often requires library-specific export paths | High | Medium to high |

## Recommendation

Continue with the internal SVG renderer and make the smallest targeted upgrade:

1. Keep `GraphSpec` as the schema boundary.
2. Add optional explicit sample points to `function` series, for example `samples: Array<[number, number]>`.
3. Validate sampled points as finite coordinate pairs.
4. Render sampled function series as an SVG polyline.
5. Keep `expression` as a display label, not executable input.
6. Add tests for both existing graph blocks so the curve, points, secant line, tangent line, labels, and descriptions render deterministically.

This recommendation covers the first two known graph requirements without a dependency and without changing the desktop shell.

## Rejected or Deferred Options

### Canvas Now

Canvas is deferred. It can draw the two graphs, but it makes text, accessibility, and regression tests harder than SVG. It also weakens future document/export compatibility because the natural output is raster rather than structured vector markup.

### Lightweight Library Now

Lightweight libraries are deferred because the current requirements are static instructional graphs with known points and lines. A library would add review, maintenance, and bundle cost before the app has needs such as large datasets, tooltips, pan/zoom, or complex scales.

### Heavy Interactive Library Now

Heavier libraries are rejected for this slice. They are closer to a graphing calculator than a focused studybook renderer. They may force library-specific state, larger bundles, more complex testing, or UI patterns that do not match the current block renderer.

### Expression Parsing Now

Free-form expression parsing is rejected for now. The content schema already warns that expression strings are display data. Evaluating arbitrary strings would require a reviewed parser, validation rules, math correctness review, and security review.

## Risks

- Adding sampled points duplicates the mathematical function data. This is acceptable for MVP if tests verify that labels, samples, and lesson text agree.
- SVG paths need stable scaling and clipping rules so out-of-range samples do not create confusing visuals.
- Future interactive requirements may outgrow the internal renderer. Revisit the decision only when a lesson requires learner-controlled parameters, dynamic tracing, zooming, or more complex graph types.
- The current `GraphView` uses fixed dimensions. The next slice should preserve stable layout while ensuring the SVG scales cleanly in narrow desktop windows.

## Implemented SVG Slice

The sampled function curve rendering slice uses the existing internal SVG path:

- Extend `FunctionSeries` with optional `samples`.
- Update schema docs and runtime validation for sampled coordinate pairs.
- Add samples to `secant-slope-graph` and `tangent-at-two-graph`.
- Render samples as an SVG polyline in `GraphView`.
- Add or update focused tests for graph rendering and validation.
- Do not add dependencies or Tauri commands.

## Not Now Boundaries

- No graphing library.
- No Canvas renderer.
- No free-form expression parser.
- No graph animation, sliders, pan/zoom, or tracing controls.
- No PDF, document, or export implementation changes.
- No database, sync, AI, telemetry, account, or UI framework dependency.
- No Rust/Tauri graph logic.
