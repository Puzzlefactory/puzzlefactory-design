# Workstream: Color Engine v2

Status: active
Created: 2026-06-02
Last Updated: 2026-06-05

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

CE2-08C is implemented. Kitchen-sink now has an `/assertions` route and sidebar/overview navigation entry. The view consumes `output.assertions` and renders summary counts, algorithm/threshold metadata, a failure-first section, and grouped results by theme and assertion role. Rows show pass/fail, semantic foreground/background names, signed APCA Lc, absolute APCA Lc, threshold, severity, and resolved primitive token names. The route is diagnostic only; no threshold, pair, recipe, enforcement, or auto-tuning changes were made. Browser smoke verification at `http://127.0.0.1:5173/assertions` showed the expected 64 pairs, 56 passed, 8 required failures, and 12 grouped panels with no horizontal overflow at the tested desktop viewport.

CE2-09A is implemented. Balanced dark primary/status solid ramps were tuned so default dark solid required assertions pass. Primary dark solid uses an internal `ui` contrast profile; status dark solid uses a brighter internal `status` contrast profile. Anchored policy behavior, assertion pairs, thresholds, soft ramps, light-mode recipes, token package output, and component work were not changed. Focused tests now cover default dark solid required assertions plus the Kitchen Sink seed defaults. Browser smoke verification at `http://127.0.0.1:5173/assertions` showed 64 pairs, 64 passed, 0 required failures, and 0 diagnostic failures for Kitchen Sink defaults; `/themes` rendered the light/dark cards without horizontal overflow at the tested desktop viewport. Package defaults still have one known light warning solid required failure, `light:warning-solid-text:on:warning-solid-bg`, which is outside CE2-09A scope.

CE2-09B is implemented. Kitchen Sink now shows an anchored policy diagnostic panel only when primary or status policies are set to `anchored`. Failed assertion rows related to anchored primary/status policies include a note that the failure is the contrast cost of preserving the seed rather than silently adapting it. This slice did not change generation recipes, assertion thresholds, assertion pairs, anchored behavior, package APIs, token output, or component work. Browser smoke verified that default balanced output has no anchored diagnostic panel, while a light anchored primary seed (`#F8D7FF`) shows the panel, a primary policy chip, linked failures, per-row anchored notes, no horizontal overflow, and no browser console errors.

CE2-09C is implemented. Status solid text semantics now resolve from a small approved foreground candidate set after primitives are generated. The resolver evaluates APCA coverage across rest, hover, and pressed status solid backgrounds; it preserves the existing intended token when it passes, and otherwise chooses the strongest approved candidate. This preserves cases like ordinary danger/success/info using the original surface text, while allowing a dark-blue anchored status to use light text and the default gold warning to use a lighter neutral text. No Colorjs.io dependency was added, and APCA thresholds/pairs were unchanged. The default warning seed changed from `#b26a00` to `#e3bb1d`, and balanced warning light solid was capped slightly darker so the default remains gold/yellow while passing status solid assertions. Kitchen Sink defaults now show 64 passed, 0 required failures, and 0 diagnostic failures. Browser smoke verified `/assertions` and `/themes` at the default desktop viewport with no horizontal overflow; theme preview showed light warning solid as darker gold with light text and dark warning solid as pale gold with dark text.

CE2-09D is implemented. The package now has a representative assertion matrix that covers balanced defaults, quiet green/gold, layered blue/dark-blue info, high-separation purple/saturated status, legacy brown warning, and anchored tradeoff cases. Balanced matrix cases must have zero required failures. Anchored matrix cases assert explicit expected failures for light anchored primary, dark-blue anchored info soft text, and anchored gold warning soft/pressed states. The matrix exposed two small balanced edge failures, so warning light solid was capped slightly darker and dark status solid level 3 was brightened slightly; these were scoped tuning changes, not broad auto-tuning. Kitchen Sink default assertions still show 64 passed, 0 required failures, and 0 diagnostic failures. Browser smoke verified `/assertions` and `/themes` with no horizontal overflow and no console warnings/errors.

CE2-10 is implemented. V2 CSS output remains owned by `@puzzlefactory/color-engine` for now; `@puzzlefactory/tokens` continues to consume the preserved v1 reference output until a later explicit migration slice. The v2 package now exposes `COLOR_ENGINE_CSS_LOAD_ORDER`, `ColorEngineCssFileName`, `ColorEngineCssFileKind`, and `ColorEngineCssFile`, and `cssOutput.files` provides load-order-ready entries for `primitives.css`, `theme-light.css`, and `theme-dark.css`. Compatibility fields are preserved: `cssOutput.primitives`, `cssOutput.themes.light`, `cssOutput.themes.dark`, `cssOutput.all`, and `output.css` still work, with `cssOutput.all` equal to the ordered file CSS joined with blank lines. No high-contrast v2 CSS output was added.

CE2-11 is implemented. The v2 package now exports a small curated example preset set: `evergreen`, `civic-blue`, `plum`, and `teal`, through `COLOR_ENGINE_THEME_PRESETS`, `COLOR_ENGINE_THEME_PRESET_NAMES`, `ColorEngineThemePresetName`, `ColorEngineThemePresetInput`, and `ColorEngineThemePreset`. Presets are plain input bundles over the existing `ColorEngineInput` fields and balanced seed policies; they do not add new generation concepts or runtime dependencies. Package tests verify preset order, shape, valid output, balanced policies, and zero required APCA failures.

Kitchen Sink now defaults to the exported `evergreen` preset and renders a Theme Presets control section above the manual seed controls. Applying a preset fills the existing manual controls, changes generated primitives/themes/assertions through the normal engine state, and keeps manual editing available by marking the state as custom. Theme preset and surface separation buttons expose selected state with `aria-pressed`. Browser smoke verified applying the `plum` preset changes generated primary CSS, preserves required assertion passes, renders the theme preview without horizontal overflow, and logs no console warnings/errors.

CE2-11B is implemented. Primary and status inputs now support optional dark-theme seeds:

- `primaryDarkSeed`
- `dangerDarkSeed`
- `warningDarkSeed`
- `successDarkSeed`
- `infoDarkSeed`

Light/default seeds remain the source for light primary/status families. Dark primary/status soft and solid families use the matching dark seed when provided, and fall back to the existing light/default seed when omitted. Existing seed policies remain shared per family; no separate dark seed policies were added. Anchored policy now preserves the theme-specific seed at solid level 2, so light solid level 2 preserves the light/default seed and dark solid level 2 preserves the dark seed. The exported curated presets include explicit dark seeds where useful while retaining zero required APCA assertion failures.

Kitchen Sink now exposes separate light and dark seed fields for primary and each status intent, applies preset dark seeds through the normal manual controls, shows light/dark LCH metadata, and labels primitive ramp notes so reviewers can tell whether a family is driven by the light/default seed or the dark seed. Browser smoke verified Controls, Primitives, Themes, and Assertions render without error and that the separate seed fields plus primitive annotations are visible. The in-app browser could not type into inputs because its virtual clipboard was unavailable and page evaluation is read-only; dark-seed UI mutation behavior is therefore covered by package tests rather than browser text entry.

CE2-11C is implemented. The v2 package now exports named text treatment strategies for soft colored surfaces:

- `same-hue`: preserves the previous behavior by using same-hue solid-family text on primary/status soft surfaces.
- `neutral`: uses neutral text on primary/status soft surfaces.
- `adaptive`: chooses from approved same-hue and neutral candidates by APCA coverage against soft rest and hover backgrounds.

The default remains `same-hue`, so existing visual output is preserved unless the caller opts into another strategy. Primary soft assertions now cover rest and hover backgrounds; status soft assertions now cover rest and hover backgrounds. The default Kitchen Sink assertion report now has 76 total pairs with 76 passing. Kitchen Sink exposes text treatment strategy controls and adds a Theme page comparison section with same-hue, neutral, and adaptive cards for light and dark themes.

CE2-11D is implemented. The v2 package now generates independent foreground/text primitive families:

- `text-dark`: `strong`, `primary`, `secondary`, `muted`, and `disabled` near-black foreground levels.
- `text-light`: `strong`, `primary`, `secondary`, `muted`, and `disabled` near-white foreground levels.

Text primitives are independent from surface ramps. Normal surface text semantics now map to `text-dark-*` in light theme and `text-light-*` in dark theme. Primary/status solid text resolution now chooses from dedicated text primitives rather than borrowed `surface-light-*` or `surface-dark-*` candidates, so colored fills can intentionally use near-white or near-black foregrounds where appropriate. Kitchen Sink renders the new text primitive families and adds text usage samples to the Themes page. The default Kitchen Sink assertion report remains 76/76 passing.

CE2-11E is implemented. Surface separation presets can now be selected per theme before the consumer integration contract. `preset` remains the shared compatibility fallback. Optional `lightSurfacePreset` and `darkSurfacePreset` fields override the shared preset for light or dark neutral/surface/chrome/state generation when provided. Resolved presets are exposed as `output.surfacePresets.light` and `output.surfacePresets.dark`. Curated presets now use useful combinations, such as standard light plus layered dark or quiet light plus layered dark.

Kitchen Sink exposes Shared fallback, Light surface separation, and Dark surface separation controls. Light/dark controls include a `Use shared` option; inherited sides omit the theme-specific field when calling the engine, so changing the shared fallback has a visible effect for inherited sides while explicit sides remain isolated. Browser smoke verified that changing dark separation changes dark surface CSS variables without changing light variables, and changing inherited light through the shared fallback does not change explicit dark output.

CE2-12 is implemented. `packages/color-engine/README.md` now documents the v2 consumer integration contract: supported `cssOutput` fields, `primitives.css` / `theme-light.css` / `theme-dark.css` load order, the `data-theme-v2="light"` and `data-theme-v2="dark"` theme attribute contract, semantic custom property consumption, build-once generation, persisted runtime generation, and blob-hosted tenant CSS guidance. `packages/tokens/README.md` now clarifies that `@puzzlefactory/tokens` remains v1/reference-backed through `@puzzlefactory/color-engine-1` and is not the v2 consumer path yet.

Independent sub-agent review was not performed for CE2-01 through CE2-10 because the current tool policy requires explicit user authorization for sub-agent delegation. Local review plus focused and root verification passed. Independent sub-agent review was performed for CE2-11; two findings were addressed before closeout: preset buttons gained `aria-pressed`, and the Kitchen Sink default assertion test now uses the exported `evergreen` preset input. Re-review confirmed both findings were resolved. Independent sub-agent review was performed for CE2-11C; one P3 coverage finding was addressed before closeout by adding status soft hover assertion pairs and tests.

CE2-13 is implemented. `packages/components` is now a bounded `@puzzlefactory/components` Web Component proof with zero runtime dependencies. It exports `definePuzzleFactoryComponents`, `PfButtonElement`, `PfAlertElement`, and small public types/constants. `pf-button` and `pf-alert` consume semantic CSS custom properties only and do not import or call `@puzzlefactory/color-engine` or `createColorEngineTheme`. Kitchen Sink registers the components and adds a `/components` route that renders primary/secondary buttons plus soft/solid danger/warning/success/info alerts in light and dark `data-theme-v2` boundaries. Browser smoke verified the route after restarting Vite: 6 `pf-button` elements, 16 `pf-alert` elements, both light/dark samples, upgraded shadow DOM for both elements, no horizontal overflow, no page-error event, and no Vite error overlay.

CE2-14 is implemented. `pf-button` disabled state now uses neutral/control semantic CSS custom properties directly instead of dimming the whole primary button with opacity. Disabled primary and secondary buttons resolve to `--ds-control-bg`, `--ds-control-border`, and `--ds-text-muted`; hover and pressed disabled states stay neutral. The component proof also removed `color-mix()` from the focus recipe so component color recipes remain direct semantic-token selection. Contract tests now forbid component opacity, filters, `color-mix()`, primitive ramp variables, and color-engine imports. Kitchen Sink renders disabled primary and secondary examples in both light and dark component samples.

## Next Actions

- Review CE2-14 visually in Kitchen Sink and decide whether `--ds-text-muted` is sufficient for disabled component foregrounds or whether a future dedicated `--ds-text-disabled` semantic alias should be added.
- Decide the next component slice after visual review. Candidate: refine the component proof API and accessibility contract before adding more components.
- Treat later component work as strategic placeholders. Reorder or revise if Kitchen Sink visual feedback exposes a more important color/token issue.

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

Future primary/identity direction:

- Do not equate `primary` with brand. A brand/identity color can be bright, pale, or intentionally eye-catching, which often makes it poor as repeated UI chrome or a solid action fill.
- Add a future primary seed mode that distinguishes the seed's job:
  - `action`: the seed is expected to be usable near the solid action color.
  - `identity`: the seed is the recognizable identity color; preserve it in accent/soft/tint roles and derive usable action colors around it.
  - `anchored`: the exact seed must occupy the solid role, and failures remain explicit.
- This should solve light or vivid identity colors without forcing them into solid button backgrounds and without adding slider-heavy controls.

Future seed-classification exploration:

- Consider accepting a small pool of identity/input seeds without requiring the user to assign each seed to a role up front.
- Evaluate each seed against role requirements before semantic assignment: solid action fit, accent/highlight fit, soft/tint fit, status fit, contrast viability, and need for a derived companion color.
- The engine could classify seeds into the roles they best fit, then derive missing role colors as needed. For example, a dark green may become an action candidate, a pale lavender may become an identity tint/accent candidate, and a gold may become a warning/accent candidate with resolved foreground semantics.
- Kitchen Sink must make this classification visible and honest: show which seed was used directly, which roles were derived, and why a seed was not used as a solid action fill.
- Do not implement this until the current explicit-seed API, CSS output, and preset story are stable.

Kitchen-sink should make seed policy visible when implemented. Primitive ramps should clearly show whether the seed was adapted or anchored, so the generator feels honest during visual review.

## Strategic Roadmap

This roadmap is intentionally provisional. Kitchen-sink visual review and assertion output can change the order.

1. `CE2-08`: Add APCA assertion report.
   - `CE2-08A`: Port or adapt the v1 APCA calculation into v2 and verify it against fixtures.
   - `CE2-08B`: Define assertion pairs over existing semantic roles, such as text on surfaces, primary action text on action backgrounds, status soft text on status soft backgrounds, and status solid text on solid backgrounds. Return diagnostic assertion output from `createColorEngineTheme`.
   - `CE2-08C`: Render assertion results in kitchen-sink for visual review and design-system debugging.
   - Stop before assertion enforcement, auto-tuning, token package expansion, and component packages.

2. `CE2-09`: Tune from assertion and visual feedback.
   - Execute as focused sub-slices, not one broad tuning pass.
   - `CE2-09A`: Tune balanced dark primary/status solid ramps so default required dark solid assertions pass. Focus on `primary-action-*` and `<status>-solid-*` failures. Do not change thresholds, assertion pairs, anchored policy behavior, or unrelated families.
   - `CE2-09B`: Review anchored policy diagnostics. Exact seed preservation can legitimately create failures; report those clearly rather than silently adapting anchored seeds. Add clearer kitchen-sink messaging only if needed.
   - `CE2-09C`: Review remaining soft/status/body assertion and visual weak spots. Tune only when failures or visible weakness justify it; muted text remains diagnostic unless intentionally promoted. Include narrow status solid foreground resolution if it resolves real generated-background failures: choose from approved semantic foreground candidates based on APCA coverage across rest/hover/pressed, preserve the intended token when it already passes, and expose the selected token in the existing assertion/Kitchen Sink output. Do not expand this into broad auto-tuning.
   - `CE2-09D`: Add a small representative preset/seed regression matrix so tuning is not only optimized for the default green/status colors.
   - Stop before hard enforcement, broad auto-tuning, downstream token package expansion, and new color families without a proven UI job.

3. `CE2-10`: CSS/token output stabilization for v2.
   - Decide whether v2 CSS output remains in `@puzzlefactory/color-engine`, moves into `@puzzlefactory/tokens`, or is exposed through a thin adapter.
   - Define load-order-ready CSS outputs for primitives and themes.
   - Keep the root/workspace package boundaries clean.
   - Stop before component implementation.

4. `CE2-11`: Presets and example themes.
   - Add a small set of credible theme presets using OKLCH seeds and current policy controls.
   - Render preset switching in kitchen-sink so designers can compare starting points quickly.
   - Add named text treatment presets for primary/status soft surfaces so same-hue, neutral, and adaptive foreground behavior can be compared visually.
   - Add independent light/dark surface separation preset controls before consumer integration so light and dark themes are not forced into one compromise surface hierarchy.
   - Avoid turning presets into a broad theme marketplace or adding slider-heavy controls.

5. `CE2-12`: Consumer integration contract.
   - Implemented: defined how an application consumes generated CSS and theme attributes.
   - Implemented: documented runtime generation versus build-once usage.
   - Implemented: included expected use for Azure Static Web Apps/blob-hosted tenant CSS.
   - Stopped before full docs app or component package work.

6. `CE2-13`: First component proof.
   - Implemented: built the smallest useful Web Component proof after color, semantic aliases, CSS output, and assertion diagnostics became credible.
   - Implemented: button plus alert/status panel proof exercises primary, status, surface, chrome, and APCA-relevant pairs.
   - Stopped before a broad component library.

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
| `CE2-09` | Assertion-driven tuning milestone | Strategic milestone covering assertion-informed tuning. Execute as `CE2-09A` through `CE2-09D`. | New color families without proven UI job, hard enforcement, token package expansion |
| `CE2-09A` | Dark solid required-pair tuning | Tune balanced dark primary/status solid ramps so default required dark solid assertions pass while preserving visual quality. | Threshold changes, assertion pair changes, anchored policy behavior, unrelated family tuning |
| `CE2-09B` | Anchored policy diagnostics | Review anchored primary/status failures and make seed-preservation tradeoffs clear in diagnostics or kitchen-sink messaging. | Silently adapting anchored seeds, broad auto-tuning, threshold changes |
| `CE2-09C` | Soft/status/body review pass | Review remaining soft, status, body, secondary, and muted assertion/visual weak spots; tune only where evidence justifies it. May include narrow status solid foreground resolution from an approved candidate set when generated backgrounds prove fixed text polarity is too rigid. | Promoting muted failures without design decision, broad recipe rewrites, broad auto-tuning, state-delta assertions |
| `CE2-09D` | Preset and seed regression matrix | Run/report assertions across a small representative set of seeds and presets so tuning is not default-only. | Large theme marketplace, exhaustive seed search, hard enforcement |
| `CE2-10` | V2 CSS/token output stabilization | Stabilize v2 CSS output boundaries in `@puzzlefactory/color-engine` with explicit file names and load order. Keep `@puzzlefactory/tokens` on v1 until a later explicit migration. | Component-library implementation |
| `CE2-11` | Presets and example themes | Add a small set of credible OKLCH theme presets and kitchen-sink preset comparison. Implemented presets: `evergreen`, `civic-blue`, `plum`, and `teal`. | Slider-heavy controls, broad theme marketplace |
| `CE2-11B` | Theme-specific dark seeds | Add optional dark-theme primary/status seeds, preserve fallback to light/default seeds, keep shared seed policies, preserve anchored theme-specific solid level 2, and expose separate light/dark controls in Kitchen Sink. | General semantic/text overrides, role classification, APCA threshold profiles, high-contrast v2 output |
| `CE2-11C` | Text treatment exploration | Add named soft colored surface text strategies: `same-hue`, `neutral`, and `adaptive`. Preserve `same-hue` as default, compare strategies in Kitchen Sink, and cover primary/status soft rest and hover pairs in APCA assertions. | Broad text override APIs, tenant manual overrides, threshold profiles, role classification |
| `CE2-11D` | Dedicated foreground/text ramps | Add independent `text-dark` and `text-light` primitive families, remap normal text semantics to those primitives, and resolve primary/status solid text from dedicated foreground candidates instead of surface tokens. | Broad per-token overrides, tenant override API, high-contrast theme output, threshold profiles |
| `CE2-11E` | Theme-specific surface separation presets | Add optional `lightSurfacePreset` and `darkSurfacePreset` controls that fall back to `surfacePreset`; update generation, curated presets, Kitchen Sink controls, and tests so light and dark surface hierarchy can be tuned independently. | Sliders, new surface seed types, consumer integration, high-contrast theme output |
| `CE2-12` | Consumer integration contract | Implemented. Defined app consumption, generated CSS loading, theme attributes, and build-once/runtime usage patterns. | Full docs app, component-library implementation |
| `CE2-13` | First component proof | Implemented. Built `pf-button` and `pf-alert` Web Component proof consuming semantic CSS variables only, with Kitchen Sink visual verification. | Broad component library |
| `CE2-14` | Component state recipes | Implemented. Refined `pf-button` disabled state to use neutral/control semantic tokens directly; added contract tests forbidding opacity, filters, `color-mix()`, primitive variables, and color-engine imports in component color recipes. | New components, local color derivation, new color-engine tokens unless existing semantics clearly fail |

## Completion Shape

This workstream is substantially complete when:

- Neutral and surface v2 output renders credible light and dark UI surfaces in kitchen-sink.
- Surface generation supports separate neutral, light-surface, and dark-surface seeds.
- Surface separation can be selected independently for light and dark themes through named presets while retaining a shared fallback.
- Chrome/border generation is separate from surface fills and surface interaction states.
- Presets produce repeatable useful visual differences without requiring manual sliders.
- Example theme presets are plain existing-input bundles that can be applied and compared in Kitchen Sink.
- Text treatment strategies are named choices for soft colored surfaces, not arbitrary per-token overrides.
- Foreground/text primitives are independent from surfaces and provide near-black/near-white candidates for colored fills.
- Primary and status families are compact usage sets, not long universal ramps.
- Primary and status seed handling is explicit: either balanced/adapted or anchored/preserved.
- V2 CSS output provides explicit load-order-ready primitive and theme files while preserving the bundled compatibility string.
- Consumer integration is documented for direct v2 `@puzzlefactory/color-engine` CSS output, including build-once, persisted runtime, and blob-hosted CSS patterns.
- First Web Component proof consumes semantic CSS variables without calling color-generation internals.
- Component state recipes consume semantic CSS variables directly, including disabled states that use neutral/control semantics instead of opacity, filters, `color-mix()`, or local color derivation.
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
- **Separate surface separation:** Light and dark themes may use different named surface separation presets; a shared preset is only a fallback convenience.
- **Presets over sliders:** Normal controls should be named presets. Sliders may exist only as internal/debug tooling if later justified.
- **Semantics later:** Generation families use neutral names such as surface, primary, and status usage sets. Brand/accent aliases happen after generation.
- **Seed policy is per family:** Surfaces can use seeds as tonal guides; primary and status families need future `balanced` versus `anchored` behavior so approved colors can be preserved when required.
- **Chrome is separate from surface states:** Borders and control edges should use a compact chrome family rather than recycled surface hover/pressed tokens.
- **Foreground is separate from surfaces:** Text/on-color foregrounds should use dedicated near-black/near-white primitive families rather than borrowed surface colors.
- **V1 status:** V1 is reference material, not the implementation path.

## Key Files

- `.ai/workstreams/color-engine.md` — closed v1 reference workstream
- `packages/color-engine/` — active v2 package
- `packages/color-engine-1/` — preserved v1 reference package
- `apps/kitchen-sink/` — v2 visualization app for neutral/surface controls, primitives, semantics, and previews
- `/Users/alanbryant/local_projects/work/kultera/projects/klt-ui-remote/src/themes/generator/` — useful reference for anchored scales, family-specific tuning, semantic recipes, and visual review flow
- `/Users/alanbryant/local_projects/work/kultera/projects/klt-ui-remote/tokens/theme-generator.config.mjs` — useful reference for presets/recipes and compact surface/panel tiers
