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

Independent sub-agent review was not performed for CE2-01, CE2-02, CE2-03, or CE2-04 because the current tool policy requires explicit user authorization for sub-agent delegation. Local review plus focused and root verification passed.

## Next Actions

- Proceed to `CE2-05`: semantic aliases and CSS output, using the current `balanced` primary/status generation as the working model.
- During CE2-05, do not implement seed policy, but do not design semantic aliases or CSS output in a way that prevents future seed anchoring.
- After CE2-05, evaluate `CE2-06`: per-family seed policy for primary and status usage families.
- Do not move to APCA/assertion enforcement until semantic aliases and CSS output are stable enough to evaluate actual text/background pairs.

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

## Completion Shape

This workstream is substantially complete when:

- Neutral and surface v2 output renders credible light and dark UI surfaces in kitchen-sink.
- Surface generation supports separate neutral, light-surface, and dark-surface seeds.
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
- **V1 status:** V1 is reference material, not the implementation path.

## Key Files

- `.ai/workstreams/color-engine.md` — closed v1 reference workstream
- `packages/color-engine/` — active v2 package
- `packages/color-engine-1/` — preserved v1 reference package
- `apps/kitchen-sink/` — v2 visualization app for neutral/surface controls, primitives, semantics, and previews
- `/Users/alanbryant/local_projects/work/kultera/projects/klt-ui-remote/src/themes/generator/` — useful reference for anchored scales, family-specific tuning, semantic recipes, and visual review flow
- `/Users/alanbryant/local_projects/work/kultera/projects/klt-ui-remote/tokens/theme-generator.config.mjs` — useful reference for presets/recipes and compact surface/panel tiers
