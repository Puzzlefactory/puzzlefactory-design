# Direction Questions

This file tracks open direction questions and the current answers. Keep the original questions visible so later decisions can be compared against the initial framing.

## Original Questions

1. Should `@puzzlefactory/color-engine` remain the direct CSS generator, or should `@puzzlefactory/tokens` become the public consumer-facing package?

2. Is `@puzzlefactory/tokens` meant to mean “design token concepts/types,” “generated CSS files,” or both?

3. Should generated theme presets/artifacts live under `@puzzlefactory/color-engine`, `@puzzlefactory/tokens`, or a future `@puzzlefactory/themes` package?

4. Do consumer apps load static CSS files only, or should runtime generation remain a supported production path?

5. For tenant themes, is the source of truth the normalized theme input, the generated CSS artifacts, or both?

6. Should blob storage publishing be inside this repo as a script/helper, or should this repo only generate files and let another service upload them?

7. Do we want a single all-in-one CSS file as a first-class output, or should multi-file load order remain the preferred production model?

8. Should `manifest.json` become a stable public contract?

9. Should components consume only semantic CSS variables, or should they ever receive role names like `tone="promo"` and map those to custom role variables?

10. Should secondary/accent/custom identity colors be built-in roles, or should custom color roles handle that flexibility?

11. Should Theme Authoring Tool be a separate app/workstream before deeper component work?

12. Should Color.js be allowed in authoring/dev tools while keeping the engine runtime zero-dependency?

## Current Answers

### 1. Color Engine Boundary

`@puzzlefactory/color-engine` stays narrow and color-specific.

It owns color primitives, generated color role families, color semantic aliases, color diagnostics, and color CSS artifacts. It should not become the broad theme engine or the owner of every design token category.

### 2. Tokens Package Boundary

`@puzzlefactory/tokens` owns the broader design-token model and generation direction.

It can include color token names, but it should also be able to model non-color categories such as typography, spacing, density, border radius, borders, elevation, shadows, motion, breakpoints, and sizing harmony.

Color values should still come from `@puzzlefactory/color-engine`.

### 3. Theme Presets And Artifacts

Full theme presets and generated theme artifact orchestration should eventually belong in `@puzzlefactory/themes`.

Current color-only presets can stay in `@puzzlefactory/color-engine` for now because they are source color configurations, not full design-system themes.

### 4. Consumer Loading And Runtime Generation

Support both build-time generation and publish-time generation, but consumer apps should load persisted static CSS artifacts.

- Build-time generation is supported for simple one-app/one-theme use cases.
- Publish-time generation is supported for tenant/client systems where themes change independently of app deploys.
- Consumer apps should load generated static CSS files.
- Request-time or render-time generation is not the recommended production path.

### 5. Tenant Theme Source Of Truth

The normalized tenant theme input is the source of truth.

Generated CSS artifacts are versioned products derived from that source. They are important, persistent, cacheable, and useful for rollback, but they should not become the canonical editable source.

A tenant theme version should store enough information to regenerate and audit output later:

- normalized input
- generator/package version
- generated artifact metadata
- created/updated timestamps
- author or actor metadata where available

### 6. Blob/CDN Publishing Responsibility

This repo should generate files and metadata, but should not own blob/CDN publishing as core behavior.

Publishing has too many consumer-specific variables: Azure credentials, storage account layout, CDN rules, cache headers, tenant catalog shape, rollout/rollback strategy, access control, and deployment topology.

Future docs or examples may show common publishing patterns, and future packages may define adapter interfaces, but upload/publish execution belongs to the consuming app or infrastructure.

### 7. Single CSS Versus Multi-File Output

Support both multi-file and single bundled CSS artifacts when the extra effort stays small.

Multi-file output remains the canonical structured output:

- `primitives.css`
- `theme-light.css`
- `theme-dark.css`
- `theme-high-contrast.css`
- `theme-high-contrast-dark.css`

A single bundled CSS file can be a first-class convenience artifact for simple one-app/one-theme consumers.

### 8. Manifest Contract

Generated theme artifacts should include a documented `manifest.json`.

Consumers are not required to use it; CSS files should remain directly consumable by known file name and load order. The manifest is the stable metadata contract for tools, catalogs, publishing workflows, debugging, and cache validation.

### 9. Component Color Role Consumption

Components should stay clean and simple. They consume stable semantic CSS variables and built-in component variants only.

Custom color roles are exposed as generated CSS variables for app-level, region-level, or local CSS use. Components should not accept arbitrary role names such as `tone="promo"` for now.

Future component color adaptation should happen through explicit theme or region contexts, not ad hoc component props.

### 10. Secondary, Accent, And Custom Identity Colors

Do not add built-in secondary or accent roles for now.

Use custom color roles to handle flexible identity, secondary, accent, header, footer, promo, tenant, and workflow colors. This avoids guessing universal semantics for colors that vary heavily by product and tenant.

If a future pattern proves universal enough to deserve a built-in role, it can be reconsidered then. For now, custom roles plus explicit theme/region mappings are the intended flexibility path.

### 11. Theme Authoring Tool

Yes. Theme Authoring Tool should be a separate app and workstream before major component expansion.

Kitchen Sink remains the diagnostic lab for engine, token, and component internals. Theme Authoring should become the designer-facing workflow for creating, reviewing, versioning, and exporting themes.

The first Theme Authoring work should be narrow: planning/scaffold, color-engine input editing, light/dark/high-contrast preview, artifact export, manifest preview, and human-readable APCA review.

### 12. Color.js In Tooling

Color.js is approved for authoring and dev tooling if it provides clear value.

Good uses include color picker support, color conversion, gamut checks, designer input validation, color-space previews, authoring UI utilities, and dev-only diagnostics.

Install it in `apps/theme-author` or a future authoring-support package when an implementation slice needs picker/converter/gamut-preview behavior. Do not install it in `@puzzlefactory/color-engine` by default.

`@puzzlefactory/color-engine` runtime remains zero-runtime-dependency for now. If the core generator later needs stronger color-space support than the internal helpers can responsibly maintain, bringing Color.js into the core should be a separate explicit decision.

## Region Context Direction

Some theme surfaces, such as headers, footers, sidebars, or nav bars, may need color treatments distinct from the global surface or primary action color.

Those should be modeled as explicit region semantics, not arbitrary component role props.

Example future concept:

```txt
header:
  source: role.institution.solid
  bg: role-institution-solid-bg
  text: role-institution-solid-text
  border: role-institution-solid-bg-pressed
```

Components inside that region should inherit contextual component tokens from the region scope. They should not each receive custom color props.

Every region text/background mapping introduced by the theme layer needs an APCA diagnostic pair, such as `header-text on header-bg`.

## Open Questions

None from the original list. New questions should be added as they come up.
