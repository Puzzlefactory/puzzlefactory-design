# Workstream: Tenant Theme Publishing Foundation

Status: closed
Created: 2026-07-16
Last Updated: 2026-07-16

This workstream turns the current color engine and Theme Author proofs into a reusable, persistence-ready theme composition boundary. It deliberately completes the portable design-system side before a consuming application such as Kultera owns tenant databases, Blob upload, active-version pointers, and runtime bootstrap behavior.

## Scope

In scope:

- implement the first real `@puzzlefactory/themes` package
- define a versioned canonical theme source with identity, normalized color input, and header/sidebar/footer mappings
- validate theme identity, schema version, custom-role references, and complete region mappings
- compose color-engine output, resolved region semantics, and APCA region diagnostics
- create deterministic CSS, bundle, and manifest artifacts with schema/engine/release metadata
- migrate Theme Author from app-local composition and manifest helpers to `@puzzlefactory/themes`
- define a persistence-facing Theme Author port and a browser-local adapter for load/save/version/publish workflow verification
- preserve normalized theme source as canonical and generated CSS as derived artifacts

Out of scope:

- Kultera tenant database or API implementation
- Azure Blob/CDN upload, credentials, container provisioning, or tenant catalog changes
- production active-theme pointers, rollout, cache invalidation, or application bootstrap
- v2 broader-token migration, typography/spacing/radius/elevation/density/motion authoring
- component-library expansion or arbitrary custom-role component properties

## Current State

`TTP-01` through `TTP-05` and the requested hardening pass are implemented and verified. `@puzzlefactory/themes` is a real TypeScript workspace package with a versioned canonical theme source, theme identity validation, exact header/sidebar/footer role-treatment mappings, normalized color-engine input, runtime-safe source shape checks, resolved region semantics, APCA region diagnostics, and deterministic CSS/bundle/manifest artifacts with explicit theme/color-engine/release metadata. Custom roles are normalized in locale-independent code-unit order. Theme Author delegates publishable source composition, region resolution, region diagnostics, and artifact/manifest generation to that package while retaining editor-only stable role keys, disabled drafts, and temporary incomplete mapping state. A replaceable async repository port supports tenant-scoped load/save with optimistic draft revisions and immutable publication versions. Its browser-local development adapter deeply validates stored drafts and publications, stores canonical manifest/artifact data instead of duplicated engine composition, recomposes publications to detect tampering, rejects revision rollover, and guards delayed persistence results across committed tenant/theme identity changes. The publishing screen passes the exact preview bundle to the repository, which persists its canonical publication products. Full build/test/typecheck/lint and dependency audit pass; browser review and Chromium app tests cover the authoring and diagnostic apps. Production persistence, Blob upload, activation, rollback, caching, and bootstrap remain consumer-owned.

The implementation is planned as independently verified commits:

- `TTP-01`: canonical theme schema, normalization, and validation
- `TTP-02`: region composition, diagnostics, manifest, and artifact bundle
- `TTP-03`: Theme Author migration to `@puzzlefactory/themes`
- `TTP-04`: persistence port plus browser-local draft/version/publication workflow
- `TTP-05`: full verification, visual review, and durable closeout

## Next Actions

- If a consumer pilot is authorized later, create a consumer-owned workstream for database/Blob/active-pointer/runtime-loader concerns rather than expanding this package workstream.

## Completion Shape

This workstream is substantially complete when:

- applications can depend on one documented `@puzzlefactory/themes` API rather than assembling color-engine and region details themselves
- canonical theme source and derived artifact contracts are versioned and deterministic
- invalid theme IDs, schema versions, role references, region mappings, and color input fail with actionable validation errors
- Theme Author previews, diagnostics, and exports use package composition output
- Theme Author can save/load drafts and create immutable local publication versions through a replaceable persistence port
- Kitchen Sink remains the engineering diagnostic app and `@puzzlefactory/color-engine` remains zero-runtime-dependency

All completion-shape conditions and the independent hardening review are complete for the portable design-system foundation.

## Verification

- `npm run lint` — passed on 2026-07-16
- `npm run build` — passed across all eight workspaces on 2026-07-16
- `npm test` — passed across all workspace suites, including Chromium-backed Theme Author, Kitchen Sink, and component tests, on 2026-07-16
- `npm run typecheck` — passed across all eight workspaces on 2026-07-16
- `npm audit --audit-level=high` — passed with zero vulnerabilities on 2026-07-16
- Theme Author browser review — passed at 1280 × 720 for authoring, regions, publishing, and error states; no browser console warnings or errors
- Review status — independent review completed; all findings were fixed and re-review approved with no remaining actionable findings

## Blockers / Constraints

- Generated CSS is never the editable source of truth.
- `@puzzlefactory/themes` may depend on `@puzzlefactory/color-engine`, but must not absorb tenant persistence, Azure, or application runtime behavior.
- Manifest generation must be reproducible; timestamps and release IDs are caller-supplied rather than generated implicitly.
- Region mappings use complete named role treatments and do not create arbitrary component color APIs.
- Production persistence and distribution require a later consumer-owned workstream.

## Key Decisions

- **Portable boundary first:** Stabilize the package and authoring contract before implementing a Kultera adapter.
- **Canonical source:** A versioned normalized theme source owns theme identity, resolved color input, and exact region mappings. Disabled editor-only role drafts remain outside published source.
- **Version separation:** Theme schema version and color-engine contract version describe compatibility; caller-supplied release metadata describes an immutable publication.
- **Replaceable persistence:** Theme Author talks to a small persistence port. Browser-local storage is a development adapter, not the production architecture.

## Key Files

- `packages/themes/`
- `packages/color-engine/src/index.ts`
- `apps/theme-author/src/`
- `.ai/workstreams/theme-authoring.md`
- `.ai/workstreams/color-engine-v2.md`
