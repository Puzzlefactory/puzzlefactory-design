# @puzzlefactory/color-engine

Generative OKLCH color engine.

This package will accept a seed color, harmony strategy, and mood, then produce primitive and semantic color data for light, dark, high-contrast light, and high-contrast dark themes.

Runtime dependencies should remain zero except for the explicitly allowed seed-normalization boundary utility, if one is selected.

## Status

Package boundary scaffold only. The public API currently exports type placeholders so downstream work can establish imports without implying implemented engine behavior.

## Scripts

- `npm run build --workspace @puzzlefactory/color-engine`
- `npm run typecheck --workspace @puzzlefactory/color-engine`
- `npm run test --workspace @puzzlefactory/color-engine`
