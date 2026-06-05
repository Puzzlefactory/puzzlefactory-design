# @puzzlefactory/tokens

Token output layer for the preserved v1 color-engine reference path.

This package currently consumes `EngineOutput` from `@puzzlefactory/color-engine-1` and renders the v1 CSS custom property files:

- `tokens.css`
- `tokens-p3.css`
- `theme-light.css`
- `theme-dark.css`
- `theme-high-contrast.css`
- `theme-high-contrast-dark.css`

It is not the v2 consumer integration path yet. V2 generated CSS is currently produced directly by `@puzzlefactory/color-engine` through `cssOutput.files`, `cssOutput.primitives`, `cssOutput.themes.light`, `cssOutput.themes.dark`, `cssOutput.all`, and `output.css`.

Do not migrate consumers from v2 `@puzzlefactory/color-engine` output into this package until a future explicit migration slice defines that contract.
