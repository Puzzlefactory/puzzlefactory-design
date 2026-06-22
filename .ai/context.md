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
- `packages/color-engine` is now the v2 `@puzzlefactory/color-engine` workspace package; current v2 output includes neutral/surface generation with theme-specific surface separation presets, dedicated foreground/text generation, chrome/border generation, explicit light and dark seed primary usage ramps, explicit light and dark seed status usage ramps, per-family seed policy, stable semantic aliases, load-order-ready structured CSS output, static CSS artifact metadata/export support, APCA calculation exports, diagnostic APCA assertion report output, balanced dark solid tuning, dedicated foreground-based solid text resolution, named soft-surface text treatment strategies, a representative preset/seed assertion regression matrix, curated example theme presets with varied built-in status palettes, generated custom color role families plus `--ds-role-*` semantic aliases, and custom role diagnostic assertion pairs
- `packages/tokens` is now a real `@puzzlefactory/tokens` workspace package that consumes v1 `EngineOutput` from `@puzzlefactory/color-engine-1` and renders the six specified CSS custom property outputs
- `packages/components` is now a real `@puzzlefactory/components` workspace package containing simple Web Component proofs (`pf-button`, `pf-alert`, `pf-badge`, and `pf-card`) that consume v2 semantic CSS custom properties only and have browser-runtime tests for the current DOM/API contract. Raw Custom Elements remain acceptable for simple pieces; ADR 0002 recommends Lit plus platform APIs as the first candidate for future form or moderately interactive components.
- `packages/react-components` is now a real `@puzzlefactory/react-components` workspace package containing typed React wrappers for the stable `@puzzlefactory/components` Custom Elements; it is a consumer ergonomics layer and does not own component styling, color recipes, or color generation
- `apps/kitchen-sink` is now a React + Vite + React Router 7 verification shell wired to v2 `@puzzlefactory/color-engine` output for theme preset controls, shared/light/dark surface separation controls, separate light/dark primary and status seed controls, editable custom color role examples, text treatment strategy controls, primitive ramps including dedicated text and custom role ramps, semantic roles including custom role aliases, light/dark previews, custom role usage previews, text treatment comparison, foreground text usage samples, APCA assertion report review with custom role grouping, generated CSS/token inspection, and a Components route for the React wrapper proof over the Web Components
- Theme Authoring is now an active workstream with a first usable `apps/theme-author` React + Vite + React Router app. It is a separate designer-facing app/workflow from Kitchen Sink. It consumes `@puzzlefactory/color-engine` for curated presets, normalized input validation, generated semantic CSS injection, designer-facing light/dark/high-contrast preview frames, fixed custom-role region semantic review, generated CSS artifact/manifest inspection, and human-readable APCA readiness diagnostics. Kitchen Sink remains the diagnostic lab; Theme Authoring is intended to guide normalized theme input editing, theme preview, region review, human-readable APCA review, and CSS artifact/manifest export. Color.js is approved for future Theme Authoring picker/converter/dev tooling when needed, but not for the core color-engine runtime by default.

## Repository Layout

```
packages/
  color-engine/    // @puzzlefactory/color-engine; v2 neutral/surface/chrome plus primary/status usage implementation, seed policy, semantic aliases, and CSS output
  color-engine-1/  // @puzzlefactory/color-engine-1; preserved v1 reference implementation
  tokens/          // @puzzlefactory/tokens; CSS custom property output layer for v1 EngineOutput, zero runtime dependencies
  layout/        // @puzzlefactory/layout; Stack, Box, Cluster, Sidebar, Grid, Frame, Cover, Switcher (placeholder only)
  primitives/    // @puzzlefactory/primitives; forked headless behavior layer (placeholder only)
  components/    // @puzzlefactory/components; minimal Web Component proof consuming v2 semantic CSS variables
  react-components/ // @puzzlefactory/react-components; typed React wrapper proof for stable Web Components
  icons/         // @puzzlefactory/icons; icon system (placeholder only)
  themes/        // @puzzlefactory/themes; pre-built configurations, generator utilities (placeholder only)

apps/
  docs/               // documentation app (placeholder only)
  kitchen-sink/       // React + Vite + React Router 7 verification shell wired to v2 neutral/surface/primary/status semantic output
  theme-author/       // React + Vite + React Router 7 designer-facing theme authoring shell
```

- `.ai/` — durable agent context

## Important Artifacts

- `docs/color-engine-spec.md` — full implementation specification for the color engine (revision 5, finalized)
- `.ai/workstreams/color-engine.md` — closed/reference v1 color-engine workstream
- `.ai/workstreams/color-engine-v2.md` — active v2 color-engine workstream: visual-first compact usage ramps
- `.ai/workstreams/theme-authoring.md` — active Theme Authoring workstream: designer-facing normalized theme input, preview, diagnostics, and artifact export

## Current Phase

Color engine v1 is closed as reference. Its package boundaries, token CSS output, and prior kitchen-sink visualization are useful, but its broad generic ramp generation model is not the future path. Color engine v2 has neutral/surface/chrome, foreground/text, primary, status, and custom role usage generation: separate neutral, light-surface, dark-surface, primary light/dark, danger light/dark, warning light/dark, success light/dark, and info light/dark seeds; compact light/dark surface ramps; compact light/dark text ramps; compact chrome/border ramps; compact primary and status soft/solid usage ramps; fixed high-contrast and high-contrast-dark primitive-backed semantic output; per-family `balanced` or `anchored` seed policy for primary/status families; named surface presets with optional `lightSurfacePreset` and `darkSurfacePreset` overrides; curated example theme presets; stable text/chrome/surface/primary/status/custom-role semantic aliases; structured primitive/theme CSS output with explicit `primitives.css`, `theme-light.css`, `theme-dark.css`, `theme-high-contrast.css`, and `theme-high-contrast-dark.css` load order; static CSS artifact metadata/export support; APCA calculation exports ported from v1; diagnostic APCA assertion report output; named text treatment strategies for soft colored surfaces; and immediate kitchen-sink visualization including APCA assertions and generated CSS/token inspection routes. CE2-09A through CE2-22 built the current v2 color, CSS, custom role, Web Component, React wrapper, and component-foundation proofs. CE2-23 tuned the curated preset status seeds so presets no longer share one generic danger/warning/success/info palette, and tuned the Kitchen Sink default custom roles so `pending` reads orange, `promo` reads vivid/attention-seeking, and `billing` reads richer/darker green than built-in success. CE2-24 added a Kitchen Sink `/tokens` route for inspecting primitive variables, semantic aliases, custom role variables, theme selector CSS, ordered generated CSS files, and full CSS output. CE2-25 added fixed optimized high-contrast v2 themes that ignore tenant seeds and expose selectors for `data-theme-v2="high-contrast"` and `data-theme-v2="high-contrast-dark"`. CE2-28 added package-level static CSS artifact metadata and an ignored local export script for the five generated CSS files. Theme Authoring now has a separate input editor, designer-facing generated preview frames, region semantic review with APCA checks, artifact preview/export controls for generated CSS and manifest metadata, and human-readable APCA readiness diagnostics. Component tone APIs, a v2 token package migration, tenant storage APIs, and broad component library work remain deferred.

## Resume Guidance

When resuming work:

1. Read `.ai/decisions.md`.
2. Read `.ai/workstreams/color-engine-v2.md` for new color-engine work. Read `.ai/workstreams/color-engine.md` only as v1 reference.
3. Read `.ai/workstreams/theme-authoring.md` for Theme Authoring work.
4. Check git status.
5. Continue from the workstream's Next Actions rather than relying on chat history.
