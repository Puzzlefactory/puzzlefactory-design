# Durable Decisions

This file is a rolling index of currently binding decisions. Use ADRs in `docs/adr/` for full rationale when a decision needs more context.

## Active Decisions

- `.ai/` is the committed durable context area for cross-agent instructions, rolling project context, decisions, and active workstreams.
- `context.md` and `decisions.md` are rolling current-state files, not dated archives.
- Use workstream files for active flow state; workstreams are updated in-place, not appended.
- Use ADRs for significant process or architecture decisions.
- Use disposable task files for Tier 1 and Tier 2 work; completed tasks must update the relevant workstream and then be deleted.
- Active task files live under `.ai/tasks/` and are ignored by git.
- Use `@puzzlefactory` as the package namespace. Prefer explicit package names such as `@puzzlefactory/color-engine` over generic names such as `@puzzlefactory/engine`.
- Use unscoped workspace folders such as `packages/color-engine`; do not nest package folders under `packages/@puzzlefactory/`.
- Reusable prompt templates live under `.ai/prompt-templates/`; agent startup should only point to the directory, not require reading templates every session.
- Root agent entry files are thin shims; `.ai/instructions.md` owns the workflow and decides which linked files are read for each task type.
- Use a conditional `.ai` reading flow: always read `.ai/context.md` and `.ai/decisions.md`, then read stack, coordination, task, and workstream files only when the selected flow calls for them.
- Color engine v1 is closed as reference. Its broad generic ramp generation model is rejected for future implementation.
- Color engine v2 starts visual-first with compact usage-specific ramps, separate neutral/light-surface/dark-surface seeds, named presets, and kitchen-sink visualization from the first slice.
- Preserve the first color-engine implementation as `packages/color-engine-1` / `@puzzlefactory/color-engine-1`; the active `packages/color-engine` / `@puzzlefactory/color-engine` package is v2.
- Soft colored surface text treatment is controlled by named strategies (`same-hue`, `neutral`, `adaptive`) rather than broad per-token overrides. The default remains `same-hue` until visual review justifies changing it.
- Foreground/text primitives are independent from surface primitives in color-engine v2. Normal text semantics and primary/status solid on-color text must resolve from dedicated near-black/near-white text families, not from reused surface tokens.
- Light and dark surface separation may use different named presets in color-engine v2. The shared `preset` remains the fallback for compatibility; `lightSurfacePreset` and `darkSurfacePreset` override it when provided.
- V2 generated CSS is consumed directly from `@puzzlefactory/color-engine` for now. Consumers load `primitives.css`, then `theme-light.css`, `theme-dark.css`, `theme-high-contrast.css`, and `theme-high-contrast-dark.css` in `COLOR_ENGINE_CSS_LOAD_ORDER`, and select semantics with `data-theme-v2="light"`, `data-theme-v2="dark"`, `data-theme-v2="high-contrast"`, or `data-theme-v2="high-contrast-dark"`. High-contrast v2 output is fixed and optimized rather than tenant-seed-tuned. Static artifact metadata is created with `createColorEngineCssArtifacts(...)`; the package-level `export:css` script writes the default five CSS files and manifest to an ignored local folder for inspection. `@puzzlefactory/tokens` remains v1/reference-backed until an explicit migration slice changes it.
- The first component proof uses Web Components / Custom Elements in `@puzzlefactory/components`. Components consume semantic `--ds-*` custom properties only and must not import or call color-engine generation internals at runtime.
- Component state recipes must select existing semantic tokens directly. Disabled component states should use neutral/control semantics rather than whole-element opacity, CSS filters, `color-mix()`, primitive ramp variables, or component-local color derivation. A future dedicated disabled text semantic may be added if `--ds-text-muted` proves too imprecise.
- Current proof components should be honest about native behavior. `pf-button` is backed by a native internal `<button type="button">`, supports only the documented `disabled`/`variant` contract plus focus/click delegation, and is not form-associated. Complex interactive or form components require an explicit foundation decision before implementation.
- Component DOM/API contracts should be tested in a real browser runtime when Shadow DOM, Custom Elements, focus delegation, event composition, or slot projection matter. `@puzzlefactory/components` may use Playwright as dev-only test tooling; runtime dependencies must remain zero.
- Component foundation direction is recorded in `docs/adr/0001-component-foundation.md`: keep `@puzzlefactory/components` as raw Custom Elements for simple display and native-backed proof components; do not build complex form or ARIA-heavy components until a dedicated foundation spike chooses between Lit/platform APIs, Lion, or another approved approach; React wrappers are a later consumer-ergonomics layer, not the core foundation.
- Form and interactive component foundation direction is recorded in `docs/adr/0002-form-interactive-component-foundation.md`: keep raw Custom Elements for existing/simple pieces, use Lit plus platform APIs as the preferred first implementation candidate for future form or moderately interactive PuzzleFactory-owned components, and treat Lion as a fallback/benchmark if Lit exposes too much form-system burden. Lit or Lion adoption still requires an explicit implementation slice and dependency approval.
- `@puzzlefactory/react-components` is the React consumer ergonomics layer for stable `@puzzlefactory/components` Custom Elements. Wrappers forward typed props/refs and render the underlying `pf-*` elements; styling, color recipes, accessibility behavior, and color generation stay outside the React wrapper package.
- Custom color roles are generated, inspectable, tenant/theme-scoped extensions under the distinct `--ds-role-*` CSS namespace. Built-in roles (`primary`, `danger`, `warning`, `success`, `info`) remain first-class stable API and custom roles must not directly redefine core semantic tokens. `customRoles` validates lowercase kebab-case role ids, rejects reserved ids, validates seeds, defaults custom role seed policy to `balanced`, returns normalized metadata, generates compact light/dark soft and solid primitive families, emits theme-scoped semantic aliases in generated CSS, and adds diagnostic APCA assertion pairs for configured roles. Custom role APCA assertions reuse existing `status-soft` and `status-solid` thresholds and remain diagnostic only. In high-contrast themes, custom role aliases point to conservative fixed high-contrast primitives rather than tenant-seed-tuned custom-role colors. Kitchen Sink now visualizes editable custom role examples across controls, primitives, semantics, themes, and assertions. Component tone APIs remain deferred.

## Superseded Decisions

- None yet.
