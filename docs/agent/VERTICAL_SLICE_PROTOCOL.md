# Vertical Slice Protocol

Use this protocol for each Project Math implementation slice.

## Before Editing

1. Read `AGENTS.md`.
2. Read the relevant local skills under `.agents/skills/`.
3. Read `docs/agent/PROJECT_STATE.md`, `docs/agent/NEXT_CODEX_PROMPT.md`, and this file.
4. Read the roadmap and architecture docs related to the requested slice.
5. Inspect the current repo state and check for user changes.
6. State the done criteria, concise plan, and files expected to change.

## During Editing

- Keep the slice narrow.
- Preserve the Tauri shell as a thin desktop layer.
- Keep lesson content as structured data.
- Avoid dependencies unless explicitly approved under `AGENTS.md`.
- Do not create or update `docs/agent/CODEX_PROMPT_QUEUE.md`.
- Maintain `docs/agent/NEXT_CODEX_PROMPT.md` as the single durable next prompt.

## Before Finishing

1. Run the most relevant verification available for the slice.
2. Report what passed, what was not tested, and why.
3. Summarize changed files.
4. Leave the next concrete task in `docs/agent/NEXT_CODEX_PROMPT.md`.
