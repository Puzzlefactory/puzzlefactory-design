# @puzzlefactory/color-engine

Color engine v2 for generating product UI color primitives, semantic aliases, diagnostic APCA assertions, and load-order-ready CSS.

The current v2 model uses compact usage-specific ramps, separate neutral/light-surface/dark-surface seeds, optional theme-specific surface separation presets, independent foreground/text primitives, primary and status usage families, curated example presets, and structured CSS output.

Runtime dependencies must remain zero.

## Basic Usage

```ts
import {
  COLOR_ENGINE_CSS_LOAD_ORDER,
  createColorEngineTheme,
} from "@puzzlefactory/color-engine";

const output = createColorEngineTheme({
  neutralSeed: "oklch(0.86 0.012 255)",
  surfaceLightSeed: "oklch(0.94 0.01 255)",
  surfaceDarkSeed: "oklch(0.12 0.012 255)",
  primarySeed: "oklch(0.47 0.12 150)",
  primaryDarkSeed: "oklch(0.64 0.11 150)",
  preset: "standard",
  lightSurfacePreset: "standard",
  darkSurfacePreset: "layered",
});

console.log(COLOR_ENGINE_CSS_LOAD_ORDER);
console.log(output.cssOutput.files);
```

Seeds may be hex strings or `oklch(...)` strings. OKLCH is the preferred authoring format when a designer needs more precise control.

## CSS Output Contract

`createColorEngineTheme(input)` returns a `ColorEngineOutput`. The supported v2 CSS contract is:

- `output.cssOutput.primitives`: the `:root` primitive custom property rule.
- `output.cssOutput.themes.light`: semantic custom properties for `[data-theme-v2="light"]`.
- `output.cssOutput.themes.dark`: semantic custom properties for `[data-theme-v2="dark"]`.
- `output.cssOutput.files`: ordered CSS file records for `primitives.css`, `theme-light.css`, and `theme-dark.css`.
- `output.cssOutput.all`: all CSS files joined in canonical load order.
- `output.css`: compatibility alias for `output.cssOutput.all`.

Each `cssOutput.files` entry has this shape:

```ts
interface ColorEngineCssFile {
  readonly fileName: "primitives.css" | "theme-light.css" | "theme-dark.css";
  readonly kind: "primitives" | "theme";
  readonly theme?: "light" | "dark";
  readonly css: string;
}
```

The canonical order is exported as `COLOR_ENGINE_CSS_LOAD_ORDER`:

```ts
["primitives.css", "theme-light.css", "theme-dark.css"];
```

Load primitives before theme aliases:

```html
<link rel="stylesheet" href="/themes/acme/v42/primitives.css" />
<link rel="stylesheet" href="/themes/acme/v42/theme-light.css" />
<link rel="stylesheet" href="/themes/acme/v42/theme-dark.css" />
```

Consumers that cannot manage multiple files can load or inline `output.cssOutput.all` instead. The bundled string is convenient, but separate files are the clearer production contract because primitives and theme aliases have explicit responsibilities.

## Theme Attribute Contract

V2 semantic CSS is selected with `data-theme-v2`.

```html
<html data-theme-v2="light">
  ...
</html>
```

Supported values today:

- `data-theme-v2="light"`
- `data-theme-v2="dark"`

Theme switching should update the same attribute on the application root or theme boundary:

```ts
document.documentElement.dataset.themeV2 = "dark";
```

The engine does not emit high-contrast v2 CSS yet.

## Consuming Semantic Tokens

Application CSS should use semantic custom properties, not primitive ramp names, unless it is building a low-level theme inspection tool.

```css
.button {
  background: var(--ds-primary-action-bg);
  color: var(--ds-primary-action-text);
  border-color: var(--ds-control-border);
}

.panel {
  background: var(--ds-surface-2);
  color: var(--ds-text-primary);
  border: 1px solid var(--ds-border-default);
}

.danger-message {
  background: var(--ds-danger-soft-bg);
  color: var(--ds-danger-soft-text);
  border-color: var(--ds-danger-soft-border);
}
```

The default namespace is `ds`, producing variables such as `--ds-surface-1`. Pass `namespace` to `createColorEngineTheme` only when a consumer needs a different variable prefix.

## Generation Models

### Build Once

Build-once generation is the recommended production path for approved tenant or product themes:

1. Store the normalized theme input in a catalog or source-controlled config.
2. Generate `primitives.css`, `theme-light.css`, and `theme-dark.css`.
3. Store the generated CSS at a versioned path.
4. Load those CSS files from the application shell.

This gives stable artifacts, simple cache busting, and no color-generation work during normal page rendering.

### Runtime Generation

Runtime generation is useful for theme editors, tenant admin tooling, previews, or systems where a tenant theme can change without redeploying the application.

Runtime generation should still be treated as artifact generation: create the CSS once for a theme version, persist it, and serve the persisted CSS to clients. Avoid regenerating theme CSS on every render or every request unless the calling app is explicitly a local preview tool.

## Tenant and Blob-Hosted CSS

For a tenant catalog, keep two pieces of data:

- the normalized color-engine input and policy settings
- generated CSS artifact metadata, such as theme version, file names, URLs, and optional hash

Blob-hosted generated CSS is a viable deployment model. For Azure Static Web Apps or any static app shell, generate CSS outside the static app build, write it to blob storage or a CDN-backed asset location, and load it by URL:

```html
<link rel="stylesheet" href="https://cdn.example.com/themes/acme/2026-06-04/primitives.css" />
<link rel="stylesheet" href="https://cdn.example.com/themes/acme/2026-06-04/theme-light.css" />
<link rel="stylesheet" href="https://cdn.example.com/themes/acme/2026-06-04/theme-dark.css" />
```

Use immutable or versioned paths for cache busting. This avoids redeploying the static application every time a tenant theme changes.

## Relationship To `@puzzlefactory/tokens`

`@puzzlefactory/color-engine` is the v2 consumer path for generated CSS today.

`@puzzlefactory/tokens` is still v1/reference-backed. It currently consumes `@puzzlefactory/color-engine-1` output and is not the v2 CSS integration path. Do not route v2 application consumption through `@puzzlefactory/tokens` until a future explicit migration slice changes that package.

## Current Limits

- No high-contrast v2 CSS output is emitted yet.
- No tenant storage API, caching layer, or deployment package is included.
- No browser fallback CSS for consumers without `oklch()` support is emitted yet.
- No component package consumes the v2 contract yet.
- APCA assertions are diagnostic guidance, not hard enforcement.

## Scripts

- `npm run build --workspace @puzzlefactory/color-engine`
- `npm run typecheck --workspace @puzzlefactory/color-engine`
- `npm run test --workspace @puzzlefactory/color-engine`
