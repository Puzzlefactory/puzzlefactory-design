# Workstream: Theme Authoring

Status: active
Created: 2026-06-15
Last Updated: 2026-07-16

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

Theme Authoring has a usable input editor, designer-facing preview, canonical artifact inspection, human-readable diagnostics, region semantic review, and a local publishing workflow at `apps/theme-author`. It is a separate React + Vite + React Router app with routes for Overview, Theme Input, Preview, Regions, Artifacts, Diagnostics, and Publishing. It imports `@puzzlefactory/color-engine` for curated inputs/editor types and delegates publishable theme normalization, resolved regions, APCA region diagnostics, and deterministic artifact/manifest generation to `@puzzlefactory/themes`. Theme Input can create, edit, enable/disable, and remove custom roles with role ID, light seed, optional dark seed, and seed policy controls; role ID errors and engine seed errors surface at the relevant role. Stable authoring keys preserve region selections when a role ID is renamed. Header, sidebar, and footer each select an enabled authored role and `soft` or `solid` treatment. Region labels use the quietest token that clears APCA 60 across rest and hover without opacity. Region borders remain part of the selected complete role treatment. Disabled roles remain editor drafts and are omitted from canonical source; incomplete mappings retain color preview but block composition-backed diagnostics and artifacts. A replaceable async repository port now supports tenant-scoped draft load/save with optimistic revisions and immutable publications. The browser-local adapter is development-only, and the publishing screen stores the exact bundle it previews. Production databases, Blob/CDN upload, active-version pointers, rollback, caching, tenant isolation enforcement, and application bootstrap remain consumer-owned.

Current supporting pieces exist:

- `@puzzlefactory/color-engine` can generate v2 color CSS output for light, dark, high-contrast, and high-contrast-dark themes.
- `@puzzlefactory/color-engine` exports `createColorEngineCssArtifacts(...)` and can write local generated artifacts through `npm run export:css --workspace @puzzlefactory/color-engine`.
- Kitchen Sink can inspect the active generated CSS/token output and remains the diagnostic lab.
- Custom color roles exist as generated color families and semantic aliases.
- APCA diagnostics exist for built-in and custom role text/background pairs.
- `@puzzlefactory/tokens` is still v1/reference-backed and not yet the v2 broader token model.
- `@puzzlefactory/themes` implements canonical theme source normalization, region composition, APCA region diagnostics, and deterministic artifact/manifest composition; Theme Author consumes it directly.

## Next Actions

- Review, bug-fix, refactor, and harden the completed theme composition and local persistence slices as a separate pass.
- Future feature work should start from a new planned slice, likely one of:
  - add designer-grade color picker/converter workflows using Color.js
  - add constrained border treatment/strength authoring if product review requires it
  - begin a consumer-owned tenant database/Blob/activation/bootstrap pilot without moving that infrastructure into this repo

## Completed Slices

- `TA-02`: Created `apps/theme-author` as a private React + Vite + React Router app with a thin designer-facing route shell and workspace scripts.
- `TA-03`: Added the first normalized theme input editor using existing color-engine curated presets, seed/policy/surface/text fields, real generator validation, and generated semantic CSS preview cards.
- `TA-04`: Replaced the compact preview cards with designer-facing generated theme review frames for light, dark, high-contrast, and high-contrast-dark output.
- `TA-05`: Added artifact inspection/export for generated CSS files, bundled CSS, and derived manifest metadata, with local copy/download controls.
- `TA-06`: Added human-readable APCA diagnostics with theme readiness, export guidance, required/advisory issue groups, per-theme coverage, and custom role notes.
- `TA-07`: Added initial region semantic mapping review for header, sidebar, and footer examples, backed by fixed custom roles and APCA region diagnostics.
- `TA-08`: Recorded the Color.js authoring-tooling decision and documented that Color.js belongs in Theme Authoring or authoring-support packages when needed, not in the core color-engine runtime by default.
- `TA-09`: Defined future `@puzzlefactory/themes` responsibilities and non-responsibilities before implementing the package.
- `TA-10`: Made custom roles and header/sidebar/footer region mappings editable, derived normalized color-engine input from enabled role drafts, added role-aware validation, updated previews/APCA diagnostics/artifacts, and included normalized input plus region mappings in the manifest.
- `TA-11`: Added an explicit contrast-safe region label text semantic, protected it from generic preview CSS, and expanded APCA coverage to label text on rest and hover backgrounds while keeping hierarchy typographic rather than opacity-based.
- `TA-12`: Replaced the fixed region-label foreground with per-theme contrast resolution. Region composition now orders same-polarity text candidates from muted to strong, uses the quietest token that clears APCA 60 across rest and hover, renders and diagnoses the same token, and keeps borders inside complete named role treatments.
- `TA-13`: Migrated canonical theme source, region resolution, APCA diagnostics, and artifact/manifest generation from app-local helpers to `@puzzlefactory/themes`; incomplete editor drafts retain color preview but cannot masquerade as publishable compositions.
- `TA-14`: Added tenant/theme identity plus a replaceable async persistence port, browser-local draft save/load with optimistic revisions, exact-bundle publication previews, immutable local versions, visible failure preservation, focused tests, and browser interaction/visual verification.

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
- **Color.js:** Color.js is approved for future Theme Authoring/dev tooling when a picker, converter, gamut preview, or color-space display slice needs it. It should be installed in `apps/theme-author` or a future authoring-support package, not in `@puzzlefactory/color-engine` runtime, unless a separate explicit architecture decision changes the zero-runtime-dependency core policy.

## Key Files

- `.ai/workstreams/theme-authoring.md`
- `apps/theme-author/`
- `docs/notes/direction-questions.md`
- `docs/about/theme-authoring.md`
- `docs/about/color-engine.md`
- `docs/about/tokens.md`
- `docs/about/themes.md`
- `docs/about/components.md`
- `packages/color-engine/README.md`
- `apps/kitchen-sink/`
- `packages/themes/`
