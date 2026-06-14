# About `@puzzlefactory/color-engine`

`@puzzlefactory/color-engine` is a specialized color generator.

It owns color-specific generation and diagnostics:

- color primitives
- generated color role families
- color semantic aliases
- color diagnostics such as APCA reports
- color CSS artifacts

It should not become a broad theme engine or a generator for every design token category.

## Preferred Language

Use these terms when discussing the package:

- color engine
- color primitives
- color semantics
- color roles
- color CSS artifacts

Avoid describing the color engine as the owner of all design tokens.

## Current Output Shape

The v2 color engine currently generates:

- `primitives.css`
- `theme-light.css`
- `theme-dark.css`
- `theme-high-contrast.css`
- `theme-high-contrast-dark.css`
- a combined CSS string for compatibility
- artifact metadata through `createColorEngineCssArtifacts(...)`

The package can write local generated CSS files for inspection with:

```sh
npm run export:css --workspace @puzzlefactory/color-engine
```

That output is local and ignored by git. Real tenant/client theme artifacts should be persisted through a future theme publishing flow, not committed as package source.

## Boundary

The color engine generates color values and color aliases. It does not own typography, spacing, radius, border, shadow, density, motion, or component sizing decisions.

Those broader decisions belong to the token and theme layers.
