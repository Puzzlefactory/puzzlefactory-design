# Project Context

## Goal

Build a design system with a generative color engine as its foundation. The first color-engine approach proved that package boundaries and visual verification matter, but its broad generic ramp model was rejected. The current direction is color-engine v2: compact, purpose-built usage ramps, separate seeds where useful, named presets, and immediate kitchen-sink feedback before downstream component work.

## Current Shape

- Turborepo monorepo shell exists at the repo root
- Package namespace is `@puzzlefactory`
- Color engine v1 architecture was implemented far enough to expose the generation strategy visually; the v1 broad-ramp generation model is rejected for future work
- Color engine v2 implementation is active and uses visual-first compact usage ramps, separate neutral/light-surface/dark-surface seeds, named presets, and kitchen-sink feedback from the first slice
- Root workspace config exists with `packages/*` and `apps/*`
- Placeholder folders exist for all planned packages and the docs app
- `packages/color-engine-1` contains the preserved v1 implementation under package name `@puzzlefactory/color-engine-1`; keep it as reference until explicitly removed
- `packages/color-engine` is now the v2 `@puzzlefactory/color-engine` workspace package; current v2 output includes neutral/surface generation, chrome/border generation, explicit light and dark seed primary usage ramps, explicit light and dark seed status usage ramps, per-family seed policy, stable semantic aliases, load-order-ready structured CSS output, APCA calculation exports, diagnostic APCA assertion report output, balanced dark solid tuning, narrow status solid foreground resolution, a representative preset/seed assertion regression matrix, and curated example theme presets
- `packages/tokens` is now a real `@puzzlefactory/tokens` workspace package that consumes v1 `EngineOutput` from `@puzzlefactory/color-engine-1` and renders the six specified CSS custom property outputs
- `apps/kitchen-sink` is now a React + Vite + React Router 7 verification shell wired to v2 `@puzzlefactory/color-engine` output for theme preset controls, separate light/dark primary and status seed controls, primitive ramps, semantic roles, light/dark previews, and APCA assertion report review

## Repository Layout

```
packages/
  color-engine/    // @puzzlefactory/color-engine; v2 neutral/surface/chrome plus primary/status usage implementation, seed policy, semantic aliases, and CSS output
  color-engine-1/  // @puzzlefactory/color-engine-1; preserved v1 reference implementation
  tokens/          // @puzzlefactory/tokens; CSS custom property output layer for v1 EngineOutput, zero runtime dependencies
  layout/        // @puzzlefactory/layout; Stack, Box, Cluster, Sidebar, Grid, Frame, Cover, Switcher (placeholder only)
  primitives/    // @puzzlefactory/primitives; forked headless behavior layer (placeholder only)
  components/    // @puzzlefactory/components; styled components (placeholder only)
  icons/         // @puzzlefactory/icons; icon system (placeholder only)
  themes/        // @puzzlefactory/themes; pre-built configurations, generator utilities (placeholder only)

apps/
  docs/               // documentation app (placeholder only)
  kitchen-sink/       // React + Vite + React Router 7 verification shell wired to v2 neutral/surface/primary/status semantic output
```

- `.ai/` — durable agent context

## Important Artifacts

- `docs/color-engine-spec.md` — full implementation specification for the color engine (revision 5, finalized)
- `.ai/workstreams/color-engine.md` — closed/reference v1 color-engine workstream
- `.ai/workstreams/color-engine-v2.md` — active v2 color-engine workstream: visual-first compact usage ramps

## Current Phase

Color engine v1 is closed as reference. Its package boundaries, token CSS output, and prior kitchen-sink visualization are useful, but its broad generic ramp generation model is not the future path. Color engine v2 has neutral/surface/chrome, primary, and status usage generation: separate neutral, light-surface, dark-surface, primary light/dark, danger light/dark, warning light/dark, success light/dark, and info light/dark seeds; compact light/dark surface ramps; compact chrome/border ramps; compact primary and status soft/solid usage ramps; per-family `balanced` or `anchored` seed policy for primary/status families; named surface presets; curated example theme presets; stable text/chrome/surface/primary/status semantic aliases; structured primitive/theme CSS output with explicit `primitives.css`, `theme-light.css`, and `theme-dark.css` load order; APCA calculation exports ported from v1; diagnostic APCA assertion report output; and immediate kitchen-sink visualization including an APCA assertions route. CE2-09A tuned balanced dark primary/status solid ramps with separate internal `ui` and `status` contrast profiles. CE2-09B added Kitchen Sink anchored-policy diagnostics without changing generation behavior. CE2-09C added narrow status solid foreground resolution and changed the default warning seed to `#e3bb1d`. CE2-09D added a representative balanced/anchored assertion regression matrix and made two small matrix-driven tuning adjustments; Kitchen Sink defaults now report 64/64 assertions passing. CE2-10 stabilized the v2 CSS output contract in `@puzzlefactory/color-engine` while leaving `@puzzlefactory/tokens` on the v1 reference output for now. CE2-11 added curated `evergreen`, `civic-blue`, `plum`, and `teal` example presets and Kitchen Sink preset switching while preserving manual controls. CE2-11B added optional theme-specific dark seeds for primary and status families with fallback to existing seeds when omitted; anchored policy preserves the theme-specific light or dark seed at solid level 2. Component layer work remains deferred.

## Resume Guidance

When resuming work:

1. Read `.ai/decisions.md`.
2. Read `.ai/workstreams/color-engine-v2.md` for new color-engine work. Read `.ai/workstreams/color-engine.md` only as v1 reference.
3. Check git status.
4. Continue from the workstream's Next Actions rather than relying on chat history.
