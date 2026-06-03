# Project Context

## Goal

Build a design system with a generative color engine as its foundation. The engine takes a seed color, harmony strategy, and mood argument and produces a complete set of primitive and semantic tokens for light, dark, high contrast light, and high contrast dark themes — with no designer intervention required. Everything downstream (components, layout, theming) depends on the color engine being correct.

## Current Shape

- Turborepo monorepo shell exists at the repo root
- Package namespace is `@puzzlefactory`
- Color engine architecture is fully specified and through five review cycles; package-level API, validation behavior, seed normalization, gamut utilities, ramp generation, harmony derivation, primitive token assembly, semantic mapping, APCA contrast calculation, assertion-suite policy, public engine output flow, token CSS output, and kitchen-sink wiring are now started
- Root workspace config exists with `packages/*` and `apps/*`
- Placeholder folders exist for all planned packages and the docs app
- `packages/color-engine` is now a real `@puzzlefactory/color-engine` workspace package with concrete public API/type-model exports, input validation utilities, seed normalization to OKLCH with mandatory adjusted-seed gamut mapping, gamut checking/reduction utilities, ramp generation, harmony derivation, primitive token assembly, semantic mapping, APCA contrast calculation, assertion-suite utilities, `createColorEngineTheme(input): EngineOutput`, and package-boundary tests
- `packages/tokens` is now a real `@puzzlefactory/tokens` workspace package that consumes `EngineOutput` and renders the six specified CSS custom property outputs
- `apps/kitchen-sink` is now a real React + Vite + React Router 7 workspace wired to live `@puzzlefactory/color-engine` and `@puzzlefactory/tokens` output for seed controls, primitive ramps, semantic preview, theme variants, and assertion reporting

## Repository Layout

```
packages/
  color-engine/  // @puzzlefactory/color-engine; API/types plus input validation, seed normalization, gamut utilities, ramp generation, harmony derivation, primitive token assembly, semantic mapping, APCA contrast calculation, assertion-suite utilities, and EngineOutput flow, zero runtime dependencies
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
- `.ai/workstreams/color-engine.md` — color engine workstream: scope, implementation order, key decisions, completion shape

## Current Phase

Early implementation for engine validation, normalization, gamut, ramp, harmony, primitive token, semantic mapping, APCA behavior, assertion-suite policy, public engine output integration, token CSS output, and kitchen-sink wiring. The color engine architecture is fully specified. `packages/color-engine` has API/types, input validation utilities, seed normalization to OKLCH, mandatory adjusted-seed gamut mapping, gamut checking/reduction utilities, ramp generation, harmony derivation, primitive token assembly, semantic mapping, APCA contrast calculation, assertion-suite utilities, `createColorEngineTheme(input): EngineOutput`, and zero runtime dependencies. `packages/tokens` renders `tokens.css`, `tokens-p3.css`, and four theme CSS files from EngineOutput with zero runtime dependencies. `apps/kitchen-sink` consumes live engine/token output and can inspect seed controls, primitive ramps, semantic preview, theme variants, and assertion/warning reports. Component layer work is explicitly deferred until the engine layer is complete and verified.

## Resume Guidance

When resuming work:

1. Read `.ai/decisions.md`.
2. Read the relevant workstream file in `.ai/workstreams/`.
3. Check git status.
4. Continue from the workstream's Next Actions rather than relying on chat history.
