# Workstream: Tenant Theme Publishing Foundation

Status: closing
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

`TTP-01` through `TTP-05` are implemented and verified. `@puzzlefactory/themes` is a real TypeScript workspace package with a versioned canonical theme source, theme identity validation, exact header/sidebar/footer role-treatment mappings, normalized color-engine input, runtime-safe source shape checks, resolved region semantics, APCA region diagnostics, deterministic CSS/bundle/manifest artifacts, and explicit theme/color-engine/release metadata. Theme Author delegates publishable source composition, region resolution, region diagnostics, and artifact/manifest generation to that package while retaining editor-only stable role keys, disabled drafts, and temporary incomplete mapping state. A replaceable async repository port supports tenant-scoped load/save with optimistic draft revisions and immutable publication versions. Its browser-local adapter is explicitly a development workflow adapter; the publishing screen previews and stores the same precomputed artifact bundle so publication cannot diverge from review. Full repository build/test/typecheck passed, and browser review covered role authoring validation, region editing/contrast, draft save/load, immutable publication, and visible failure preservation with no console errors. Production persistence, Blob upload, activation, rollback, caching, and bootstrap remain consumer-owned.

The implementation is planned as independently verified commits:

- `TTP-01`: canonical theme schema, normalization, and validation
- `TTP-02`: region composition, diagnostics, manifest, and artifact bundle
- `TTP-03`: Theme Author migration to `@puzzlefactory/themes`
- `TTP-04`: persistence port plus browser-local draft/version/publication workflow
- `TTP-05`: full verification, visual review, and durable closeout

## Next Actions

- Perform the user-requested review, bug-fix, refactor, and hardening pass over the completed implementation.
- If a consumer pilot is authorized later, create a consumer-owned workstream for database/Blob/active-pointer/runtime-loader concerns rather than expanding this package workstream.
- Continue through later slices without expanding into consumer infrastructure.

## Completion Shape

This workstream is substantially complete when:

- applications can depend on one documented `@puzzlefactory/themes` API rather than assembling color-engine and region details themselves
- canonical theme source and derived artifact contracts are versioned and deterministic
- invalid theme IDs, schema versions, role references, region mappings, and color input fail with actionable validation errors
- Theme Author previews, diagnostics, and exports use package composition output
- Theme Author can save/load drafts and create immutable local publication versions through a replaceable persistence port
- Kitchen Sink remains the engineering diagnostic app and `@puzzlefactory/color-engine` remains zero-runtime-dependency

All completion-shape conditions are met for the portable design-system foundation. The workstream remains `closing` only because the implementation review/refactor phase was intentionally deferred until all slices were complete.

## Verification

- `npm run build` — passed across all eight workspaces on 2026-07-16
- `npm test` — passed across all workspace suites on 2026-07-16
- `npm run typecheck` — passed across all eight workspaces on 2026-07-16
- Theme Author browser review — passed at 1280 × 720 for authoring, regions, publishing, and error states; no browser console warnings or errors
- Review status — implementation review/refactor remains pending by user direction

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
