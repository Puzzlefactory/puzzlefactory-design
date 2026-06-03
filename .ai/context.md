# Project Context

## Goal

Build a design system with a generative color engine as its foundation. The engine takes a seed color, harmony strategy, and mood argument and produces a complete set of primitive and semantic tokens for light, dark, high contrast light, and high contrast dark themes — with no designer intervention required. Everything downstream (components, layout, theming) depends on the color engine being correct.

## Current Shape

- Turborepo monorepo shell exists at the repo root
- Package namespace is `@puzzlefactory`
- Color engine v1 architecture was implemented far enough to expose the generation strategy visually; the v1 broad-ramp generation model is rejected for future work
- Color engine v2 planning is active and should use visual-first compact usage ramps, separate neutral/light-surface/dark-surface seeds, and kitchen-sink feedback from the first slice
- Root workspace config exists with `packages/*` and `apps/*`
- Placeholder folders exist for all planned packages and the docs app
- `packages/color-engine` is now a real `@puzzlefactory/color-engine` workspace package containing the v1 implementation; keep it as reference until an authorized v2 slice preserves, renames, or replaces it
- `packages/tokens` is now a real `@puzzlefactory/tokens` workspace package that consumes `EngineOutput` and renders the six specified CSS custom property outputs
- `apps/kitchen-sink` is now a real React + Vite + React Router 7 workspace wired to live `@puzzlefactory/color-engine` and `@puzzlefactory/tokens` output for seed controls, primitive ramps, semantic preview, theme variants, and assertion reporting

## Repository Layout

```
packages/
  color-engine/  // @puzzlefactory/color-engine; current v1 implementation, reference until v2 preservation/rename/replacement is authorized
  tokens/        // @puzzlefactory/tokens; CSS custom property output layer for EngineOutput, zero runtime dependencies
  layout/        // @puzzlefactory/layout; Stack, Box, Cluster, Sidebar, Grid, Frame, Cover, Switcher (placeholder only)
  primitives/    // @puzzlefactory/primitives; forked headless behavior layer (placeholder only)
  components/    // @puzzlefactory/components; styled components (placeholder only)
  icons/         // @puzzlefactory/icons; icon system (placeholder only)
  themes/        // @puzzlefactory/themes; pre-built configurations, generator utilities (placeholder only)

apps/
  docs/               // documentation app (placeholder only)
  kitchen-sink/       // React + Vite + React Router 7 verification shell wired to engine/token output
```

- `.ai/` — durable agent context

## Important Artifacts

- `docs/color-engine-spec.md` — full implementation specification for the color engine (revision 5, finalized)
- `.ai/workstreams/color-engine.md` — closed/reference v1 color-engine workstream
- `.ai/workstreams/color-engine-v2.md` — active v2 color-engine workstream: visual-first compact usage ramps

## Current Phase

Color engine v1 is closed as reference. Its package boundaries, token CSS output, and kitchen-sink visualization are useful, but its broad generic ramp generation model is not the future path. Color engine v2 planning is active. The next implementation should start with neutral and surface generation only: separate neutral, light-surface, and dark-surface seeds; compact usage-specific light/dark surface ramps; named presets; and immediate kitchen-sink visualization. Component layer work remains deferred.

## Resume Guidance

When resuming work:

1. Read `.ai/decisions.md`.
2. Read `.ai/workstreams/color-engine-v2.md` for new color-engine work. Read `.ai/workstreams/color-engine.md` only as v1 reference.
3. Check git status.
4. Continue from the workstream's Next Actions rather than relying on chat history.
