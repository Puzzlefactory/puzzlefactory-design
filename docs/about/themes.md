# About `@puzzlefactory/themes`

`@puzzlefactory/themes` is the expected future home for composed theme configurations and presets.

A full theme may combine:

- color-engine input and generated color output
- typography choices
- density settings
- spacing scales
- elevation scales
- radius and border choices
- motion choices
- component defaults
- generated artifact metadata

Theme composition should combine design-system decisions without forcing the color engine to own those decisions.

## Intended Package Responsibilities

When implemented, `@puzzlefactory/themes` should sit above the color engine and token packages.

It may own:

- full theme preset/configuration objects
- theme input version metadata
- region mapping schemas for header, footer, sidebar, navigation, tenant, promo, and workflow surfaces
- manifest helpers and artifact metadata helpers
- build-time or publish-time local artifact orchestration
- composition helpers that call `@puzzlefactory/color-engine`
- future integration with broader token output from `@puzzlefactory/tokens`

It should not own low-level color math, ramp generation, component state recipes, tenant catalog storage, blob/CDN upload, credentials, or deployment behavior.

Until the package is implemented, Theme Authoring can continue to consume `@puzzlefactory/color-engine` directly.

## Persistent Artifacts

For tenant or client use, generated theme output should become persistent artifacts.

A likely production model is:

- tenant catalog stores normalized theme input, active version, and artifact metadata
- blob/CDN storage stores generated CSS files and a manifest
- applications load CSS files by versioned URL

Example artifact set:

```txt
primitives.css
theme-light.css
theme-dark.css
theme-high-contrast.css
theme-high-contrast-dark.css
manifest.json
```

Package `dist/` directories should remain for compiled package code. Tenant-generated theme CSS should be stored in a generated artifact location, blob storage, CDN storage, or another explicit theme publishing target.

## Runtime Generation

Runtime generation is useful for authoring tools, previews, and admin workflows.

Production applications should generally load persisted CSS artifacts instead of regenerating a theme on every request or render.

## Theme Authoring Tool

Theme Authoring should be a separate app and workstream from Kitchen Sink.

Kitchen Sink remains the diagnostic lab for engine, token, and component internals. Theme Authoring should be the designer-facing workflow for creating, reviewing, versioning, and exporting themes.

The first authoring pass should stay narrow:

- edit color-engine input
- preview light, dark, high-contrast, and high-contrast-dark output
- review APCA diagnostics in human terms
- export CSS artifacts and `manifest.json`
- preserve normalized input as the source of truth

## Regions And Custom Color Roles

Custom color roles are the preferred flexibility path for identity, secondary, accent, promo, tenant, workflow, header, footer, and similar colors.

Do not assume built-in secondary or accent roles are required just because a design needs another color. A theme can define named custom roles and then map those roles to region semantics.

Example future concept:

```txt
header:
  source: role.institution.solid
  bg: role-institution-solid-bg
  text: role-institution-solid-text
  border: role-institution-solid-bg-pressed

footer:
  source: role.footer.solid
  bg: role-footer-solid-bg
  text: role-footer-solid-text
  border: role-footer-solid-bg-pressed
```

Region mappings should choose complete role/treatment pairs, not arbitrary mismatched individual colors. If a region maps `bg`, `text`, `link`, or action colors, the theme layer must also define APCA diagnostic pairs for those text/background relationships.
