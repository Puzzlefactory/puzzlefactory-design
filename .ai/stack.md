# Stack

## Global

- Monorepo: Turborepo
- Package manager: npm
- Package namespace: `@puzzlefactory`
- Workspaces: `packages/*` and `apps/*`
- Package folders are unscoped paths such as `packages/color-engine`; npm scope belongs in each package's `package.json` name.
- TypeScript: strict configuration by default
- TypeScript is a root devDependency shared by workspace package scripts.

## Packages

### `@puzzlefactory/color-engine`

Status: v2 neutral/surface foundation with calibrated surface presets, primary usage ramps, status usage ramps, stable semantic aliases, and CSS output. Target runtime is a TypeScript library. Current exports define the public API type surface for `createColorEngineTheme(input): ColorEngineOutput`, `parseColorSeed`, `ColorEngineValidationError`, surface preset constants, semantic token name constants, structured `cssOutput`, and neutral/surface/primary/status output types. Surface presets use separate light/dark step deltas and separate light/dark state deltas. Primary generation uses an explicit `primarySeed` and emits compact light/dark soft and solid usage families. Status generation uses explicit `dangerSeed`, `warningSeed`, `successSeed`, and `infoSeed` values and emits compact light/dark soft and solid usage families per status intent.

Runtime dependencies must remain zero.

Build/test scripts:

- `build`: `tsc -p tsconfig.json`
- `typecheck`: `tsc -p tsconfig.json --noEmit`
- `test`: builds `dist`, then runs TypeScript API-shape checks plus Node test runner package-boundary, surface/primary/status generation, semantic alias, and CSS output checks

#### Color Space

OKLCH throughout the engine. HSL was evaluated and rejected — perceptually non-uniform, not suitable for programmatic ramp generation. Agents should not reopen this choice.

#### TypeScript

Strict configuration. Full type definitions required for all engine inputs, outputs, and error types. Avoid `any`.

#### Dependency Policy

`@puzzlefactory/color-engine` must have zero runtime external dependencies — enforced at package level.

### `@puzzlefactory/color-engine-1`

Status: preserved v1 reference implementation. It contains validation, normalization, gamut, ramp, harmony, primitive assembly, semantic mapping, APCA implementation, assertion-suite policy, and EngineOutput integration from the first color-engine attempt.

- Package folder: `packages/color-engine-1`
- Package name: `@puzzlefactory/color-engine-1`
- Runtime dependencies: none
- Purpose: reference only. Do not continue feature work here unless explicitly authorized.
- `@puzzlefactory/tokens` currently consumes this package for v1 EngineOutput tests and CSS generation.

### `@puzzlefactory/tokens`

Status: implemented TypeScript library/generator that consumes `EngineOutput`.

- Package name: `@puzzlefactory/tokens`
- Runtime dependencies: none
- Development type/test dependency: `@puzzlefactory/color-engine-1`
- Current exports render six CSS file strings from EngineOutput: `tokens.css`, `tokens-p3.css`, `theme-light.css`, `theme-dark.css`, `theme-high-contrast.css`, and `theme-high-contrast-dark.css`

#### Token Format

- Primitive and semantic tokens output as CSS custom properties
- Six output files per theme variant, applied via `data-theme` attribute
- sRGB and P3 variants generated for all tokens
- P3 tokens use `color(display-p3 R G B)` string format — not `oklch()` — required for `@supports` guard to be meaningful
- Token themes: light, dark, high-contrast light (`data-theme="high-contrast"`), high-contrast dark (`data-theme="high-contrast-dark"`)

### `@puzzlefactory/components`

Not yet decided. Deferred until the color engine layer is complete. Web Components (Custom Elements) are a candidate for design system distribution — they present a clean attribute/slot/event API consumable by any framework.

## Apps

### `apps/kitchen-sink`

Status: React + Vite + React Router 7 verification shell wired to v2 neutral/surface/primary/status color-engine output and generated semantic aliases.

- Package name: `@puzzlefactory/kitchen-sink`
- Runtime stack: React 19, Vite 8, React Router 7
- Purpose: visual verification surface for the color engine and later token/theme/component states
- Current behavior: routed verification tool that consumes v2 `@puzzlefactory/color-engine`, injects generated CSS directly, switches `data-theme-v2`, and displays neutral/surface/primary/status seed controls, compact primitive ramps, semantic text/chrome/surface/primary/status roles, generated CSS output sections, light/dark nested surface previews, primary action/link/focus previews, and status soft/solid cards

### `apps/docs`

Status: placeholder folder only. Stack undecided.

## Figma Integration

Figma MCP is available in Claude Code sessions and can read design files, inspect tokens, and search the design system. The approach for bidirectional design/code sync is not yet defined.

## Distribution

Not yet decided. Deferred until the component layer architecture is settled.

## Open Questions

- Component API shape — Web Components, React, or both?
- Distribution mechanism — npm, CDN, monorepo-only?
- CSS fallback layer for browsers without `oklch()` support (explicitly out of scope for current phase, to be revisited)
- Bundle mode for consumers who cannot control CSS load order (explicitly out of scope for current phase)
