# About Theme Authoring

Theme Authoring is the designer-facing workflow for creating, reviewing, versioning, and exporting themes.

It is separate from Kitchen Sink:

- Kitchen Sink is the diagnostic lab for engine, token, and component internals.
- Theme Authoring is the guided workflow for humans creating usable theme inputs and generated artifacts.

## Current Responsibility

Theme Authoring may:

- edit normalized color-engine input
- preview generated light, dark, high-contrast, and high-contrast-dark output
- review APCA diagnostics in human language
- review region mappings for header, footer, sidebar, and similar surfaces
- inspect and export generated CSS files and `manifest.json`

Theme Authoring should not become the color engine itself, a tenant catalog, or a blob/CDN publisher.

## Color.js Direction

Color.js is approved for future Theme Authoring and development tooling when it provides clear value.

Good uses include:

- converting designer-provided hex, RGB, HSL, P3, LCH, or OKLCH colors into normalized OKLCH input
- validating and previewing gamut behavior
- powering color picker or color converter workflows
- showing alternate color-space representations
- supporting authoring-only diagnostics and visual education

Do not add Color.js to `@puzzlefactory/color-engine` runtime as part of Theme Authoring work. The core color engine remains zero-runtime-dependency unless a future explicit architecture decision changes that.

When a picker or converter slice needs Color.js, add it to the authoring app or a dedicated authoring-support package, not to the core engine by default.

Primary references:

- [Color.js official docs](https://colorjs.io/docs/)
- [Color.js overview and installation](https://colorjs.io/)
- [Color.js contrast docs](https://colorjs.io/docs/contrast)
