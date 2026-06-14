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
