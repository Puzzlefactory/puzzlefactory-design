# @puzzlefactory/color-engine

Color engine v2 for generating product UI color primitives, semantic aliases, diagnostic APCA assertions, and load-order-ready CSS.

The current v2 model uses compact usage-specific ramps, separate neutral/light-surface/dark-surface seeds, optional theme-specific surface separation presets, independent foreground/text primitives, primary and status usage families, curated example presets, and structured CSS output.

Runtime dependencies must remain zero.

## Basic Usage

```ts
import {
  COLOR_ENGINE_CSS_LOAD_ORDER,
  createColorEngineCssArtifacts,
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
console.log(createColorEngineCssArtifacts(output));
```

Seeds may be hex strings or `oklch(...)` strings. OKLCH is the preferred authoring format when a designer needs more precise control.

## CSS Output Contract

`createColorEngineTheme(input)` returns a `ColorEngineOutput`. The supported v2 CSS contract is:

- `output.cssOutput.primitives`: the `:root` primitive custom property rule.
- `output.cssOutput.themes.light`: semantic custom properties for `[data-theme-v2="light"]`.
- `output.cssOutput.themes.dark`: semantic custom properties for `[data-theme-v2="dark"]`.
- `output.cssOutput.themes["high-contrast"]`: fixed high-contrast semantic custom properties for `[data-theme-v2="high-contrast"]`.
- `output.cssOutput.themes["high-contrast-dark"]`: fixed high-contrast-dark semantic custom properties for `[data-theme-v2="high-contrast-dark"]`.
- `output.cssOutput.files`: ordered CSS file records for `primitives.css`, light/dark theme CSS, and high-contrast theme CSS.
- `output.cssOutput.all`: all CSS files joined in canonical load order.
- `output.css`: compatibility alias for `output.cssOutput.all`.

Each `cssOutput.files` entry has this shape:

```ts
interface ColorEngineCssFile {
  readonly fileName:
    | "primitives.css"
    | "theme-light.css"
    | "theme-dark.css"
    | "theme-high-contrast.css"
    | "theme-high-contrast-dark.css";
  readonly kind: "primitives" | "theme";
  readonly theme?: "light" | "dark" | "high-contrast" | "high-contrast-dark";
  readonly css: string;
}
```

For static publishing, `createColorEngineCssArtifacts(output)` wraps those same ordered file records with deployment metadata:

```ts
const artifacts = createColorEngineCssArtifacts(output);

for (const artifact of artifacts) {
  console.log(artifact.fileName, artifact.byteLength, artifact.contentHash);
}
```

Each artifact preserves the original file fields and adds:

```ts
interface ColorEngineCssArtifact extends ColorEngineCssFile {
  readonly byteLength: number;
  readonly contentHash: `fnv1a32-${string}`;
}
```

`contentHash` is a small deterministic package hash for artifact identity and cache metadata. It is not a security or integrity hash.

The canonical order is exported as `COLOR_ENGINE_CSS_LOAD_ORDER`:

```ts
[
  "primitives.css",
  "theme-light.css",
  "theme-dark.css",
  "theme-high-contrast.css",
  "theme-high-contrast-dark.css",
];
```

Load primitives before theme aliases:

```html
<link rel="stylesheet" href="/themes/acme/v42/primitives.css" />
<link rel="stylesheet" href="/themes/acme/v42/theme-light.css" />
<link rel="stylesheet" href="/themes/acme/v42/theme-dark.css" />
<link rel="stylesheet" href="/themes/acme/v42/theme-high-contrast.css" />
<link rel="stylesheet" href="/themes/acme/v42/theme-high-contrast-dark.css" />
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
- `data-theme-v2="high-contrast"`
- `data-theme-v2="high-contrast-dark"`

Theme switching should update the same attribute on the application root or theme boundary:

```ts
document.documentElement.dataset.themeV2 = "high-contrast-dark";
```

High-contrast v2 themes are fixed outputs. They do not use tenant primary, status, surface, or custom-role seeds to tune the palette. This is intentional: high contrast should be an optimized accessibility mode, not another brand/theme variant. Built-in roles and custom roles still receive semantic aliases in high-contrast themes, but those aliases point to conservative fixed high-contrast primitives.

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

## Custom Roles

Custom roles are planned tenant/theme-scoped color extensions for needs such as `pending`, `promo`, `billing`, or `onboarding`. They are separate from the stable built-in roles:

- `primary`
- `danger`
- `warning`
- `success`
- `info`

The current package accepts and validates `customRoles` input, returns normalized metadata on `output.customRoles`, generates compact light/dark soft and solid custom role families, emits semantic `--ds-role-*` aliases in the generated theme CSS, and includes custom role soft/solid pairs in the diagnostic APCA report.

```ts
const output = createColorEngineTheme({
  customRoles: {
    pending: {
      seed: "oklch(0.62 0.12 280)",
      darkSeed: "oklch(0.7 0.1 280)",
      seedPolicy: "anchored",
    },
  },
});

console.log(output.customRoles.pending.cssVariables["solid-bg"]);
// "--ds-role-pending-solid-bg"
```

This generates primitive families such as:

```css
--ds-role-pending-light-soft-1
--ds-role-pending-light-solid-2
--ds-role-pending-dark-soft-1
--ds-role-pending-dark-solid-2
```

And semantic aliases such as:

```css
--ds-role-pending-soft-bg: var(--ds-role-pending-light-soft-1);
--ds-role-pending-solid-bg: var(--ds-role-pending-light-solid-2);
```

The same alias names are emitted in light and dark theme files, with each theme pointing to its matching light or dark generated family.

Custom role ids must be lowercase kebab-case names that start with a letter. Reserved built-in role and core namespace ids are rejected:

- `primary`
- `danger`
- `warning`
- `success`
- `info`
- `surface`
- `text`
- `chrome`
- `border`

The semantic aliases for each custom role are:

```css
--ds-role-{id}-soft-bg
--ds-role-{id}-soft-bg-hover
--ds-role-{id}-soft-border
--ds-role-{id}-soft-text
--ds-role-{id}-solid-bg
--ds-role-{id}-solid-bg-hover
--ds-role-{id}-solid-bg-pressed
--ds-role-{id}-solid-text
```

Use `createCustomColorRoleCssAliasName`, `createCustomColorRoleCssAliasNames`, `createCustomColorRoleCssVariableName`, or `createCustomColorRoleCssVariableNames` when another package needs stable custom role alias names.

Custom role APCA assertions are added only when custom roles are configured. Each role adds light, dark, high-contrast, and high-contrast-dark checks for:

- `role-{id}-soft-text` on `role-{id}-soft-bg`
- `role-{id}-soft-text` on `role-{id}-soft-bg-hover`
- `role-{id}-solid-text` on `role-{id}-solid-bg`
- `role-{id}-solid-text` on `role-{id}-solid-bg-hover`
- `role-{id}-solid-text` on `role-{id}-solid-bg-pressed`

These assertions use the existing soft and solid status thresholds and remain diagnostic; they do not enforce or auto-tune theme output.

The engine's state-aware report also checks `text-primary`, `text-secondary`, and `text-muted` against every generated rest, hover, selected, and pressed surface level in light and dark themes. This keeps quiet text semantic and opaque while detecting contrast loss caused by interactive background changes. The public `createContrastAssertionReport(...)` helper preserves its legacy report when surface presets are omitted; engine callers pass the resolved presets to opt into the expanded state-aware report.

## Generation Models

### Build Once

Build-once generation is the recommended production path for approved tenant or product themes:

1. Store the normalized theme input in a catalog or source-controlled config.
2. Generate `primitives.css`, `theme-light.css`, `theme-dark.css`, `theme-high-contrast.css`, and `theme-high-contrast-dark.css`.
3. Store the generated CSS at a versioned path.
4. Load those CSS files from the application shell.

This gives stable artifacts, simple cache busting, and no color-generation work during normal page rendering.

For local inspection, the package can write the default generated files to an ignored output directory:

```sh
npm run export:css --workspace @puzzlefactory/color-engine
```

By default this writes `packages/color-engine/.generated/default/` with the five CSS files plus `manifest.json`. Pass an output directory after `--` to write somewhere else:

```sh
npm run export:css --workspace @puzzlefactory/color-engine -- ../../tmp/acme-theme
```

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
<link rel="stylesheet" href="https://cdn.example.com/themes/acme/2026-06-04/theme-high-contrast.css" />
<link rel="stylesheet" href="https://cdn.example.com/themes/acme/2026-06-04/theme-high-contrast-dark.css" />
```

Use immutable or versioned paths for cache busting. This avoids redeploying the static application every time a tenant theme changes.

## Relationship To `@puzzlefactory/tokens`

`@puzzlefactory/color-engine` is the v2 consumer path for generated CSS today.

`@puzzlefactory/tokens` is still v1/reference-backed. It currently consumes `@puzzlefactory/color-engine-1` output and is not the v2 CSS integration path. Do not route v2 application consumption through `@puzzlefactory/tokens` until a future explicit migration slice changes that package.

## Current Limits

- No tenant-tuned high-contrast palette is emitted; high-contrast v2 uses fixed optimized light and dark outputs.
- No tenant storage API, caching layer, or deployment package is included.
- No browser fallback CSS for consumers without `oklch()` support is emitted yet.
- The component proof consumes the v2 semantic CSS contract, but broader component integration is still early.
- Custom role CSS and diagnostic APCA assertions are emitted, including fixed high-contrast aliases.
- APCA assertions are diagnostic guidance, not hard enforcement.

## Scripts

- `npm run build --workspace @puzzlefactory/color-engine`
- `npm run export:css --workspace @puzzlefactory/color-engine`
- `npm run typecheck --workspace @puzzlefactory/color-engine`
- `npm run test --workspace @puzzlefactory/color-engine`
