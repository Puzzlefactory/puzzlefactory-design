# Workstream: Color Engine & Token Architecture

Status: active
Created: 2026-05-25
Last Updated: 2026-06-01

This workstream covers the design and implementation of the generative color engine that is the foundation of the design system. The engine takes a seed color, harmony strategy, and mood argument and produces a complete set of primitive and semantic tokens for light, dark, high contrast light, and high contrast dark themes — with no designer intervention required. Everything downstream (components, layout, theming) depends on this layer being correct.

## Scope

In scope:
- OKLCH ramp generator (two ramps per hue: light L 0.92–0.55, dark L 0.55–0.08)
- Smoothstep-based chroma taper with fully specified parameters
- Gamut mapping via chroma reduction at constant L and H, with three-case sRGB/P3 decision tree
- APCA contrast implementation written from specification (no external dependency)
- Seed validation, normalization, and lightness clamping with ordered processing steps
- Harmony strategy derivation (complementary, analogous, triadic, split-complementary, monochromatic)
- Anchored status hue ramps (danger H 29, warning H 65, success H 145, info H 245)
- Neutral ramp with fixed seed-tinted low chroma
- Semantic role inventory with reference step mappings for all four theme variants
- Full TypeScript type definitions for all engine inputs, outputs, and error types
- CSS custom property output layer (six files, specified namespace, data-theme application)
- Assertion suite validating contrast relationships including signed Lc polarity checking

Out of scope:
- Component tokens and component-layer styling
- Layout primitives (Stack, Box, Cluster, etc.)
- Headless behavior layer (Radix fork)
- Escape hatch mechanism (deferred to component layer workstream)
- CSS fallback layer for browsers without oklch() support
- Bundle mode for consumers who cannot control CSS load order
- Fork maintenance protocol for @puzzlefactory/primitives (belongs to component layer workstream)

## Current State

Architecture is fully specified in the workstream document. Generation behavior has not been written yet. The specification has been through five review cycles addressing: APCA threshold corrections, smoothstep formula completeness, P3 generation logic, ramp dead zone resolution, signed Lc polarity handling, semantic-to-ramp-step reference mappings, high contrast dark mode, monochromatic harmony naming, full TypeScript type definitions, CSS output format, and error type hierarchy.

The monorepo shell exists at `/design-system` with Turborepo root config and placeholder folders under `packages/*`. `apps/kitchen-sink` is a real React + Vite + React Router 7 workspace with a static verification shell for future engine output. `packages/color-engine` is now a real `@puzzlefactory/color-engine` workspace package with package manifest, strict TypeScript config, source/test structure, concrete public API/type-model exports, input validation utilities, seed normalization to OKLCH, gamut checking/reduction utilities, ramp generation, harmony derivation, and package-boundary tests enforcing zero runtime dependencies. Primitive token assembly, theme generation, APCA, semantic mapping, and CSS output have not been implemented yet.

## Next Actions

- Use the Slice Backlog IDs below when generating work authorization prompts from `.ai/prompt-templates/work-authorization.md`.
- Do not store generated one-off work authorization prompts in `.ai/`; keep reusable wording in `.ai/prompt-templates/` and durable sequencing here.
- Completed slices: `CE-01`, `CE-02`, `CE-03`, `CE-04`.
- Next recommended slice: `CE-05`.

## Slice Backlog

Use these IDs as shorthand for future work authorization prompts.

| ID | Slice | Scope Summary | Stop Before |
| --- | --- | --- | --- |
| `CE-01` | Seed normalization | Convert `#rgb`, `#rrggbb`, `rgb()`, and `hsl()` inputs to `OklchValue`; keep existing `oklch()` parser path; add fixture tests. | Gamut mapping, ramps, harmony, APCA, semantic mapping, kitchen-sink wiring |
| `CE-02` | Gamut utilities | Add sRGB/P3 conversion checks and chroma reduction at constant L/H with tests from known fixtures. | Ramp generation, APCA assertions, token assembly |
| `CE-03` | Ramp generation | Generate light/dark OKLCH ramps with smoothstep chroma taper and mood scaling. | Harmony derivation, semantic mapping, APCA assertions, CSS output |
| `CE-04` | Harmony derivation | Implement complementary, analogous, triadic, split-complementary, and monochromatic hue sets. | Ramp generation changes, semantic mapping, status/neutral token assembly |
| `CE-05` | Primitive token assembly | Assemble palette, status, and neutral primitive token names and color values from normalized seed, harmony hues, and ramps. | Semantic role mapping, APCA assertions, CSS output |
| `CE-06` | Semantic mapping | Map primitives to semantic roles for light, dark, high contrast, and high contrast dark variants. | APCA implementation, assertion enforcement, CSS output package |
| `CE-07` | APCA implementation | Implement APCA from the published specification with fixture tests and no runtime dependency. | Assertion suite policy, token generation changes, kitchen-sink wiring |
| `CE-08` | Assertion suite | Validate text, UI, non-text contrast, warning behavior, and signed polarity errors against generated semantic pairs. | CSS output, kitchen-sink visual integration |
| `CE-09` | Engine output integration | Wire `createColorEngineTheme(input): EngineOutput`, metadata, warnings, and validation/normalization/generation flow. | `@puzzlefactory/tokens` package implementation, kitchen-sink visual wiring |
| `CE-10` | Token CSS output | Implement `@puzzlefactory/tokens` CSS custom property output layer for the six specified output files. | Component styling, docs app, broad theming package work |
| `CE-11` | Kitchen-sink engine wiring | Connect real engine output to the existing kitchen-sink verification shell. | Marketing/docs content, component library implementation |

## Completion Shape

This workstream is substantially complete when:

- `@puzzlefactory/color-engine` accepts a seed + harmony + mood and returns a valid EngineOutput with no TypeScript errors
- All six CSS output files are generated correctly for a known seed
- APCA implementation passes all published sample values
- Assertion suite catches a known failing token pair and a known polarity error
- Light, dark, HC light, and HC dark themes all render correctly in the kitchen-sink app
- A pure red seed with complementary harmony produces a visually balanced, accessible theme with no assertion failures

## Blockers / Constraints

- APCA must be implemented from the published specification at git.apcacontrast.com — no npm dependency permitted
- `@puzzlefactory/color-engine` must have zero runtime external dependencies — enforced at package level
- The input normalization layer at the engine boundary is the sole permitted exception and must have no transitive dependencies of its own
- Amber status hue (H 65) may be structurally unable to achieve Lc 45 at typical background lightness — Lc 40 floor tolerance applies to warning only, engine emits STATUS_CONTRAST_LIMIT warning

## Key Decisions

- **Color space:** OKLCH throughout. HSL rejected — perceptually non-uniform.
- **Ramp model:** Two ramps per hue (light and dark), shared boundary at L 0.55. Not one full-range ramp.
- **State differentiation:** ΔL ≥ 0.035 enforced as a generation invariant, not a post-hoc assertion. APCA Lc deltas are not used for state differentiation — category error.
- **Gamut mapping:** Chroma reduction at constant L and H. Three-case P3 decision tree (in sRGB / outside sRGB inside P3 / outside both).
- **P3 token format:** `color(display-p3 R G B)` strings, not oklch(). Required for @supports guard to be meaningful.
- **APCA polarity:** Wrong-polarity pairs (light-on-light, dark-on-dark) are POLARITY_ERROR — a separate failure class from contrast failures, always hard fail regardless of absolute Lc.
- **Brand:** Not a primitive. At most a single semantic alias. No presence in the engine.
- **Status hues:** Anchored regardless of seed and harmony strategy. Mood scale factor does not apply to status ramps (always 1.0).
- **surface-overlay:** Intentionally maps to same primitive as surface-base. Differentiation comes from elevation shadow and border defined in the component layer.
- **surface-tinted:** Collapses to surface-base in all high contrast variants.
- **High contrast:** Two variants — light (`data-theme="high-contrast"`) and dark (`data-theme="high-contrast-dark"`). Both fully specified with explicit per-role mappings and elevated assertion minimums (Lc 90 text, Lc 60 UI components, Lc 45 non-text indicators).
- **Monochromatic harmony:** palette-a (scale 1.0), palette-a-mid (scale 0.5), palette-a-subtle (scale 0.2). No palette-b or palette-c.
- **Escape hatch:** Deferred to component layer workstream.

## Key Files

- `docs/color-engine-spec.md` — full implementation specification (revision 5, finalized)
- `packages/color-engine/` — package scaffold exists; package name `@puzzlefactory/color-engine`
- `packages/tokens/` — placeholder exists; target package name `@puzzlefactory/tokens`
- `apps/kitchen-sink/` — React + Vite + React Router 7 verification shell exists
