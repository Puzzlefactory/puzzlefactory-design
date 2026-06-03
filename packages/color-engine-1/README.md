# @puzzlefactory/color-engine-1

Reference copy of the first generative OKLCH color engine attempt.

This package will accept a seed color, harmony strategy, and mood, then produce primitive and semantic color data for light, dark, high-contrast light, and high-contrast dark themes.

Runtime dependencies should remain zero except for the explicitly allowed seed-normalization boundary utility, if one is selected.

## Status

Public API and type model scaffold only. The package exports the planned type surface for the color engine, plus a behavior-free entry point function type. It does not implement seed parsing, color conversion, ramp generation, APCA, semantic mapping, or CSS output.

## Scripts

- `npm run build --workspace @puzzlefactory/color-engine-1`
- `npm run typecheck --workspace @puzzlefactory/color-engine-1`
- `npm run test --workspace @puzzlefactory/color-engine-1`
