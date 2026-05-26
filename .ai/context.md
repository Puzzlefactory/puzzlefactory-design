# Project Context

## Goal

Build a design system with a generative color engine as its foundation. The engine takes a seed color, harmony strategy, and mood argument and produces a complete set of primitive and semantic tokens for light, dark, high contrast light, and high contrast dark themes — with no designer intervention required. Everything downstream (components, layout, theming) depends on the color engine being correct.

## Current Shape

- Turborepo monorepo shell exists at the repo root
- Package namespace is `@ds/`
- Color engine architecture is fully specified and through five review cycles — no code written yet
- `@ds/engine`, `@ds/tokens`, and `apps/kitchen-sink` have not been scaffolded

## Repository Layout

- `packages/@ds/engine/` — generative color engine (not yet created)
- `packages/@ds/tokens/` — CSS custom property output layer (not yet created)
- `apps/kitchen-sink/` — verification and visual regression app (not yet created)
- `.ai/` — durable agent context

## Important Artifacts

- `.ai/workstreams/color-engine.md` — full color engine specification including scope, implementation order, key decisions, and completion shape

## Current Phase

Pre-implementation. The color engine architecture is fully specified. The immediate next step is scaffolding `@ds/engine` and beginning implementation in the order defined in the workstream's Next Actions. Component layer work is explicitly deferred until the engine layer is complete and verified.

## Resume Guidance

When resuming work:

1. Read `.ai/decisions.md`.
2. Read the relevant workstream file in `.ai/workstreams/`.
3. Check git status.
4. Continue from the workstream's Next Actions rather than relying on chat history.
