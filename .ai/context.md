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
- `packages/color-engine` is now the v2 `@puzzlefactory/color-engine` workspace package; current v2 output includes neutral/surface generation with theme-specific surface separation presets, dedicated foreground/text generation, chrome/border generation, explicit light and dark seed primary usage ramps, explicit light and dark seed status usage ramps, per-family seed policy, stable semantic aliases, load-order-ready structured CSS output, APCA calculation exports, diagnostic APCA assertion report output, balanced dark solid tuning, dedicated foreground-based solid text resolution, named soft-surface text treatment strategies, a representative preset/seed assertion regression matrix, and curated example theme presets
- `packages/tokens` is now a real `@puzzlefactory/tokens` workspace package that consumes v1 `EngineOutput` from `@puzzlefactory/color-engine-1` and renders the six specified CSS custom property outputs
- `packages/components` is now a real `@puzzlefactory/components` workspace package containing simple Web Component proofs (`pf-button`, `pf-alert`, `pf-badge`, and `pf-card`) that consume v2 semantic CSS custom properties only and have browser-runtime tests for the current DOM/API contract
- `apps/kitchen-sink` is now a React + Vite + React Router 7 verification shell wired to v2 `@puzzlefactory/color-engine` output for theme preset controls, shared/light/dark surface separation controls, separate light/dark primary and status seed controls, text treatment strategy controls, primitive ramps including dedicated text ramps, semantic roles, light/dark previews, text treatment comparison, foreground text usage samples, APCA assertion report review, and a Components route for the Web Component proofs

## Repository Layout

```
packages/
  color-engine/    // @puzzlefactory/color-engine; v2 neutral/surface/chrome plus primary/status usage implementation, seed policy, semantic aliases, and CSS output
  color-engine-1/  // @puzzlefactory/color-engine-1; preserved v1 reference implementation
  tokens/          // @puzzlefactory/tokens; CSS custom property output layer for v1 EngineOutput, zero runtime dependencies
  layout/        // @puzzlefactory/layout; Stack, Box, Cluster, Sidebar, Grid, Frame, Cover, Switcher (placeholder only)
  primitives/    // @puzzlefactory/primitives; forked headless behavior layer (placeholder only)
  components/    // @puzzlefactory/components; minimal Web Component proof consuming v2 semantic CSS variables
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

Color engine v1 is closed as reference. Its package boundaries, token CSS output, and prior kitchen-sink visualization are useful, but its broad generic ramp generation model is not the future path. Color engine v2 has neutral/surface/chrome, foreground/text, primary, and status usage generation: separate neutral, light-surface, dark-surface, primary light/dark, danger light/dark, warning light/dark, success light/dark, and info light/dark seeds; compact light/dark surface ramps; compact light/dark text ramps; compact chrome/border ramps; compact primary and status soft/solid usage ramps; per-family `balanced` or `anchored` seed policy for primary/status families; named surface presets with optional `lightSurfacePreset` and `darkSurfacePreset` overrides; curated example theme presets; stable text/chrome/surface/primary/status semantic aliases; structured primitive/theme CSS output with explicit `primitives.css`, `theme-light.css`, and `theme-dark.css` load order; APCA calculation exports ported from v1; diagnostic APCA assertion report output; named text treatment strategies for soft colored surfaces; and immediate kitchen-sink visualization including an APCA assertions route. CE2-09A tuned balanced dark primary/status solid ramps with separate internal `ui` and `status` contrast profiles. CE2-09B added Kitchen Sink anchored-policy diagnostics without changing generation behavior. CE2-09C added narrow status solid foreground resolution and changed the default warning seed to `#e3bb1d`. CE2-09D added a representative balanced/anchored assertion regression matrix and made two small matrix-driven tuning adjustments. CE2-10 stabilized the v2 CSS output contract in `@puzzlefactory/color-engine` while leaving `@puzzlefactory/tokens` on the v1 reference output for now. CE2-11 added curated `evergreen`, `civic-blue`, `plum`, and `teal` example presets and Kitchen Sink preset switching while preserving manual controls. CE2-11B added optional theme-specific dark seeds for primary and status families with fallback to existing seeds when omitted; anchored policy preserves the theme-specific light or dark seed at solid level 2. CE2-11C added `same-hue`, `neutral`, and `adaptive` text treatment strategies for primary/status soft surfaces; the default remains `same-hue`, and Kitchen Sink defaults now report 76/76 assertions passing. CE2-11D added independent `text-dark` and `text-light` primitives, remapped normal text semantics to those primitives, and changed primary/status solid text resolution to choose from dedicated foreground candidates instead of borrowed surface colors. CE2-11E added theme-specific surface separation preset overrides and Kitchen Sink inherited/shared fallback controls. CE2-12 documented the v2 consumer integration contract in `packages/color-engine/README.md`: consumers load `primitives.css`, `theme-light.css`, and `theme-dark.css` in order, select themes with `data-theme-v2="light"` or `data-theme-v2="dark"`, and may use build-once or persisted runtime generation, including blob-hosted tenant CSS. `@puzzlefactory/tokens` remains v1/reference-backed. CE2-13 added the first bounded Web Component proof in `@puzzlefactory/components`: `pf-button` and `pf-alert` consume semantic CSS variables only and are rendered in Kitchen Sink's Components route across light and dark `data-theme-v2` boundaries. CE2-14 refined `pf-button` state recipes so disabled primary and secondary buttons use neutral semantic control/text tokens directly, with no opacity, filters, `color-mix()`, primitive variables, or color-engine imports in component color recipes. CE2-15 defined the current component API/accessibility contract: `pf-button` remains native-button-backed with reflected `disabled`/`variant` properties plus `focus()`/`click()` delegation, `pf-alert` has reflected `status`/`variant` properties over an internal `role="status"` region, and form-associated custom element behavior is explicitly deferred. CE2-16 added Chromium-backed DOM-runtime tests for the current `pf-button`/`pf-alert` API contract: custom element registration, reflection, internal native disabled state, click/focus delegation, slot projection, and internal status-region rendering. CE2-17 recorded ADR 0001 for component foundation direction: keep raw Custom Elements for simple components and native-backed proofs, defer complex form/ARIA-heavy components until a dedicated foundation spike, and treat React wrappers as a later consumer-ergonomics layer. CE2-18 expanded the simple raw Custom Element proof with `pf-badge` and `pf-card`; both consume semantic CSS variables only, avoid color-engine imports and local color derivation, have package/DOM-runtime tests, and render in Kitchen Sink's light/dark component boundaries. Broader component library work remains deferred.

## Resume Guidance

When resuming work:

1. Read `.ai/decisions.md`.
2. Read `.ai/workstreams/color-engine-v2.md` for new color-engine work. Read `.ai/workstreams/color-engine.md` only as v1 reference.
3. Check git status.
4. Continue from the workstream's Next Actions rather than relying on chat history.
