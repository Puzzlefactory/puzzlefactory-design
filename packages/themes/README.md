# @puzzlefactory/themes

Portable theme composition and artifact orchestration above `@puzzlefactory/color-engine`.

The first package slice defines a versioned canonical theme source with theme identity, normalized color input, and exact header/sidebar/footer custom-role mappings. `normalizeThemeSource(...)` validates theme-owned fields, delegates color validation to the real color engine, and returns the resolved source suitable for persistence or later artifact composition.

## Intended Responsibility

`@puzzlefactory/themes` is expected to become the home for composed theme configuration and artifact orchestration.

It may eventually own:

- full theme preset objects that combine color input with non-color token choices
- normalized theme configuration schemas
- theme version metadata and manifest helpers
- region mapping schemas for header, footer, sidebar, navigation, promo, tenant, or workflow surfaces
- composition helpers that call `@puzzlefactory/color-engine` for color output
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

Theme Authoring still uses `@puzzlefactory/color-engine` directly while the package is built in focused slices. A later slice will migrate region composition, diagnostics, and artifact manifests here.
