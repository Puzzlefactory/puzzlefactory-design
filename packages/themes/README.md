# @puzzlefactory/themes

Future theme composition package.

This package is intentionally still a placeholder. It should not be implemented until a slice explicitly authorizes the first real theme-composition API.

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

Theme Authoring currently uses `@puzzlefactory/color-engine` directly. A future implementation can introduce `@puzzlefactory/themes` once there is enough non-color theme composition to justify a separate package.
