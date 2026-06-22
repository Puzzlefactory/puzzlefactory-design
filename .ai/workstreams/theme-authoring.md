# Workstream: Theme Authoring

Status: active
Created: 2026-06-15
Last Updated: 2026-06-20

Theme Authoring is the future designer-facing workflow for creating, reviewing, versioning, and exporting design-system themes. It is separate from Kitchen Sink: Kitchen Sink remains the diagnostic lab for engine, token, and component internals, while Theme Authoring should guide humans through a coherent theme creation and artifact export flow.

## Scope

In scope:

- Define and eventually build a separate Theme Authoring app/workflow, likely `apps/theme-author`.
- Provide a designer-facing experience for editing normalized theme input.
- Preview light, dark, high-contrast, and high-contrast-dark output.
- Review APCA diagnostics in human-readable terms.
- Preview and export CSS artifacts and `manifest.json`.
- Preserve normalized theme input as the source of truth.
- Support build-time generation for simple one-app/one-theme consumers.
- Support publish-time generation for tenant/client systems where themes change independently of app deploys.
- Use custom color roles and explicit region mappings for identity, accent, header, footer, promo, tenant, and workflow colors.
- Allow authoring/dev tooling dependencies such as Color.js if they provide clear value.

Out of scope:

- Turning Kitchen Sink into the authoring tool.
- Runtime generation on every request, render, or browser session as a recommended production path.
- Owning blob/CDN upload, Azure credentials, tenant catalog persistence, or deployment infrastructure.
- Making `@puzzlefactory/color-engine` a broad theme/token generator.
- Adding built-in secondary/accent roles by default.
- Adding arbitrary component props such as `tone="promo"` for custom roles.
- Implementing region-context component behavior before a dedicated slice.
- Adding Color.js to `@puzzlefactory/color-engine` runtime without a separate explicit decision.

## Current State

Theme Authoring now has a first usable input editor, designer-facing preview, artifact inspection surface, and human-readable diagnostics route at `apps/theme-author`. It is a separate React + Vite + React Router app with a workflow for Overview, Theme Input, Preview, Artifacts, and Diagnostics. It imports `@puzzlefactory/color-engine`, applies curated theme presets, holds normalized theme input state, validates that input through `createColorEngineTheme(...)`, injects generated semantic CSS, and previews light, dark, high-contrast, and high-contrast-dark output in realistic app-shell review frames with chrome, nested surfaces, controls, actions, and status treatments. Its Artifacts route previews the canonical generated CSS files, bundled CSS, and a derived `manifest.json`, with browser-local copy/download controls. Its Diagnostics route translates the existing APCA assertion report into readiness language, required/advisory issue groups, per-theme coverage, custom role notes when assertion output includes custom roles, thresholds, and export guidance. Current Theme Author input does not yet expose custom role editing, so custom-role diagnostics remain present as an output path but are not reachable from the current UI. The direction is captured in `docs/notes/direction-questions.md` and the `docs/about/*` package-boundary docs.

Current supporting pieces exist:

- `@puzzlefactory/color-engine` can generate v2 color CSS output for light, dark, high-contrast, and high-contrast-dark themes.
- `@puzzlefactory/color-engine` exports `createColorEngineCssArtifacts(...)` and can write local generated artifacts through `npm run export:css --workspace @puzzlefactory/color-engine`.
- Kitchen Sink can inspect the active generated CSS/token output and remains the diagnostic lab.
- Custom color roles exist as generated color families and semantic aliases.
- APCA diagnostics exist for built-in and custom role text/background pairs.
- `@puzzlefactory/tokens` is still v1/reference-backed and not yet the v2 broader token model.
- `@puzzlefactory/themes` is currently a placeholder package; it is the likely future home for full theme composition, presets, manifests, and artifact orchestration.

## Next Actions

- `TA-07`: Plan or implement initial region semantic mapping for header/footer/sidebar-style surfaces, with APCA diagnostics.
- `TA-08`: Decide whether Color.js should be added to Theme Authoring for color conversion/picker workflows.
- `TA-09`: Revisit `@puzzlefactory/themes` package responsibilities once authoring artifact needs are clearer.

## Completed Slices

- `TA-02`: Created `apps/theme-author` as a private React + Vite + React Router app with a thin designer-facing route shell and workspace scripts.
- `TA-03`: Added the first normalized theme input editor using existing color-engine curated presets, seed/policy/surface/text fields, real generator validation, and generated semantic CSS preview cards.
- `TA-04`: Replaced the compact preview cards with designer-facing generated theme review frames for light, dark, high-contrast, and high-contrast-dark output.
- `TA-05`: Added artifact inspection/export for generated CSS files, bundled CSS, and derived manifest metadata, with local copy/download controls.
- `TA-06`: Added human-readable APCA diagnostics with theme readiness, export guidance, required/advisory issue groups, per-theme coverage, and custom role notes.

## Completion Shape

This workstream is substantially complete when:

- Theme Authoring exists as a separate app/workflow from Kitchen Sink.
- A user can load or edit normalized theme input.
- A user can preview light, dark, high-contrast, and high-contrast-dark theme output.
- A user can review APCA diagnostics in human terms.
- A user can export generated CSS artifacts and `manifest.json`.
- The source-of-truth model is clear: normalized input is canonical; generated CSS is a versioned artifact.
- Package boundaries are clear across `color-engine`, `tokens`, `themes`, Kitchen Sink, and Theme Authoring.
- Region semantics and custom role usage are documented and tested enough to avoid ad hoc component color props.

## Blockers / Constraints

- Keep Kitchen Sink as the diagnostic lab; do not collapse it into Theme Authoring.
- Keep `@puzzlefactory/color-engine` color-specific and zero-runtime-dependency.
- Do not add Color.js or other dependencies to core packages without explicit authorization.
- Generated CSS artifacts are persistent products, not the editable source of truth.
- Blob/CDN publishing belongs to consumer infrastructure, not core package behavior.
- Components should stay clean and should not accept arbitrary custom role names for now.

## Key Decisions

- **Separate app/workflow:** Theme Authoring should be separate from Kitchen Sink. Kitchen Sink remains diagnostic; Theme Authoring is designer-facing.
- **Source of truth:** Normalized theme input is canonical. Generated CSS files and manifests are derived artifacts.
- **Generation modes:** Build-time generation and publish-time generation should be supported. Request-time/render-time generation is not the recommended production consumer path.
- **Publishing ownership:** This repo should generate files and metadata but not own blob/CDN upload or tenant infrastructure.
- **Artifact shape:** Multi-file CSS remains canonical. A bundled CSS file can be a convenience artifact when low effort.
- **Manifest:** Generated artifacts should include a documented `manifest.json`; consumers can use it but are not required to.
- **Custom roles:** Custom color roles handle secondary/accent/identity flexibility for now. Do not add built-in secondary/accent roles by default.
- **Region contexts:** Header/footer/sidebar-style region mappings should use complete role/treatment pairs and add APCA diagnostics for region text/background pairs.
- **Color.js:** Color.js is allowed in authoring/dev tooling if useful; core color-engine runtime remains zero-dependency for now.

## Key Files

- `.ai/workstreams/theme-authoring.md`
- `apps/theme-author/`
- `docs/notes/direction-questions.md`
- `docs/about/color-engine.md`
- `docs/about/tokens.md`
- `docs/about/themes.md`
- `docs/about/components.md`
- `packages/color-engine/README.md`
- `apps/kitchen-sink/`
- `packages/themes/`
