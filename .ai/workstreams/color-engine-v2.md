# Workstream: Color Engine v2

Status: active
Created: 2026-06-02
Last Updated: 2026-06-03

This workstream covers the second color-engine attempt. The v2 direction is visual-first and usage-first: generate compact, purpose-built color families with named presets and immediate kitchen-sink feedback instead of broad generic ramps that are mapped to semantics after the fact.

## Scope

In scope:
- Preserve useful v1 infrastructure lessons while replacing the generation strategy.
- Start with neutral and surface generation only.
- Use multiple compact ramps with clear UI intent rather than long universal scales.
- Support separate neutral, light-surface, and dark-surface seeds from the beginning.
- Prefer named presets over granular sliders for normal use.
- Build kitchen-sink visualization alongside the first implementation slice.
- Show primitives, semantic outputs, controls, and live preview for each slice.
- Treat full exploratory ramps as debug/reference output, not the production token model.

Out of scope:
- Do not continue tuning v1 broad-ramp generation as the main path.
- Do not start with brand, accent, status, APCA, or assertion enforcement.
- Do not build component packages as part of the first v2 slices.
- Do not make a slider-heavy tuning laboratory by default.
- Do not require a single seed to generate every color family.

## Current State

V1 exposed useful package boundaries and a useful React + Vite kitchen-sink visualization, but its generation model is rejected. The main lessons are:

- Long generic ramps appear flexible but produce off-colors and unusable intermediate steps.
- A single ramp should not serve surfaces, actions, status, text, and dark-mode surfaces.
- Surface colors need compact light and dark operating ranges, not a broad neutral scale from white to black.
- Status colors need separate soft/solid and light/dark usage sets, not one generic status ramp.
- Semantic naming such as brand/accent should happen after generation families are understood.
- Visual output must be reviewed from the first slice; tests cannot substitute for visual quality.

CE2-01 is implemented. V1 is preserved as `packages/color-engine-1` with package name `@puzzlefactory/color-engine-1`. The active `packages/color-engine` package is now v2 and implements only neutral/surface generation with separate neutral, light-surface, and dark-surface seeds, compact four-step primitive families, hover/selected/pressed surface states, and named surface presets.

The kitchen-sink app is now wired to v2 output directly. It renders controls, primitive ramps, semantic surface roles, and light/dark nested surface previews. The v1 token CSS package remains available through `@puzzlefactory/tokens`, which now consumes `@puzzlefactory/color-engine-1`.

CE2-02 is implemented. Surface presets are calibrated with separate light/dark surface step deltas and separate light/dark state deltas. The intended spans are:

- `quiet`: very subtle light surfaces, modest dark separation.
- `standard`: everyday product UI separation.
- `layered`: clearer nested panel hierarchy.
- `high-separation`: stronger hierarchy review and edge-case checking.

CE2-03 is implemented. Primary generation uses an explicit `primarySeed` and produces four compact usage families:

- `primary-light-soft`: light-theme tinted containers.
- `primary-light-solid`: light-theme actions, links, and focus emphasis.
- `primary-dark-soft`: dark-theme tinted containers.
- `primary-dark-solid`: dark-theme actions, links, and focus emphasis.

Primary semantic roles now cover action background states, action text, link states, focus ring, and soft container roles. Kitchen-sink renders primary seed controls, primary primitive ramps, primary semantic roles, and primary action/link/focus previews in light and dark themes.

CE2-04 is implemented. Status generation uses explicit `dangerSeed`, `warningSeed`, `successSeed`, and `infoSeed` inputs and produces compact usage families for each status intent:

- `<intent>-light-soft`: light-theme tinted status containers.
- `<intent>-light-solid`: light-theme status emphasis/actions.
- `<intent>-dark-soft`: dark-theme tinted status containers.
- `<intent>-dark-solid`: dark-theme status emphasis/actions.

Status semantic roles now cover soft backgrounds, hover backgrounds, borders, soft text, solid backgrounds, solid hover/pressed states, and solid text. Warning uses a slightly softer chroma recipe than danger/success/info because yellow/orange status colors are more visually sensitive. Kitchen-sink renders status seed controls, primitive ramps, semantic roles, and status soft/solid cards in light and dark themes.

Seed preservation is now an explicit design concern for future work. Surface generation may treat seeds as tonal guides because the visual system result matters more than preserving the exact input color. Primary and status generation may need stricter behavior because those seeds can represent approved palette colors or intentional design choices. The current primary/status behavior is a `balanced` style: it preserves hue and creates comfortable UI usage colors, but it does not guarantee the exact seed appears in the primitive ramp.

CE2-05 is implemented. The v2 package now exports semantic token name constants, adds text/chrome aliases for neutral-driven roles, keeps surface/primary/status aliases theme-scoped, and returns structured CSS output:

- `cssOutput.primitives`: root primitive custom property rule.
- `cssOutput.themes.light`: light semantic alias rule.
- `cssOutput.themes.dark`: dark semantic alias rule.
- `cssOutput.all`: full concatenated CSS; `output.css` remains this same full string for current app compatibility.

Kitchen-sink now consumes the exported semantic token lists, renders text/chrome semantic groups, shows a CSS output summary, and uses generated text, border, and control aliases for its own chrome.

CE2-06 is implemented. Primary and status usage families now support per-family seed policy:

- `balanced`: default behavior. Preserve hue/intent and generate comfortable soft/solid usage ramps. The exact seed may be absent from solid ramps.
- `anchored`: preserve the parsed seed as solid level 2 for light and dark solid ramps, and expose the parsed seed as a single-token primitive family such as `primary-seed` or `warning-seed`.

Soft ramps remain derived/tamed for usable containers regardless of policy. Existing semantic alias names were preserved; in anchored mode, aliases such as `primary-action-bg` and `<intent>-solid-bg` already point to solid level 2, so they resolve to the anchored seed. Kitchen-sink now has policy controls beside primary/status seeds and marks seed primitives and anchored solid steps in the primitive view.

CE2-07 is implemented. Chrome/border generation is now separate from surface fills and surface interaction states. The package emits compact `chrome-light` and `chrome-dark` primitive families with `subtle`, `default`, and `strong` tokens derived from existing surface/neutral inputs and the active surface preset. Semantic aliases now map `border-subtle`, `border-default`, `border-strong`, and `control-border` to chrome primitives rather than recycled surface hover/pressed tokens. Kitchen-sink displays chrome primitive ramps and uses `border-default`/`control-border` for structural panel and field borders, so quiet surface fills can remain subtle without making panel structure disappear.

CE2-08A is implemented. The active v2 package now exports APCA calculation helpers ported from v1: `APCA_ALGORITHM_VERSION`, `APCA_CONSTANTS`, `calculateApcaLc`, `calculateApcaLcFromOklch`, `calculateApcaLcFromY`, and `srgbToApcaY`, plus `ApcaConstants` and `SrgbColor` types. Direct sRGB fixtures match the v1 APCA/W3 expected values. The OKLCH integration test allows a small tolerance because v2's existing `parseColorSeed` path rounds parsed OKLCH channels. No assertion pair model, kitchen-sink assertion report, enforcement, or auto-tuning was added.

CE2-08B is implemented. The active v2 package now returns `output.assertions`, a diagnostic APCA report with role-based thresholds and resolved semantic text/background pairs. Current roles and thresholds are:

- `body`: 60, required.
- `secondary`: 45, required.
- `muted`: 30, diagnostic.
- `ui`: 45, required.
- `status-soft`: 45, required.
- `status-solid`: 60, required.

The first assertion set covers 64 pairs across light and dark themes: primary/secondary/muted text on surfaces, primary action text on action states, control text on control background, status soft text on soft backgrounds, and status solid text on solid states. Border/chrome assertions remain excluded. The default report currently surfaces required failures, mostly around dark status solid states plus one dark primary pressed pair; those are evidence for CE2-08C review and later CE2-09 tuning, not changes made in CE2-08B. No kitchen-sink assertion report, enforcement, auto-tuning, token expansion, or component work was added.

Independent sub-agent review was not performed for CE2-01 through CE2-08B because the current tool policy requires explicit user authorization for sub-agent delegation. Local review plus focused and root verification passed.

## Next Actions

- Pause and review CE2-08B assertion pairs and thresholds before continuing.
- If CE2-08B is acceptable, proceed to `CE2-08C`: kitchen-sink assertion report rendering.
- After `CE2-08C`, review kitchen-sink report output before planning tuning.
- Treat `CE2-09` and later as strategic placeholders. Reorder or revise them if CE2-08 visual/assertion feedback exposes a more important issue.

## Seed Policy Plan

Seed policy should be per family, not global.

- Surfaces: no seed-preservation guarantee initially. Surface seeds are tonal controls for credible light and dark UI surfaces.
- Primary: needs a future option to preserve the exact seed because it may represent an approved brand or product palette color.
- Status: needs a future option to preserve the exact seed because warning/danger/success/info may come from a designed palette, even when the balanced recipe usually produces more comfortable UI output.
- Secondary or future accent colors should follow the primary model if added.

Potential policies:

- `balanced`: current behavior. Preserve hue/intent, tune lightness/chroma into comfortable soft and solid usage ramps, and allow the exact seed to be absent from the output.
- `anchored`: preserve the exact seed as an explicit primitive and likely as the main/rest solid token, then generate adjacent hover/pressed/supporting steps around it.
- `strict`: possible future mode. Preserve the exact seed as a named semantic value and limit adjustment to explicitly derived states. Do not implement until a concrete need appears.

Kitchen-sink should make seed policy visible when implemented. Primitive ramps should clearly show whether the seed was adapted or anchored, so the generator feels honest during visual review.

## Strategic Roadmap

This roadmap is intentionally provisional. Kitchen-sink visual review and assertion output can change the order.

1. `CE2-08`: Add APCA assertion report.
   - `CE2-08A`: Port or adapt the v1 APCA calculation into v2 and verify it against fixtures.
   - `CE2-08B`: Define assertion pairs over existing semantic roles, such as text on surfaces, primary action text on action backgrounds, status soft text on status soft backgrounds, and status solid text on solid backgrounds. Return diagnostic assertion output from `createColorEngineTheme`.
   - `CE2-08C`: Render assertion results in kitchen-sink for visual review and design-system debugging.
   - Stop before assertion enforcement, auto-tuning, token package expansion, and component packages.

2. `CE2-09`: Tune from assertion and visual feedback.
   - Use CE2-08 report plus kitchen-sink review to tune only the generation recipes or semantic pair mappings that fail or feel visibly weak.
   - Keep changes targeted; do not add new color families unless a specific assertion/visual gap proves a missing UI job.
   - Stop before hard enforcement and downstream token packages.

3. `CE2-10`: CSS/token output stabilization for v2.
   - Decide whether v2 CSS output remains in `@puzzlefactory/color-engine`, moves into `@puzzlefactory/tokens`, or is exposed through a thin adapter.
   - Define load-order-ready CSS outputs for primitives and themes.
   - Keep the root/workspace package boundaries clean.
   - Stop before component implementation.

4. `CE2-11`: Presets and example themes.
   - Add a small set of credible theme presets using OKLCH seeds and current policy controls.
   - Render preset switching in kitchen-sink so designers can compare starting points quickly.
   - Avoid turning presets into a broad theme marketplace or adding slider-heavy controls.

5. `CE2-12`: Consumer integration contract.
   - Define how an application consumes generated CSS and theme attributes.
   - Document runtime generation versus build-once usage.
   - Include expected use for Azure Static Web Apps/blob-hosted tenant CSS if still relevant.
   - Stop before full docs app or component package work.

6. `CE2-13`: First component proof.
   - Build the smallest useful Web Component proof only after color, semantic aliases, CSS output, and assertion diagnostics are credible.
   - Candidate proof: button plus alert/status panel, because those exercise primary, status, surface, chrome, and APCA pairs.
   - Stop before a broad component library.

## Slice Backlog

Use these IDs as shorthand for future work authorization prompts.

| ID | Slice | Scope Summary | Stop Before |
| --- | --- | --- | --- |
| `CE2-01` | Neutral and surface v2 foundation | Preserve v1 as reference if authorized, scaffold v2 package shape, generate compact neutral/surface light and dark outputs, and visualize them in kitchen-sink immediately. | Primary/action colors, status colors, APCA assertions, broad CSS output package changes |
| `CE2-02` | Surface preset calibration | Review and tune the existing quiet, standard, layered, and high-separation presets for credible light/dark surface separation and state behavior. | Status, primary/action ramps |
| `CE2-03` | Primary usage ramps | Add compact primary light/dark soft and solid usage ramps from explicit seeds and render action/link/focus previews. | Status ramps, component package work |
| `CE2-04` | Status usage ramps | Add danger/warning/success/info light-soft, light-solid, dark-soft, and dark-solid usage sets with visual review. | APCA enforcement, broad semantic aliasing |
| `CE2-05` | Semantic aliases and CSS output | Map generated usage families to stable semantic custom properties and update CSS output once visual families are credible. | Component-library implementation |
| `CE2-06` | Per-family seed policy | Add `balanced` and `anchored` seed policies for primary and status families, preserve exact seeds when anchored, and show policy/seed anchors in kitchen-sink. | APCA enforcement, token package expansion, component-library implementation |
| `CE2-07` | Chrome and border ramp | Add compact `chrome-light` and `chrome-dark` primitive families for borders, dividers, and control edges; remap border semantics to chrome output while preserving surface ramps. | Chrome seeds/sliders, APCA enforcement, token package expansion, component-library implementation |
| `CE2-08` | APCA assertion report milestone | Strategic milestone covering APCA calculation, semantic assertion pairs, and kitchen-sink report rendering. Execute as `CE2-08A` through `CE2-08C`. | Assertion enforcement, auto-tuning, token package expansion, component-library implementation |
| `CE2-08A` | APCA calculation port | Port/adapt v1 APCA calculation into v2 and verify against known fixtures. No assertion model or UI yet. | Assertion pair model, kitchen-sink report, enforcement |
| `CE2-08B` | Assertion pair model | Define semantic text/background assertion pairs, thresholds, and diagnostic report output from `createColorEngineTheme`. | Kitchen-sink report rendering, enforcement, auto-tuning |
| `CE2-08C` | Kitchen-sink assertion report | Render CE2-08B assertion output in kitchen-sink for light/dark visual review. | Enforcement, auto-tuning, recipe tuning |
| `CE2-09` | Assertion-driven tuning | Tune recipes or semantic pair mappings based on CE2-08 report and kitchen-sink visual review. | New color families without proven UI job, hard enforcement, token package expansion |
| `CE2-10` | V2 CSS/token output stabilization | Stabilize v2 CSS output boundaries and decide how `@puzzlefactory/tokens` should consume or wrap v2 output. | Component-library implementation |
| `CE2-11` | Presets and example themes | Add a small set of credible OKLCH theme presets and kitchen-sink preset comparison. | Slider-heavy controls, broad theme marketplace |
| `CE2-12` | Consumer integration contract | Define app consumption, generated CSS loading, theme attributes, and build-once/runtime usage patterns. | Full docs app, component-library implementation |
| `CE2-13` | First component proof | Build the smallest Web Component proof that exercises color semantics, likely button plus alert/status panel. | Broad component library |

## Completion Shape

This workstream is substantially complete when:

- Neutral and surface v2 output renders credible light and dark UI surfaces in kitchen-sink.
- Surface generation supports separate neutral, light-surface, and dark-surface seeds.
- Chrome/border generation is separate from surface fills and surface interaction states.
- Presets produce repeatable useful visual differences without requiring manual sliders.
- Primary and status families are compact usage sets, not long universal ramps.
- Primary and status seed handling is explicit: either balanced/adapted or anchored/preserved.
- Kitchen-sink shows primitives, semantic aliases, and real usage previews for each generated family.
- Future agents can explain each generated token by the UI job it serves.

## Blockers / Constraints

- Do not optimize for mathematical smoothness over local UI usefulness.
- Do not generate long ramps unless the extra steps have explicit UI jobs.
- Do not use visual assertions as a replacement for visual review.
- Keep the first v2 slice narrow: neutral and surface only.
- Keep v1 available as reference until explicitly removed.

## Key Decisions

- **Visual-first sequencing:** Every v2 generation slice must render in kitchen-sink immediately.
- **Compact usage ramps:** Multiple small ramps are preferred over one long generic scale.
- **Separate surface seeds:** Neutral identity, light surfaces, and dark surfaces may have separate seeds.
- **Presets over sliders:** Normal controls should be named presets. Sliders may exist only as internal/debug tooling if later justified.
- **Semantics later:** Generation families use neutral names such as surface, primary, and status usage sets. Brand/accent aliases happen after generation.
- **Seed policy is per family:** Surfaces can use seeds as tonal guides; primary and status families need future `balanced` versus `anchored` behavior so approved colors can be preserved when required.
- **Chrome is separate from surface states:** Borders and control edges should use a compact chrome family rather than recycled surface hover/pressed tokens.
- **V1 status:** V1 is reference material, not the implementation path.

## Key Files

- `.ai/workstreams/color-engine.md` — closed v1 reference workstream
- `packages/color-engine/` — active v2 package
- `packages/color-engine-1/` — preserved v1 reference package
- `apps/kitchen-sink/` — v2 visualization app for neutral/surface controls, primitives, semantics, and previews
- `/Users/alanbryant/local_projects/work/kultera/projects/klt-ui-remote/src/themes/generator/` — useful reference for anchored scales, family-specific tuning, semantic recipes, and visual review flow
- `/Users/alanbryant/local_projects/work/kultera/projects/klt-ui-remote/tokens/theme-generator.config.mjs` — useful reference for presets/recipes and compact surface/panel tiers
