# @puzzlefactory/components

Minimal Web Component proof for the PuzzleFactory design system.

This package currently proves that components can consume the v2 color-engine CSS contract without importing or calling color-generation internals.

Current custom elements:

- `pf-button`: primary and secondary button proof.
- `pf-alert`: status alert proof with `danger`, `warning`, `success`, and `info` statuses plus `soft` and `solid` variants.

Components use semantic CSS custom properties such as `--ds-primary-action-bg`, `--ds-primary-action-text`, `--ds-surface-*`, `--ds-text-*`, and status semantic variables. They do not use primitive ramp variables directly.

## Usage

```ts
import { definePuzzleFactoryComponents } from "@puzzlefactory/components";

definePuzzleFactoryComponents();
```

```html
<pf-button>Primary action</pf-button>

<pf-alert status="success">
  <span slot="title">Saved</span>
  Theme CSS is loaded through the color-engine v2 contract.
</pf-alert>
```

The consuming app must load generated v2 CSS from `@puzzlefactory/color-engine` and set `data-theme-v2="light"` or `data-theme-v2="dark"` on the theme boundary.

## Scripts

- `npm run build --workspace @puzzlefactory/components`
- `npm run typecheck --workspace @puzzlefactory/components`
- `npm run test --workspace @puzzlefactory/components`
