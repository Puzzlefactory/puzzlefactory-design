# @puzzlefactory/react-components

React wrapper proof for the framework-neutral `@puzzlefactory/components` Custom Elements.

## Purpose

This package is a consumer ergonomics layer. It provides typed React components for the stable Custom Element proof without moving styling, color recipes, or behavior into React.

Current wrappers:

- `PfButton`
- `PfAlert`
- `PfBadge`
- `PfCard`

Importing the package registers the underlying Custom Elements through `definePuzzleFactoryComponents()`. Consumers can also call `definePuzzleFactoryReactComponents()` explicitly; it is the same registration function re-exported for React consumers.

## Usage

```tsx
import { PfAlert, PfBadge, PfButton, PfCard } from "@puzzlefactory/react-components";

export function Example() {
  return (
    <section data-theme-v2="light">
      <PfButton variant="secondary">Secondary</PfButton>
      <PfAlert status="success" title="Saved">
        Theme CSS loaded correctly.
      </PfAlert>
      <PfBadge status="warning" variant="solid">
        Pending
      </PfBadge>
      <PfCard title="Surface" footer="Semantic CSS variables only">
        Card content consumes the underlying Web Component styling.
      </PfCard>
    </section>
  );
}
```

## Contract

- Wrappers render the existing `pf-*` Custom Elements.
- Wrappers forward `ref` to the underlying custom element.
- Wrappers pass through `className`, `style`, `children`, and normal React HTML attributes.
- Wrappers expose typed props for the current Custom Element API:
  - `PfButton`: `variant`, `disabled`
  - `PfAlert`: `status`, `variant`, `title`
  - `PfBadge`: `status`, `variant`
  - `PfCard`: `variant`, `eyebrow`, `title`, `footer`
- Default values are normalized by omitting default attributes where the underlying Custom Element contract already treats absence as the default.
- Component styling remains owned by `@puzzlefactory/components` and generated semantic CSS variables.

## Boundaries

- No color-engine imports.
- No runtime color generation.
- No duplicated CSS recipes.
- No primitive ramp variables.
- No new Custom Element behavior.
- No form control or complex interactive behavior.
