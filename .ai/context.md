# Project Context

## Goal

Build a design system with a generative color engine as its foundation. The engine takes a seed color, harmony strategy, and mood argument and produces a complete set of primitive and semantic tokens for light, dark, high contrast light, and high contrast dark themes — with no designer intervention required. Everything downstream (components, layout, theming) depends on the color engine being correct.

## Current Shape

- Turborepo monorepo shell exists at the repo root
- Package namespace is `@puzzlefactory`
- Color engine architecture is fully specified and through five review cycles; package-level API, validation behavior, seed normalization, gamut utilities, ramp generation, harmony derivation, and primitive token assembly are now started
- Root workspace config exists with `packages/*` and `apps/*`
- Placeholder folders exist for all planned packages and the docs app
- `packages/color-engine` is now a real `@puzzlefactory/color-engine` workspace package with concrete public API/type-model exports, input validation utilities, seed normalization to OKLCH, gamut checking/reduction utilities, ramp generation, harmony derivation, primitive token assembly, and package-boundary tests; no semantic mapping, APCA, assertions, engine output integration, or theme output is implemented yet
- `apps/kitchen-sink` is now a real React + Vite + React Router 7 workspace with a static verification shell; no color-engine behavior is implemented or faked yet

## Repository Layout

```
packages/
  color-engine/  // @puzzlefactory/color-engine; API/types plus input validation, seed normalization, gamut utilities, ramp generation, harmony derivation, and primitive token assembly, zero runtime dependencies
  tokens/        // @puzzlefactory/tokens; semantic roles, CSS custom property output layer (placeholder only)
  layout/        // @puzzlefactory/layout; Stack, Box, Cluster, Sidebar, Grid, Frame, Cover, Switcher (placeholder only)
  primitives/    // @puzzlefactory/primitives; forked headless behavior layer (placeholder only)
  components/    // @puzzlefactory/components; styled components (placeholder only)
  icons/         // @puzzlefactory/icons; icon system (placeholder only)
  themes/        // @puzzlefactory/themes; pre-built configurations, generator utilities (placeholder only)

apps/
  docs/               // documentation app (placeholder only)
  kitchen-sink/       // React + Vite + React Router 7 verification shell
```

- `.ai/` — durable agent context

## Important Artifacts

- `docs/color-engine-spec.md` — full implementation specification for the color engine (revision 5, finalized)
- `.ai/workstreams/color-engine.md` — color engine workstream: scope, implementation order, key decisions, completion shape

## Current Phase

Early implementation for engine validation, normalization, gamut, ramp, harmony, and primitive token behavior. The color engine architecture is fully specified. `packages/color-engine` has API/types, input validation utilities, seed normalization to OKLCH, gamut checking/reduction utilities, ramp generation, harmony derivation, primitive token assembly, and zero runtime dependencies. `apps/kitchen-sink` exists as a static verification shell so the engine can be inspected once implemented. The immediate next engine step is semantic token mapping. Component layer work is explicitly deferred until the engine layer is complete and verified.

## Resume Guidance

When resuming work:

1. Read `.ai/decisions.md`.
2. Read the relevant workstream file in `.ai/workstreams/`.
3. Check git status.
4. Continue from the workstream's Next Actions rather than relying on chat history.
