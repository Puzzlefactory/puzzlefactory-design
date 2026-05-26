# Stack

## Monorepo

Turborepo. Package namespace is `@ds/`. Workspaces are `packages/@ds/*` and `apps/*`.

## Color Space

OKLCH throughout the engine and token layers. HSL was evaluated and rejected — perceptually non-uniform, not suitable for programmatic ramp generation. Agents should not reopen this choice.

## Token Format

- Primitive and semantic tokens output as CSS custom properties
- Six output files per theme variant, applied via `data-theme` attribute
- sRGB and P3 variants generated for all tokens
- P3 tokens use `color(display-p3 R G B)` string format — not `oklch()` — required for `@supports` guard to be meaningful
- Token themes: light, dark, high-contrast light (`data-theme="high-contrast"`), high-contrast dark (`data-theme="high-contrast-dark"`)

## TypeScript

Strict configuration. Full type definitions required for all engine inputs, outputs, and error types. Avoid `any`.

## Dependency Policy

`@ds/engine` must have zero runtime external dependencies — enforced at package level. The input normalization layer is the sole permitted exception and must have no transitive dependencies of its own. APCA must be implemented from the published specification, not pulled from npm.

## Component API Shape

Not yet decided. Deferred until the color engine layer is complete. Web Components (Custom Elements) are a candidate for design system distribution — they present a clean attribute/slot/event API consumable by any framework.

## Figma Integration

Figma MCP is available in Claude Code sessions and can read design files, inspect tokens, and search the design system. The approach for bidirectional design/code sync is not yet defined.

## Distribution

Not yet decided. Deferred until the component layer architecture is settled.

## Open Questions

- Component API shape — Web Components, React, or both?
- Distribution mechanism — npm, CDN, monorepo-only?
- CSS fallback layer for browsers without `oklch()` support (explicitly out of scope for current phase, to be revisited)
- Bundle mode for consumers who cannot control CSS load order (explicitly out of scope for current phase)
