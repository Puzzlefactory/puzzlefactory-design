# About `@puzzlefactory/tokens`

`@puzzlefactory/tokens` is the expected future home for the stable design-token model.

The package can include color token names, but its purpose is broader than color. It should be able to model and eventually generate non-color token categories such as:

- typography
- font families
- type scale
- font weights
- line heights
- spacing
- gaps
- density
- control heights
- border widths
- border radius
- elevation and shadows
- breakpoints
- motion
- z-index layers
- component sizing relationships
- harmony presets for size and spacing relationships

## Relationship To Color

Color values should come from `@puzzlefactory/color-engine`.

`@puzzlefactory/tokens` may define the stable token language that consumers use, and may eventually assemble CSS across color and non-color token categories. It should not replace the color engine's color generation responsibilities.

## Designer Authoring

A future designer-facing authoring UI could use the token model to change semantic design settings that shape components:

- border radius
- density
- spacing
- gaps
- elevation
- typography
- breakpoint choices
- sizing harmony

Those settings can produce persistent CSS artifacts, but they are a broader token concern, not a color-engine concern.

## Current State

The current `@puzzlefactory/tokens` package is still v1/reference-backed. It has not yet been migrated to the v2 color-engine output.
