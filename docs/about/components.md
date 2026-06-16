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

Current components assume the stable `--ds-*` semantic variable contract. Changing the component-facing namespace requires a separate explicit token/component compatibility decision.

## Future Direction

Simple display and native-backed components may stay raw Custom Elements.

Form controls and moderately complex interactive components should follow the foundation direction in ADR 0002 before implementation.

## Region Contexts

Components should not accept arbitrary custom color role props such as `tone="promo"` by default.

If a component needs to adapt inside a colored header, footer, sidebar, or other themed area, the preferred future model is an explicit region context:

```html
<header data-pf-region="header">
  <pf-button>Sign in</pf-button>
</header>
```

The region context can remap contextual component tokens in one bounded place:

```css
[data-pf-region="header"] {
  --pf-button-bg: var(--ds-header-action-bg);
  --pf-button-text: var(--ds-header-action-text);
}
```

This keeps component APIs predictable. Theme configuration decides how region semantics map to custom color roles, and the theme layer owns APCA diagnostics for those region text/background pairs.
