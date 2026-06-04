# Durable Decisions

This file is a rolling index of currently binding decisions. Use ADRs in `docs/adr/` for full rationale when a decision needs more context.

## Active Decisions

- `.ai/` is the committed durable context area for cross-agent instructions, rolling project context, decisions, and active workstreams.
- `context.md` and `decisions.md` are rolling current-state files, not dated archives.
- Use workstream files for active flow state; workstreams are updated in-place, not appended.
- Use ADRs for significant process or architecture decisions.
- Use disposable task files for Tier 1 and Tier 2 work; completed tasks must update the relevant workstream and then be deleted.
- Active task files live under `.ai/tasks/` and are ignored by git.
- Use `@puzzlefactory` as the package namespace. Prefer explicit package names such as `@puzzlefactory/color-engine` over generic names such as `@puzzlefactory/engine`.
- Use unscoped workspace folders such as `packages/color-engine`; do not nest package folders under `packages/@puzzlefactory/`.
- Reusable prompt templates live under `.ai/prompt-templates/`; agent startup should only point to the directory, not require reading templates every session.
- Root agent entry files are thin shims; `.ai/instructions.md` owns the workflow and decides which linked files are read for each task type.
- Use a conditional `.ai` reading flow: always read `.ai/context.md` and `.ai/decisions.md`, then read stack, coordination, task, and workstream files only when the selected flow calls for them.
- Color engine v1 is closed as reference. Its broad generic ramp generation model is rejected for future implementation.
- Color engine v2 starts visual-first with compact usage-specific ramps, separate neutral/light-surface/dark-surface seeds, named presets, and kitchen-sink visualization from the first slice.
- Preserve the first color-engine implementation as `packages/color-engine-1` / `@puzzlefactory/color-engine-1`; the active `packages/color-engine` / `@puzzlefactory/color-engine` package is v2.
- Soft colored surface text treatment is controlled by named strategies (`same-hue`, `neutral`, `adaptive`) rather than broad per-token overrides. The default remains `same-hue` until visual review justifies changing it.
- Foreground/text primitives are independent from surface primitives in color-engine v2. Normal text semantics and primary/status solid on-color text must resolve from dedicated near-black/near-white text families, not from reused surface tokens.
- Light and dark surface separation may use different named presets in color-engine v2. The shared `preset` remains the fallback for compatibility; `lightSurfacePreset` and `darkSurfacePreset` override it when provided.

## Superseded Decisions

- None yet.
