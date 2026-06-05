# ADR 0001: Component Foundation Direction

## Status

Accepted

## Context

The design system now has a credible color-engine v2 CSS contract and a small `@puzzlefactory/components` proof with `pf-button` and `pf-alert`. These components are raw Custom Elements, consume semantic CSS custom properties only, and keep the package at zero runtime dependencies.

The next component work needs a foundation decision before adding form controls or complex interactive components. The main forces are:

- The generated CSS contract should remain framework-agnostic.
- React consumption matters because Kitchen Sink and likely early consumers are React apps.
- Future form controls need native-like form behavior, validation, labels, events, and accessibility.
- The project should avoid adopting another visual design system as its component foundation.
- Runtime dependencies should stay zero or low unless they buy enough accessibility and maintenance leverage.

Relevant primary references:

- MDN: [`ElementInternals`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) allows custom elements to participate in forms.
- React: [React 19](https://react.dev/blog/2024/12/05/react-19) supports custom elements and assigns matching properties on the client.
- Lit: [components](https://lit.dev/docs/components/overview/) are custom elements with rendering, reactive properties, scoped styles, and lifecycle support.
- Lit: [`@lit/react`](https://lit.dev/docs/frameworks/react/) can create React wrappers for custom elements.
- Lion: [form system](https://lion.js.org/fundamentals/systems/form/overview/) provides white-label form/control foundations.
- [Shoelace](https://shoelace.style/), [Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/), and [Material Web](https://material-web.dev/) are complete component libraries/design systems, not neutral foundations for this project. Material Web also documents maintenance mode.

Options considered:

| Option | Fit | Main Tradeoff |
| --- | --- | --- |
| Raw Custom Elements with native controls | Best fit for the current proof and simple components. Keeps framework portability and zero runtime dependencies. | Accessibility/form complexity becomes project-owned quickly for non-trivial controls. |
| Lit-based Web Components | Strong candidate when the component set needs templating, reactive properties, lifecycle ergonomics, or maintainable form/control internals. Still preserves the Custom Element model. | Adds a runtime dependency and a framework choice before the current simple proof needs it. |
| React components | Best ergonomics for React-only applications. | Loses framework portability and would move the design system away from the CSS/custom-element contract already proven. |
| Web Components plus React wrappers | Good consumer ergonomics once Custom Element APIs stabilize. React 19 reduces the urgency, but wrappers can still improve typing and event APIs. | Adds a second package/surface that must not duplicate behavior or styling. |
| Lion or similar white-label foundations | Serious candidate for future form controls because it focuses on reusable form/control behavior rather than a complete visual design system. | Needs a dedicated spike and dependency decision before adopting. |
| Shoelace, Spectrum Web Components, Material Web, or similar full libraries | Useful references for API, accessibility, and component coverage. | They bring their own design language, theming assumptions, and component architecture; not a neutral foundation for PuzzleFactory components. |

## Decision

Keep `@puzzlefactory/components` as a raw Custom Elements package for the near term, but limit raw implementation to simple display components and simple native-backed controls.

Recommended near-term path:

1. Continue raw Custom Elements for small proof components such as button, alert/status panel, badge, card/panel, and other low-interaction components.
2. Keep component styling based on semantic `--ds-*` CSS custom properties. Components must not call the color engine or consume primitive ramp variables.
3. Keep `@puzzlefactory/components` zero-runtime-dependency while the component set remains simple.
4. Do not build complex form controls or ARIA-heavy interactions in raw Custom Elements by default.
5. Before implementing inputs, selects, comboboxes, dialogs, popovers, menus, tabs, tooltips, or similar components, run a dedicated foundation spike comparing Lit plus platform APIs versus a white-label foundation such as Lion.
6. Treat React wrappers as a separate consumer-ergonomics layer after the core Custom Element APIs stabilize. React 19 reduces the urgency, but wrappers may still be useful for typed props, event names, and older React/support constraints.
7. Do not adopt Shoelace, Spectrum Web Components, Material Web, or another full library as the component foundation. They may be references, but they bring their own design system and theming model.

## Consequences

This keeps the current proof honest and low-risk:

- The core component contract remains framework-portable.
- The CSS/token contract remains the center of the design system.
- Simple components can continue without new runtime dependencies.
- Kitchen Sink can keep verifying the real browser behavior of Custom Elements.

This also creates explicit boundaries:

- Form controls and complex interactive widgets are blocked on a future foundation spike.
- Raw Custom Elements are not treated as a blanket answer for accessibility-heavy components.
- React wrappers are not rejected, but they are not the foundation and should not duplicate styling or behavior.
- Full external component libraries are rejected as foundations unless a future ADR supersedes this decision.
