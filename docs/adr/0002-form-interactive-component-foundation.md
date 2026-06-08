# ADR 0002: Form And Interactive Component Foundation

## Status

Accepted

## Context

ADR 0001 allowed raw Custom Elements for simple display components and simple native-backed controls, then deliberately blocked form controls and complex interactive widgets on a later foundation spike. That spike is now complete.

The project has:

- a v2 generated CSS contract consumed through semantic custom properties;
- a zero-runtime-dependency `@puzzlefactory/components` proof with simple raw Custom Elements;
- a `@puzzlefactory/react-components` wrapper proof for React ergonomics; and
- a need to avoid building inaccessible or brittle form and interaction behavior by hand.

Primary references reviewed:

- MDN: [`ElementInternals`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) is the platform API that lets custom elements participate in forms.
- W3C WAI: [ARIA Authoring Practices Guide patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) define expected behavior for widgets such as combobox, dialog, menu, tabs, tooltip, and related patterns.
- Lit: [components overview](https://lit.dev/docs/components/overview/) describes Lit components as standard custom elements with reactive updates, templates, styles, and lifecycle support.
- Lit: [React integration](https://lit.dev/docs/frameworks/react/) documents wrapper utilities for React consumers when custom-element APIs need typed props or event mapping.
- React: [React 19](https://react.dev/blog/2024/12/05/react-19) includes improved custom element support and assigns matching client-side properties where available.
- Lion: [form system overview](https://lion.js.org/fundamentals/systems/form/overview/) documents a white-label form/control system.
- [Shoelace](https://shoelace.style/), [Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/), and [Material Web](https://material-web.dev/) were reviewed as complete component-library references. Material Web also notes maintenance mode.

Options considered:

| Option | Fit | Main Tradeoff |
| --- | --- | --- |
| Raw Custom Elements plus platform APIs | Best fit for current simple components and native-backed proofs. Keeps framework portability and zero runtime dependencies. | The project owns form association, constraint validation, labeling, events, focus, and ARIA behavior. Risk rises quickly for anything beyond native-backed controls. |
| Lit-based Web Components plus platform APIs | Best near-term candidate for PuzzleFactory-owned form and moderately interactive components. Preserves Custom Elements and the CSS contract while reducing lifecycle, property, rendering, and Shadow DOM boilerplate. | Adds a runtime dependency and a new authoring foundation. Adoption should happen through an explicit implementation slice. |
| Lion or similar white-label foundation | Serious candidate if a full form system becomes too heavy to build correctly. It is closer to a behavior foundation than a visual design system. | Larger dependency and architecture commitment. Needs a focused proof before adoption. |
| React-only components | Good React ergonomics. | Not the right core foundation because it weakens framework portability and shifts the design system away from the generated CSS plus Custom Element contract. |
| Web Components plus React wrappers | Already useful as consumer ergonomics for stable elements. | Wrappers must remain thin and must not own styling, accessibility behavior, or color logic. |
| Full libraries such as Shoelace, Spectrum Web Components, or Material Web | Useful references for API shape, coverage, accessibility behavior, and tests. | They bring their own design language, token model, component architecture, and product assumptions; they are not neutral PuzzleFactory foundations. |

## Decision

Keep `@puzzlefactory/components` raw for the existing simple proof components and future low-interaction display/native-backed components.

For the first new form control or complex interactive component, prefer a Lit-based Web Component implementation backed by platform APIs such as `ElementInternals` where needed. Lit is the recommended first implementation candidate because it preserves the Custom Element model and generated CSS contract while reducing the amount of project-owned rendering, property reflection, lifecycle, and Shadow DOM code.

Do not add Lit in this decision slice. A future implementation slice must explicitly approve the dependency, add the package wiring, and prove the first component.

Use Lion as the fallback or benchmark if the Lit plus platform approach exposes too much form-system burden. Before adopting Lion, run a narrow proof against a realistic form-control scenario.

React wrappers remain a separate consumer-ergonomics layer over Custom Elements. They should not become the source of component behavior, styling, or accessibility semantics.

Full component libraries such as Shoelace, Spectrum Web Components, and Material Web remain references only unless a future ADR supersedes this decision.

Required boundaries for future form/interactive work:

- Any form-associated component must explicitly document form participation, `name`, `value`, disabled behavior, validation, labels, events, and reset behavior.
- Any APG-heavy widget must identify the WAI-ARIA pattern it implements and include browser-runtime tests for keyboard, focus, state, and event behavior before acceptance.
- Components must continue consuming semantic CSS custom properties directly and must not import color-generation internals.
- Raw Custom Elements remain acceptable only when the component is simple enough that native platform semantics carry the accessibility behavior.

Recommended backlog:

1. Future component slice: Lit form-control prototype. Add Lit as an explicit dependency and build one narrow native-like form control proof using the generated CSS contract.
2. Future component slice: React wrapper runtime tests if wrappers move beyond the current proof.
3. Future component slice: Lion comparison only if the Lit prototype shows the project is rebuilding too much form-system infrastructure.

Note: CE2-23 preset/custom-role differentiation was completed after this ADR was accepted. It is no longer a future component-foundation backlog item.

## Consequences

This narrows the risk:

- Simple existing components keep their low-dependency raw Custom Element implementation.
- Form and interaction complexity is not treated as "just more raw DOM."
- The generated CSS contract and framework portability remain the core design-system contract.
- The project has an explicit dependency gate before Lit or Lion is introduced.

This also accepts some cost:

- The first real form-control slice will need a dependency decision and more browser-runtime testing.
- Lit does not remove the need to understand platform form APIs or WAI-ARIA behavior; it only makes component authoring more maintainable.
- React wrappers remain a second surface to test if component APIs become more complex.
