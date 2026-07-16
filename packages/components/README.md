# @puzzlefactory/components

Minimal Web Component proof for the PuzzleFactory design system.

This package currently proves that components can consume the v2 color-engine CSS contract without importing or calling color-generation internals.

Current custom elements:

- `pf-button`: primary, secondary, and disabled button proof backed by a native internal `<button>`.
- `pf-alert`: status alert proof with `danger`, `warning`, `success`, and `info` statuses plus `soft` and `solid` variants.
- `pf-badge`: compact status label proof with `danger`, `warning`, `success`, and `info` statuses plus `soft` and `solid` variants.
- `pf-card`: surface/chrome/text composition proof with default and raised surface variants.

Components use semantic CSS custom properties such as `--ds-primary-action-bg`, `--ds-primary-action-text`, `--ds-surface-*`, `--ds-text-*`, and status semantic variables. They do not use primitive ramp variables directly.

## Usage

```ts
import { definePuzzleFactoryComponents } from "@puzzlefactory/components";

definePuzzleFactoryComponents();
```

```html
<pf-button>Primary action</pf-button>
<pf-button variant="secondary">Secondary action</pf-button>
<pf-button disabled>Disabled action</pf-button>

<pf-alert status="success">
  <span slot="title">Saved</span>
  Theme CSS is loaded through the color-engine v2 contract.
</pf-alert>

<pf-badge status="warning">Needs review</pf-badge>

<pf-card variant="raised">
  <span slot="eyebrow">System</span>
  <span slot="title">Theme output</span>
  Surface, border, and text roles are semantic variables.
  <span slot="footer">Generated CSS only</span>
</pf-card>
```

The consuming app must load generated v2 CSS from `@puzzlefactory/color-engine` and set `data-theme-v2="light"` or `data-theme-v2="dark"` on the theme boundary.

## Component API Contract

This package is still a proof, not a complete component library. The current contract is intentionally narrow.

### `pf-button`

`pf-button` is backed by a real native `<button type="button">` inside shadow DOM. It uses native button behavior for ordinary pointer, keyboard, disabled, focus, and accessible-name behavior where the platform provides it.

Supported API:

| API | Values | Notes |
| --- | --- | --- |
| `variant` attribute/property | `primary` or `secondary` | Defaults to `primary`; setting the property to `primary` removes the attribute. |
| `disabled` attribute/property | boolean | Reflected to the internal native button. |
| `aria-label` attribute | string | Forwarded to the internal native button and takes precedence over slotted text for its accessible name. |
| `focus(options?)` | `FocusOptions` | Delegates to the internal native button when available. |
| `click()` | none | Delegates to the internal native button when enabled; disabled buttons do not dispatch a click through this method. |
| Slotted content | text or inline phrasing content | Provides the button's visible label and, when `aria-label` is absent, accessible name. |

Deferred native/form behavior:

- `pf-button` is not currently a form-associated custom element.
- It does not submit or reset forms.
- It does not expose native button `type`, `name`, `value`, `form`, `formAction`, `formMethod`, or constraint-validation behavior.
- Full form participation requires an explicit future slice using `ElementInternals` or another approved foundation.

### `pf-alert`

`pf-alert` is a non-interactive status-region proof. It renders an internal element with `role="status"` and uses slotted content for title/body content.

Supported API:

| API | Values | Notes |
| --- | --- | --- |
| `status` attribute/property | `danger`, `warning`, `success`, or `info` | Defaults to `info`; setting the property to `info` removes the attribute. |
| `variant` attribute/property | `soft` or `solid` | Defaults to `soft`; setting the property to `soft` removes the attribute. |
| `slot="title"` | any phrasing content | Optional title content. |

`pf-alert` is not a dialog, toast manager, or assertive alert. It does not manage focus.

### `pf-badge`

`pf-badge` is a compact non-interactive status label proof. It is intended for visual labels, counts, and small status markers. It does not announce changes, manage focus, or behave like a notification.

Supported API:

| API | Values | Notes |
| --- | --- | --- |
| `status` attribute/property | `danger`, `warning`, `success`, or `info` | Defaults to `info`; setting the property to `info` removes the attribute. |
| `variant` attribute/property | `soft` or `solid` | Defaults to `soft`; setting the property to `soft` removes the attribute. |
| Slotted content | text or inline phrasing content | Provides the visible badge label. |

### `pf-card`

`pf-card` is a non-interactive surface composition proof. It validates that surface, border, and text semantic variables can compose a reusable container without reaching into primitive ramp variables.

Supported API:

| API | Values | Notes |
| --- | --- | --- |
| `variant` attribute/property | `default` or `raised` | Defaults to `default`; setting the property to `default` removes the attribute. |
| `slot="eyebrow"` | any phrasing content | Optional compact metadata above the title. |
| `slot="title"` | any phrasing content | Optional title content. |
| default slot | any content | Body content. |
| `slot="footer"` | any phrasing content | Optional footer content. |

`pf-card` is not an interactive disclosure, link, button, or landmark by default.

## Accessibility Direction

Simple components should prefer native HTML behavior under the hood. Complex interactive components such as select, combobox, dialog, popover, menu, tabs, tooltip, and form fields require an explicit foundation decision before implementation.

## Scripts

- `npm run build --workspace @puzzlefactory/components`
- `npm run typecheck --workspace @puzzlefactory/components`
- `npm run test --workspace @puzzlefactory/components`
- `npm run test:install-browsers --workspace @puzzlefactory/components`

The test script includes Chromium-backed DOM-runtime tests for Custom Elements and Shadow DOM behavior. If Playwright reports that Chromium is missing in a fresh environment, run the browser-install script once before rerunning the package tests.
