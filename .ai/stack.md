# Stack

## Global

- Monorepo: Turborepo
- Package manager: npm
- Package namespace: `@puzzlefactory`
- Workspaces: `packages/*` and `apps/*`
- Package folders are unscoped paths such as `packages/color-engine`; npm scope belongs in each package's `package.json` name.
- TypeScript: strict configuration by default
- TypeScript is a root devDependency shared by workspace package scripts.

## Packages

### `@puzzlefactory/color-engine`

Status: early validation, normalization, gamut, ramp, and harmony implementation. Target runtime is a TypeScript library. Current exports define the public API type surface, behavior-free entry point function type, validation error class, input validation helpers, seed format detection, seed normalization to OKLCH, linear gamut conversion/checking utilities, chroma reduction at constant L/H, light/dark ramp generation, and harmony palette descriptors. Primitive token assembly and theme generation are not implemented.

Runtime dependencies must remain zero except for the explicitly allowed seed-normalization boundary utility, if one is selected.

Build/test scripts:

- `build`: `tsc -p tsconfig.json`
- `typecheck`: `tsc -p tsconfig.json --noEmit`
- `test`: builds `dist`, then runs TypeScript API-shape checks plus Node test runner package-boundary and input-validation checks

#### Color Space

OKLCH throughout the engine and token layers. HSL was evaluated and rejected — perceptually non-uniform, not suitable for programmatic ramp generation. Agents should not reopen this choice.

#### TypeScript

Strict configuration. Full type definitions required for all engine inputs, outputs, and error types. Avoid `any`.

#### Dependency Policy

`@puzzlefactory/color-engine` must have zero runtime external dependencies — enforced at package level. The input normalization layer is the sole permitted exception and must have no transitive dependencies of its own. APCA must be implemented from the published specification, not pulled from npm.

### `@puzzlefactory/tokens`

Status: placeholder folder only. Target runtime is a TypeScript library/generator that consumes `EngineOutput`.

#### Token Format

- Primitive and semantic tokens output as CSS custom properties
- Six output files per theme variant, applied via `data-theme` attribute
- sRGB and P3 variants generated for all tokens
- P3 tokens use `color(display-p3 R G B)` string format — not `oklch()` — required for `@supports` guard to be meaningful
- Token themes: light, dark, high-contrast light (`data-theme="high-contrast"`), high-contrast dark (`data-theme="high-contrast-dark"`)

### `@puzzlefactory/components`

Not yet decided. Deferred until the color engine layer is complete. Web Components (Custom Elements) are a candidate for design system distribution — they present a clean attribute/slot/event API consumable by any framework.

## Apps

### `apps/kitchen-sink`

Status: React + Vite + React Router 7 verification shell.

- Package name: `@puzzlefactory/kitchen-sink`
- Runtime stack: React 19, Vite 8, React Router 7
- Purpose: verification and visual regression surface for the color engine, tokens, themes, and component states
- Current behavior: static routed shell with placeholder views only; does not implement or fake color-engine behavior

### `apps/docs`

Status: placeholder folder only. Stack undecided.

## Figma Integration

Figma MCP is available in Claude Code sessions and can read design files, inspect tokens, and search the design system. The approach for bidirectional design/code sync is not yet defined.

## Distribution

Not yet decided. Deferred until the component layer architecture is settled.

## Open Questions

- Component API shape — Web Components, React, or both?
- Distribution mechanism — npm, CDN, monorepo-only?
- CSS fallback layer for browsers without `oklch()` support (explicitly out of scope for current phase, to be revisited)
- Bundle mode for consumers who cannot control CSS load order (explicitly out of scope for current phase)
