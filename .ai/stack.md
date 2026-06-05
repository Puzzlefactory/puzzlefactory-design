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

Status: v2 neutral/surface/chrome/foreground foundation with calibrated surface presets, theme-specific surface separation overrides, primary usage ramps, status usage ramps, theme-specific dark seeds, per-family seed policy, stable semantic aliases, CSS output, APCA calculation, APCA assertion diagnostics, and curated example theme presets. Target runtime is a TypeScript library. Current exports define the public API type surface for `createColorEngineTheme(input): ColorEngineOutput`, `parseColorSeed`, `ColorEngineValidationError`, surface preset constants, chrome level constants, text level constants, seed policy constants, semantic token name constants, structured `cssOutput`, CSS file/load-order constants and types, theme preset constants and types, APCA constants/calculation helpers, contrast assertion thresholds/report types, and neutral/surface/chrome/text/primary/status output types. Surface presets use separate light/dark step deltas and separate light/dark state deltas; `preset` remains the shared fallback, while optional `lightSurfacePreset` and `darkSurfacePreset` fields override light or dark neutral/surface/chrome/state generation. Resolved presets are exposed as `output.surfacePresets.light` and `output.surfacePresets.dark`. Text generation emits compact independent `text-dark` and `text-light` primitive families with `strong`, `primary`, `secondary`, `muted`, and `disabled` levels; endpoints are near-black and near-white with slight neutral tint allowed. Normal text semantics map to these text primitives, and primary/status solid foreground resolution chooses from text primitives rather than borrowed surface tokens. Chrome generation emits compact light/dark `subtle`, `default`, and `strong` primitives derived from existing surface/neutral inputs and the resolved theme-specific surface preset. Primary generation uses `primarySeed` for light output and optional `primaryDarkSeed` for dark output; when omitted, the dark seed falls back to `primarySeed`. Status generation uses explicit light/default `dangerSeed`, `warningSeed`, `successSeed`, and `infoSeed` values plus optional `dangerDarkSeed`, `warningDarkSeed`, `successDarkSeed`, and `infoDarkSeed` values for dark output; omitted dark seeds fall back to their matching light/default seed. The default warning seed is `#e3bb1d`. Primary and status seed policies support `balanced` and `anchored`; `balanced` remains the default, while `anchored` preserves the parsed theme-specific seed as solid level 2 and preserves the light/default seed as a single-token seed primitive. Balanced dark solid generation uses separate internal `ui` and `status` contrast profiles so default dark primary/status solid required assertions pass without changing thresholds, pairs, or anchored behavior. Status solid text semantics resolve from a small approved foreground candidate set using APCA coverage across rest/hover/pressed backgrounds, preserving the intended text token when it passes. Package tests include dark seed fallback/override/anchored preservation checks, theme-specific surface preset fallback/override checks, a representative balanced preset/seed matrix, a curated theme preset test, dedicated text primitive checks, and an anchored matrix with explicit expected seed-preservation failures. APCA assertion output is diagnostic only; enforcement and broad auto-tuning remain deferred to later CE2 slices.

Runtime dependencies must remain zero.

CSS output contract:

- `cssOutput.primitives`: root primitive custom property rule.
- `cssOutput.themes.light`: light semantic alias rule.
- `cssOutput.themes.dark`: dark semantic alias rule.
- `cssOutput.files`: ordered files for `primitives.css`, `theme-light.css`, and `theme-dark.css`.
- `COLOR_ENGINE_CSS_LOAD_ORDER`: canonical file load order.
- `cssOutput.all` and `output.css`: compatibility bundle string equal to the ordered file CSS joined with blank lines.
- No high-contrast v2 CSS file is emitted yet.
- Consumer applications load `primitives.css`, then `theme-light.css`, then `theme-dark.css`, and select semantics with `data-theme-v2="light"` or `data-theme-v2="dark"`.
- Build-once generated CSS is the recommended production path. Persisted runtime generation is acceptable for tenant/theme admin workflows; blob-hosted generated CSS is a supported deployment model.

Theme preset contract:

- `COLOR_ENGINE_THEME_PRESETS`: curated example input bundles for `evergreen`, `civic-blue`, `plum`, and `teal`.
- `COLOR_ENGINE_THEME_PRESET_NAMES`: canonical display order for theme presets.
- `ColorEngineThemePresetName`, `ColorEngineThemePresetInput`, and `ColorEngineThemePreset`: public types for preset consumers.
- Presets use existing `ColorEngineInput` fields, explicit dark primary/status seeds where useful, and balanced seed policies; they do not add new generation concepts.
- Balanced example presets must have zero required APCA assertion failures.
- Text treatment strategies are named presets, not free-form overrides: `same-hue`, `neutral`, and `adaptive`. The default remains `same-hue`; `adaptive` selects from approved same-hue/neutral candidates by APCA coverage for soft colored surfaces.

Build/test scripts:

- `build`: `tsc -p tsconfig.json`
- `typecheck`: `tsc -p tsconfig.json --noEmit`
- `test`: builds `dist`, then runs TypeScript API-shape checks plus Node test runner package-boundary, surface/chrome/primary/status generation, seed policy, semantic alias, CSS output, APCA assertion, and representative preset/seed matrix checks

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

Status: first Web Component proof with bounded state recipes, explicit API/accessibility contract, and accepted foundation direction. Target runtime is a TypeScript library of Custom Elements that consume semantic CSS custom properties from the v2 color-engine CSS contract.

- Package folder: `packages/components`
- Package name: `@puzzlefactory/components`
- Runtime dependencies: none
- Dev-only test dependency: `playwright` for Chromium-backed DOM-runtime tests
- Current exports: `definePuzzleFactoryComponents`, `PfButtonElement`, `PfAlertElement`, `PUZZLEFACTORY_COMPONENT_TAG_NAMES`, and small public types for button variant, alert status, alert variant, and tag names
- Current custom elements:
  - `pf-button`: primary, secondary, and disabled button proof backed by an internal native `<button type="button">`, using semantic variables such as `--ds-primary-action-bg`, `--ds-primary-action-text`, `--ds-control-bg`, `--ds-control-border`, `--ds-control-text`, `--ds-text-muted`, and `--ds-primary-focus-ring`
  - `pf-alert`: non-interactive status-region proof using semantic status variables such as `--ds-danger-soft-bg`, `--ds-danger-soft-text`, `--ds-danger-solid-bg`, and matching warning/success/info roles
- Current public component API:
  - `pf-button`: `disabled` attribute/property, `variant` attribute/property with `primary` or `secondary`, `focus(options?)`, and `click()`. Programmatic `click()` delegates to the internal button only when enabled. Form participation, submit/reset behavior, `type`, `name`, `value`, `form`, and constraint validation are deferred.
  - `pf-alert`: `status` attribute/property with `danger`, `warning`, `success`, or `info`; `variant` attribute/property with `soft` or `solid`; optional `slot="title"` content. It renders an internal `role="status"` region and does not manage focus.
- Components must not import or call `@puzzlefactory/color-engine` or `createColorEngineTheme`; they depend on generated CSS being loaded by the consumer.
- Components should use semantic variables only. Primitive ramp variables such as `--ds-primary-light-solid-2`, `--ds-surface-light-1`, or `--ds-text-light-primary` remain out of component scope.
- Component color recipes should not use whole-element opacity, filters, `color-mix()`, or local color derivation. Disabled state currently resolves directly to neutral/control semantics (`--ds-control-bg`, `--ds-control-border`, and `--ds-text-muted`).
- Foundation direction: keep raw Custom Elements for simple display components and simple native-backed controls while the package remains small. Do not build complex form controls or ARIA-heavy interactions in raw Custom Elements by default.
- Before implementing inputs, selects, comboboxes, dialogs, popovers, menus, tabs, tooltips, or similar components, run a dedicated foundation spike comparing Lit plus platform APIs versus a white-label foundation such as Lion.
- React wrappers are a later consumer-ergonomics layer after core Custom Element APIs stabilize. React 19 support makes wrappers less urgent, but wrappers may still help with typed props, event names, and compatibility.
- Do not adopt Shoelace, Spectrum Web Components, Material Web, or another full component library as the foundation; they may be references only unless a future ADR supersedes this decision.

Build/test scripts:

- `build`: `tsc -p tsconfig.json`
- `typecheck`: `tsc -p tsconfig.json --noEmit`
- `test`: builds `dist`, then runs TypeScript API-shape checks plus Node test runner package-boundary, semantic-variable, state-recipe, API/accessibility contract, and Chromium-backed DOM-runtime checks
- `test:install-browsers`: `playwright install chromium`; run once in fresh environments when the Playwright browser binary is missing

## Apps

### `apps/kitchen-sink`

Status: React + Vite + React Router 7 verification shell wired to v2 neutral/surface/chrome/primary/status color-engine output, curated theme presets, theme-specific surface separation presets, theme-specific dark seeds, seed policy, text treatment strategies, generated semantic aliases, APCA assertion diagnostics, and the first component proof.

- Package name: `@puzzlefactory/kitchen-sink`
- Runtime stack: React 19, Vite 8, React Router 7
- Purpose: visual verification surface for the color engine and later token/theme/component states
- Current behavior: routed verification tool that consumes v2 `@puzzlefactory/color-engine`, injects generated CSS directly, switches `data-theme-v2`, registers `@puzzlefactory/components`, and displays curated theme preset controls, shared/light/dark surface separation controls with inherited shared fallback support, neutral/surface/chrome/text controls, separate light/dark primary and status seed controls, per-family seed policy controls, text treatment strategy controls, compact primitive ramps with seed anchor markers and light/dark seed-source notes, semantic text/chrome/surface/primary/status roles, generated CSS output sections, light/dark nested surface previews, primary action/link/focus previews, status soft/solid cards, text treatment comparison cards, foreground text usage samples, a Components route with `pf-button` and `pf-alert` rendered in light/dark theme boundaries, and an APCA assertion report grouped by theme and role. Current Kitchen Sink defaults use the exported `evergreen` theme preset and show 76/76 assertion pairs passing. When anchored policy is active, the assertion report identifies linked failures as seed-preservation tradeoffs rather than silent tuning opportunities.

### `apps/docs`

Status: placeholder folder only. Stack undecided.

## Figma Integration

Figma MCP is available in Claude Code sessions and can read design files, inspect tokens, and search the design system. The approach for bidirectional design/code sync is not yet defined.

## Distribution

Generated color CSS v2 is distributed directly from `@puzzlefactory/color-engine` for now. The package documents the supported consumer contract for `cssOutput.files`, primitive/theme file load order, `data-theme-v2`, build-once generation, persisted runtime generation, and blob-hosted tenant CSS.

Component distribution is still not fully decided. The current proof favors Web Components because they can consume the generated CSS contract from any framework, but broad packaging, CDN, and framework-wrapper decisions remain deferred.

## Open Questions

- Timing and package shape for optional React wrappers after core Custom Element APIs stabilize.
- Foundation choice for form controls and complex interactive components: Lit plus platform APIs, Lion, or another approved white-label foundation.
- Distribution mechanism — npm, CDN, monorepo-only?
- CSS fallback layer for browsers without `oklch()` support (explicitly out of scope for current phase, to be revisited)
- Bundle mode for consumers who cannot control CSS load order (explicitly out of scope for current phase)
