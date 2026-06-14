# About Components

Components consume the stable semantic token contract.

They should not:

- call color generation internals
- own color generation recipes
- depend on primitive ramp names by default
- locally derive theme colors with filters, opacity, or color transforms unless explicitly authorized

## Current Direction

The current proof uses simple Web Components in `@puzzlefactory/components`, plus React wrappers in `@puzzlefactory/react-components`.

Component styling should use semantic CSS custom properties such as:

```css
background: var(--ds-primary-action-bg);
color: var(--ds-primary-action-text);
border-color: var(--ds-control-border);
```

The exact namespace may be configurable by the generated theme output.

## Future Direction

Simple display and native-backed components may stay raw Custom Elements.

Form controls and moderately complex interactive components should follow the foundation direction in ADR 0002 before implementation.
