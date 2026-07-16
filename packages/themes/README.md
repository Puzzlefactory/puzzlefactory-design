# @puzzlefactory/themes

Portable theme composition and artifact orchestration above `@puzzlefactory/color-engine`.

The package defines a versioned canonical theme source with theme identity, normalized color input, and exact header/sidebar/footer custom-role mappings. `normalizeThemeSource(...)` validates theme-owned fields and delegates color validation to the real color engine. `createThemeComposition(...)` adds resolved region semantics and APCA diagnostics. `createThemeArtifactBundle(...)` produces the canonical five CSS files, a convenience bundle, and a deterministic manifest from caller-supplied release metadata.

```ts
const composition = createThemeComposition(source);
const publication = createThemeArtifactBundle(composition, {
  version: "1.0.0",
  createdAt: "2026-07-16T12:00:00.000Z",
  createdBy: "system:theme-author",
});
```

Release metadata is explicit so identical source plus identical release input produces identical artifacts. The package does not generate timestamps, upload files, resolve tenants, or select active versions.

## Responsibility

`@puzzlefactory/themes` is the stable portable boundary for composed theme configuration and artifact orchestration.

It currently owns:

- normalized theme configuration schemas
- theme version metadata and manifest helpers
- complete header, sidebar, and footer custom-role treatment mappings
- composition helpers that call `@puzzlefactory/color-engine` for color output
- region APCA diagnostics
- deterministic multi-file CSS, bundle, and manifest artifacts

It may eventually add:

- full theme preset objects that combine color input with non-color token choices
- helpers that combine color artifacts with future typography, spacing, radius, elevation, density, and motion outputs
- build-time or publish-time helpers for writing generated theme artifacts to a local directory

## Non-Responsibilities

This package should not own:

- low-level color math or color ramp generation
- `@puzzlefactory/color-engine` runtime internals
- component CSS recipes
- tenant catalog persistence
- blob/CDN upload execution
- Azure credentials or deployment infrastructure
- app-specific theme switching behavior

## Current Boundary

Current v2 color CSS output still lives in `@puzzlefactory/color-engine`.

`@puzzlefactory/tokens` remains v1/reference-backed for now and is expected to become the broader token model later.

Theme Author consumes this package for normalized source composition, region resolution and diagnostics, and exact artifact previews. Kitchen Sink remains the lower-level engineering diagnostic app.
