# Design System Foundation — Color Engine & Token Architecture
## Revision 5

## Project Context

You are building a production-grade, framework-agnostic design system from scratch. This is not an extension or adaptation of an existing system. Every decision should be made deliberately, with zero assumption that prior conventions apply.

The system must be capable of generating a complete, coherent, visually balanced UI theme from a minimal seed input — at runtime, dynamically, without designer intervention. The quality of that generated output is the primary guard rail against arbitrary overrides and semantic leakage.

---

## Core Architectural Principles

**Generative first.** The theme is not authored. It is computed. A designer or developer provides a seed color and a harmony strategy. The engine derives everything else. The output must be good enough that the majority of consumers stop there.

**Separation of layers is non-negotiable.** Three layers exist and must not bleed into each other:

1. **Primitive layer** — raw generated values, structurally named, no semantic meaning attached
2. **Semantic layer** — named roles with explicit intent, pointing into primitives
3. **Component token layer** — scoped overrides for component-specific needs, the extension point for radical restyling

**Brand is not a primitive.** Brand may appear as a single semantic alias at most. It has no presence in the primitive layer and no influence on engine logic. The engine has no concept of brand.

**Dependencies are a liability.** Every external dependency is a future maintenance burden. The bar for inclusion is: small, stable, does exactly one precise thing, has no transitive dependencies of its own. When in doubt, write it from the specification. APCA is implemented from the published specification at git.apcacontrast.com and tested against published sample values. No npm dependency for APCA is acceptable.

---

## Step One: The Color Engine

### Color Space

All ramp generation uses **OKLCH**. HSL is not acceptable. OKLCH is perceptually uniform — equal numeric steps produce visually equal perceptual differences.

OKLCH components:
- **L** — perceptual lightness, 0 to 1
- **C** — chroma, 0 to a hue-and-lightness-dependent maximum governed by sRGB gamut
- **H** — hue angle, 0 to 360. All hue arithmetic is modulo 360. Results are always normalized to [0, 360). Negative intermediate values are handled by adding 360 before applying modulo: `H_result = ((H + offset) % 360 + 360) % 360`.

### Accepted Seed Input Formats

The engine accepts these formats only:

- Hex: `#rrggbb`, `#rgb`
- RGB: `rgb(r, g, b)` with values 0–255
- HSL: `hsl(h, s%, l%)`
- OKLCH: `oklch(L C H)`

All formats are normalized to OKLCH at the engine boundary before any processing. This normalization layer is the one place a small, well-understood conversion utility may be used — it is not part of the engine core. Named colors, display-p3, color-mix(), relative color syntax, and all other CSS color formats are out of scope for v1. An unsupported format throws `INVALID_SEED_FORMAT` immediately.

### Seed Validation, Normalization, and Clamping

These steps execute in strict order. A ValidationError in any step immediately halts processing — subsequent steps do not execute. Steps are not executed partially.

**Step 1: Format parsing and OKLCH conversion.**
Parse the seed string and convert to OKLCH. Failure throws `INVALID_SEED_FORMAT`.

**Step 2: Chroma validation.**
If C < 0.04, throw `ACHROMATIC_SEED`. This is a hard error. The engine does not fall back silently to a neutral palette.

**Step 3: Lightness clamping.**
If L < 0.25, clamp to 0.25. If L > 0.75, clamp to 0.75. Record original L and adjusted L in metadata. Emit warning `SEED_LIGHTNESS_CLAMPED`.

**Step 4: Gamut mapping of the adjusted seed.**
After clamping, L has changed. The original C may now fall outside the sRGB gamut at the new L. Apply the gamut mapping procedure to the adjusted (L, C, H) before any ramp generation proceeds. This step is mandatory even when no clamping occurred — the normalized seed is always gamut-mapped before use.

**Step 5: Lightness edge case warning.**
If the original L (before clamping) falls in 0.08–0.25 or 0.75–0.92, emit warning `SEED_LIGHTNESS_EDGE`. This fires based on original L regardless of whether clamping occurred. A seed at original L 0.15 triggers both Step 3 (clamping) and Step 5 (edge warning) — this is correct and expected behavior. The two warnings coexist in output.

### Gamut Mapping

OKLCH describes colors outside sRGB. This occurs routinely for saturated mid-lightness values. Every computed OKLCH value must be verified and mapped before emission.

**In-gamut test:** Convert the OKLCH value to linear sRGB (three channels R, G, B). The value is within sRGB gamut if all three channels are in the range [0 − ε, 1 + ε] where ε = 0.0001. The epsilon accommodates floating-point rounding — a channel value of 1.0000003 is considered in-gamut and clamped to 1.0 on output. Channels outside this range indicate an out-of-gamut color.

**Chroma reduction strategy:** Reduce C in decrements of 0.001 while holding L and H constant until the color passes the in-gamut test. This preserves hue and lightness. After reduction, clamp all channels to [0, 1] for output.

**Order of operations for every ramp step — followed without exception:**
1. Compute target (L, C, H) from the ramp and taper functions
2. Apply hue rotation if configured: `H = H + rotation(L)`
3. Run gamut mapping on (L, C, H) after rotation
4. Emit the gamut-mapped value

Hue rotation changes H, which changes the gamut boundary at that L. Gamut mapping must always run after rotation, never before.

**P3 token generation — three-case decision tree:**

For each token, after computing the sRGB-mapped OKLCH value, determine the P3 token as follows:

- **Case A — original OKLCH is within sRGB gamut:** No chroma reduction was applied. The sRGB token is the original oklch() string. The P3 token is the same oklch() string.
- **Case B — original OKLCH is outside sRGB but within P3 gamut:** The sRGB token is the chroma-reduced oklch() string. The P3 token is the original oklch() string (before sRGB reduction). To verify P3 gamut: convert the original OKLCH to linear display-p3 and check all channels in [0 − ε, 1 + ε].
- **Case C — original OKLCH is outside both sRGB and P3:** The sRGB token is chroma-reduced to the sRGB boundary. The P3 token is chroma-reduced to the P3 boundary (a less aggressive reduction than sRGB). Both are distinct values. The P3 reduction stops earlier — at the P3 gamut boundary — producing a more saturated value than the sRGB token.

P3 entries are always present for every primitive. There are no absent P3 tokens.

**P3 token output format:** sRGB tokens are emitted as `oklch(L C H)` strings. P3 tokens are emitted as `color(display-p3 R G B)` strings, with R G B being the linear display-p3 channel values converted from the P3-gamut-mapped OKLCH. This distinction matters because the `@supports (color: color(display-p3 0 0 0))` guard in the CSS output is specifically for display-p3 syntax. `oklch()` values outside sRGB would not be meaningfully contained by that guard.

**GAMUT_MAPPED warning aggregation:** One warning per palette slot (not per step). A single `GAMUT_MAPPED` warning is emitted for each slot (palette-a, status-danger, etc.) where any step required chroma reduction. The `affectedTokens` array lists all affected step token names. The `data` field includes `{ count: number, minCReduction: number, maxCReduction: number }`.

### Ramp Model

Each hue gets two ramps.

**Light ramp:** 12 steps. Step 1 at L 0.92, step 12 at L 0.55. Linear lightness distribution before taper adjustment: step n is at L = 0.92 − ((n−1) × 0.034).

**Dark ramp:** 12 steps. Step 1 at L 0.55, step 12 at L 0.08. Linear lightness distribution: step n is at L = 0.55 − ((n−1) × 0.043).

**Shared boundary:** Step 12 of the light ramp and step 1 of the dark ramp both target L 0.55. These are distinct tokens. There is no gap between ramps. L 0.45–0.55 is covered by dark ramp steps 1–3.

**State transitions stay within one ramp.** The theme context (light or dark) determines which ramp a component uses. Rest → hover → active always moves between adjacent steps of that ramp. Interactive element rest states must use steps 1–10, preserving steps 11–12 as headroom for hover and active. Step 12 of either ramp has no adjacent step in the same direction and is not a valid rest state for interactive elements.

**ΔL ≥ 0.035 is a generation invariant.** Adjacent steps must maintain ΔL ≥ 0.035 in OKLCH. This is enforced during generation by adjusting step distribution when needed. It cannot produce invalid output and does not appear in warnings.

### Chroma Taper

The smoothstep function used throughout:

```
function smoothstep(edge0, edge1, x):
  t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
  return t * t * (3.0 - 2.0 * t)
```

Where `clamp(v, lo, hi) = min(max(v, lo), hi)`. In all uses below, edge0 < edge1 (standard convention). Decreasing curves use `1 - smoothstep(a, b, x)`.

**Light ramp chroma at each step:**
```
C(L) = C_max(L, H) × (1 - smoothstep(0.70, 0.92, L)) × smoothstep(0.55, 0.68, L)
```

- `1 - smoothstep(0.70, 0.92, L)` — rises from 0 at L=0.92 to 1 at L=0.70. Tapers chroma at the light end.
- `smoothstep(0.55, 0.68, L)` — rises from 0 at L=0.55 to 1 at L=0.68. Tapers chroma at the dark end.

**Dark ramp chroma at each step:**
```
C(L) = C_max(L, H) × smoothstep(0.08, 0.25, L) × (1 - smoothstep(0.42, 0.55, L))
```

- `smoothstep(0.08, 0.25, L)` — rises from 0 at L=0.08 to 1 at L=0.25. Tapers chroma at the dark end.
- `1 - smoothstep(0.42, 0.55, L)` — falls from 1 at L=0.42 to 0 at L=0.55. Tapers chroma at the light end.

**C_max(L, H)** is the same in both ramps: the maximum in-gamut sRGB chroma at the target L and H for that specific step, computed fresh at each step using the gamut mapping algorithm (binary search or iterative reduction). It is not derived from the seed's chroma. This means each step finds its own ceiling, which varies continuously with L and H.

**Mood scale factor** is applied to C_max before the taper:
- vibrant: 1.0
- muted: 0.5
- neutral: 0.1

Mood does not apply to status ramps. Status ramps always use scale factor 1.0.

**TaperConfig overrides:** The four smoothstep boundary pairs (eight values) are exposed as `TaperConfig`:

```typescript
interface TaperConfig {
  lightUpperFadeStart: number;  // default 0.70
  lightUpperFadeEnd: number;    // default 0.92
  lightLowerFadeStart: number;  // default 0.55
  lightLowerFadeEnd: number;    // default 0.68
  darkUpperFadeStart: number;   // default 0.42
  darkUpperFadeEnd: number;     // default 0.55
  darkLowerFadeStart: number;   // default 0.08
  darkLowerFadeEnd: number;     // default 0.25
}
```

All constraints: FadeStart < FadeEnd for all four pairs (standard convention enforced). Constraint violations throw `INVALID_TAPER_CONFIG`.

### Neutral Ramp

H = seed H. C = 0.015 (light ramp), C = 0.012 (dark ramp). Fixed — no taper, no mood scaling.

Same 12-step structure and L distributions as all other ramps.

### Hue Rotation

Parameter `darkHueShift` controls hue rotation in dark ramp steps only. The light ramp covers L 0.92–0.55 and has no steps below L 0.30. DarkHueShift applies exclusively to dark ramp steps where the step's L < 0.30 (approximately steps 7–12 of the dark ramp). It never applies to the light ramp.

The rotation is linear: at L = 0.30 the shift is 0; at L = 0.08 the full `darkHueShift` value is applied. Intermediate steps interpolate linearly.

Blues (H 200–270) benefit from darkHueShift of +8 to +12. Default is 0 for all slots.

Gamut mapping is always applied after rotation.

### Harmony Strategy

- **complementary** — additional hue at `(H + 180) % 360`. Produces palette-a, palette-b.
- **analogous** — additional hues at `(H - 30 + 360) % 360` and `(H + 30) % 360`. Produces palette-a, palette-b, palette-c.
- **triadic** — additional hues at `(H + 120) % 360` and `(H + 240) % 360`. Produces palette-a, palette-b, palette-c.
- **split-complementary** — additional hues at `(H + 150) % 360` and `(H + 210) % 360`. Produces palette-a, palette-b, palette-c.
- **monochromatic** — seed hue only, two additional chroma variants. Produces palette-a (mood scale 1.0), palette-a-mid (mood scale 0.5), palette-a-subtle (mood scale 0.2). palette-b and palette-c do not exist in monochromatic mode.

Harmony strategy is required. No default.

### Anchored Status Hues

- **Danger** — H 29 (red)
- **Warning** — H 65 (amber)
- **Success** — H 145 (green)
- **Info** — H 245 (blue)

The harmony algorithm never modifies these. Tunable via `overrides.statusHues`.

**Warning hue known constraint:** Amber at H 65 may be unable to achieve Lc 45 for text on a warning background at typical lightness values. This is a known characteristic of this hue range. When the default configuration cannot achieve Lc 45, the engine emits `STATUS_CONTRAST_LIMIT` and the assertion for warning uses a floor of Lc 40 rather than Lc 45. This tolerance applies only to the warning status hue.

### Primitive Naming

```
palette-a-l-{1..12}
palette-a-d-{1..12}
palette-b-l-{1..12}          // absent in monochromatic
palette-b-d-{1..12}
palette-c-l-{1..12}          // triadic / analogous / split-comp only
palette-c-d-{1..12}
palette-a-mid-l-{1..12}      // monochromatic only
palette-a-mid-d-{1..12}
palette-a-subtle-l-{1..12}   // monochromatic only
palette-a-subtle-d-{1..12}
neutral-l-{1..12}
neutral-d-{1..12}
status-danger-l-{1..12}
status-danger-d-{1..12}
status-warning-l-{1..12}
status-warning-d-{1..12}
status-success-l-{1..12}
status-success-d-{1..12}
status-info-l-{1..12}
status-info-d-{1..12}
```

Primitives are never consumed directly by components.

---

## Contrast Validation

### Algorithm

APCA, implemented from specification, no external dependency. Verify against all published sample values.

### Signed Lc and Polarity

APCA returns signed Lc. Positive = dark text on light background. Negative = light text on dark background. Both are valid directions.

Assertions compare **absolute Lc** against the threshold. Polarity is checked **separately** as a distinct condition. A token pair with wrong polarity — light on light or dark on dark — is a `POLARITY_ERROR`, not a contrast failure. `POLARITY_ERROR` is always a hard failure, regardless of absolute Lc magnitude. A result with `POLARITY_ERROR` has `status: 'fail'` and `failureType: 'POLARITY_ERROR'`.

### Minimum Thresholds

| Use case | Minimum Lc |
|---|---|
| Body text | 75 |
| Large / heading text | 60 |
| UI components | 45 |
| Non-text indicators (meaningful borders, icons) | 30 |
| Decorative / disabled | No requirement |

### Assertion Model

Assertions validate relationships, not individual values. All Lc comparisons use absolute values. All pairs are also checked for polarity.

Covered pairs:
- text-primary / text-secondary / text-disabled on all four surfaces (both themes)
- interactive-text on interactive-bg-rest / hover / active (both themes)
- interactive-border on surface-base (both themes): Lc 30
- status-{name}-text on status-{name}-bg: Lc 45 (Lc 40 floor for warning)
- status-{name}-on-container on status-{name}-container: Lc 60
- status-{name}-border on surface-base: Lc 30

**Override assertion labeling:** When `overrides.semanticMapping` is provided, assertions run against the final (overridden) mappings. Results include `source: 'reference' | 'override'` so the consumer knows whether a failure is in the reference mapping or their override. An override that references a non-existent primitive name throws `INVALID_OVERRIDE_REFERENCE` before assertions run.

---

## Type Definitions

```typescript
type PaletteSlot =
  | 'palette-a' | 'palette-b' | 'palette-c'
  | 'palette-a-mid' | 'palette-a-subtle'
  | 'neutral'
  | 'status-danger' | 'status-warning' | 'status-success' | 'status-info';

interface StatusHueAnchors {
  danger: number;   // default 29
  warning: number;  // default 65
  success: number;  // default 145
  info: number;     // default 245
}

// SemanticMappingOverrides maps semantic token names to primitive token names.
// e.g. { 'surface-base': 'neutral-l-2' }
// Values must be valid primitive token names from the generated primitive set.
type SemanticMappingOverrides = Partial<Record<string, string>>;

type HarmonyStrategy =
  | 'complementary' | 'analogous' | 'triadic'
  | 'split-complementary' | 'monochromatic';

type Mood = 'vibrant' | 'muted' | 'neutral';

interface EngineInput {
  seed: string;
  harmony: HarmonyStrategy;
  mood?: Mood;            // default: 'vibrant'
  namespace?: string;     // default: 'ds'
  overrides?: {
    statusHues?: Partial<StatusHueAnchors>;
    darkHueShift?: Partial<Record<PaletteSlot, number>>;
    taperParams?: Partial<TaperConfig>;
    semanticMapping?: SemanticMappingOverrides;
  };
}

interface OklchValue {
  l: number;
  c: number;
  h: number;
}

type AssertionStatus = 'pass' | 'fail' | 'warning';
type FailureType = 'CONTRAST' | 'POLARITY_ERROR';

interface AssertionResult {
  tokenA: string;
  tokenB: string;
  requiredLc: number;
  actualLc: number;          // absolute value
  polarity: 'CORRECT' | 'WRONG';
  status: AssertionStatus;   // 'pass' iff failureType is absent
  failureType?: FailureType;
  source: 'reference' | 'override';
}

interface EngineWarning {
  code: string;
  message: string;
  affectedTokens?: string[];
  data?: Record<string, unknown>;
}

interface ValidationError extends Error {
  code:
    | 'INVALID_SEED_FORMAT'
    | 'ACHROMATIC_SEED'
    | 'INVALID_HARMONY'
    | 'INVALID_TAPER_CONFIG'
    | 'INVALID_OVERRIDE_REFERENCE';
  field: string;
  value: unknown;
}

interface EngineOutput {
  primitives: {
    srgb: Record<string, string>;   // oklch() strings
    p3: Record<string, string>;     // color(display-p3 R G B) strings
  };
  semantic: {
    light: Record<string, string>;
    dark: Record<string, string>;
    highContrast: Record<string, string>;
    highContrastDark: Record<string, string>;
  };
  assertions: AssertionResult[];
  warnings: EngineWarning[];
  metadata: {
    inputSeed: string;
    normalizedSeed: OklchValue;
    adjustedSeed: OklchValue;
    seedAdjusted: boolean;
    harmonyHues: number[];     // includes seed hue at index 0, then derived hues in order
    gamutMappedCount: number;
  };
}
```

---

## Semantic Role Inventory and Reference Step Mapping

The reference mapping is the default implementation and is not optional. An implementation that omits it and invents its own is non-conformant.

### surface-overlay Note

`surface-overlay` maps to the same primitive as `surface-base` in both themes. This is intentional. Modal and popover surfaces are differentiated from the page background by elevation shadow and border, not by background color. The component layer defines the shadow and border. The color engine does not define elevation.

### Light Theme Reference Mapping

```
surface-base                → neutral-l-2
surface-raised              → neutral-l-1
surface-overlay             → neutral-l-2   // same as surface-base — see note above
surface-tinted              → palette-a-l-2

text-primary                → neutral-d-11
text-secondary              → neutral-d-8
text-disabled               → neutral-d-4

interactive-bg-rest         → palette-a-d-4
interactive-bg-hover        → palette-a-d-3
interactive-bg-active       → palette-a-d-2
interactive-bg-disabled     → neutral-l-5
interactive-text            → neutral-l-1
interactive-border          → palette-a-d-5

focus-ring                  → palette-a-d-3

border-strong               → neutral-d-6
border-subtle               → neutral-l-5

status-danger-bg            → status-danger-d-4
status-danger-text          → neutral-l-1
status-danger-container     → status-danger-l-2
status-danger-on-container  → status-danger-d-9
status-danger-border        → status-danger-d-5
// same structure for warning, success, info
```

### Dark Theme Reference Mapping

```
surface-base                → neutral-d-12
surface-raised              → neutral-d-11
surface-overlay             → neutral-d-12  // same as surface-base — see note above
surface-tinted              → palette-a-d-11

text-primary                → neutral-l-2
text-secondary              → neutral-l-5
text-disabled               → neutral-l-9

interactive-bg-rest         → palette-a-l-9
interactive-bg-hover        → palette-a-l-10
interactive-bg-active       → palette-a-l-11
interactive-bg-disabled     → neutral-d-9
interactive-text            → neutral-d-12
interactive-border          → palette-a-l-8

focus-ring                  → palette-a-l-10

border-strong               → neutral-l-6
border-subtle               → neutral-d-9

status-danger-bg            → status-danger-l-9
status-danger-text          → neutral-d-12
status-danger-container     → status-danger-d-10
status-danger-on-container  → status-danger-l-3
status-danger-border        → status-danger-l-8
// same structure for warning, success, info
```

---

## High Contrast Themes

Two high contrast variants exist: light-background and dark-background. Both use the same primitive ramps; only the semantic mappings change.

**surface-tinted collapses to surface-base in both HC variants.** It cannot reliably guarantee the elevated contrast targets, so it is removed as a distinct surface. Components using surface-tinted render on surface-base in high contrast.

**surface-raised collapses to surface-base in HC dark only.** In HC dark, the difference between neutral-d-11 and neutral-d-12 is too small to guarantee differentiation at required contrast levels. Shadow alone distinguishes raised surfaces.

**Assertion minimums for both HC variants:**

| Use case | Minimum Lc |
|---|---|
| All text | 90 |
| UI components | 60 |
| Non-text indicators | 45 |
| Container/on-container text | 75 |
| Status bg/text | 60 |

**ΔL minimum between adjacent interactive steps increases to 0.05** in HC. If not achievable, emit `HC_DIFFERENTIATION_LIMIT`.

### High Contrast Light Mapping (`data-theme="high-contrast"`)

```
surface-base                → neutral-l-2
surface-raised              → neutral-l-1
surface-overlay             → neutral-l-2
surface-tinted              → neutral-l-2   // collapsed

text-primary                → neutral-d-12
text-secondary              → neutral-d-11
text-disabled               → no requirement

interactive-bg-rest         → palette-a-d-3
interactive-bg-hover        → palette-a-d-2
interactive-bg-active       → palette-a-d-1
interactive-bg-disabled     → neutral-l-5
interactive-text            → neutral-l-1
interactive-border          → palette-a-d-4

focus-ring                  → palette-a-d-2

border-strong               → neutral-d-8
border-subtle               → neutral-d-5

status-danger-bg            → status-danger-d-3
status-danger-text          → neutral-l-1
status-danger-container     → status-danger-l-2
status-danger-on-container  → status-danger-d-11
status-danger-border        → status-danger-d-6
// same structure for warning, success, info
```

### High Contrast Dark Mapping (`data-theme="high-contrast-dark"`)

```
surface-base                → neutral-d-12
surface-raised              → neutral-d-12   // collapsed — see note above
surface-overlay             → neutral-d-12
surface-tinted              → neutral-d-12   // collapsed

text-primary                → neutral-l-1
text-secondary              → neutral-l-2
text-disabled               → no requirement

interactive-bg-rest         → palette-a-l-8
interactive-bg-hover        → palette-a-l-9
interactive-bg-active       → palette-a-l-10
interactive-bg-disabled     → neutral-d-9
interactive-text            → neutral-d-12
interactive-border          → palette-a-l-7

focus-ring                  → palette-a-l-9

border-strong               → neutral-l-5
border-subtle               → neutral-l-8

status-danger-bg            → status-danger-l-10
status-danger-text          → neutral-d-12
status-danger-container     → status-danger-d-10
status-danger-on-container  → status-danger-l-2
status-danger-border        → status-danger-l-7
// same structure for warning, success, info
```

---

## Surfaces

- **surface-base** — default page background
- **surface-raised** — cards, contained sections
- **surface-overlay** — modals, popovers, tooltips. Differentiated from surface-base by elevation shadow and border, not background color.
- **surface-tinted** — seed-hued panel with no status meaning. Collapses to surface-base in all HC variants.

---

## CSS Custom Property Output Format

A separate output layer in `@puzzlefactory/tokens` consumes EngineOutput and produces CSS. The engine does not produce CSS.

**Namespace:** Configurable via the `namespace` input argument. Default `ds`. All custom properties are prefixed: `--ds-surface-base`, `--ds-text-primary`, etc.

**Six output files:**

```
tokens.css               // all primitive sRGB tokens as --{ns}-{name}: oklch(...) 
tokens-p3.css            // P3 overrides inside @supports block
theme-light.css          // semantic → primitive var() references for light
theme-dark.css           // dark theme
theme-high-contrast.css  // HC light
theme-high-contrast-dark.css
```

**Load order — consumers must import in this sequence:**
1. `tokens.css`
2. `tokens-p3.css` (optional, omit if P3 support not needed)
3. The active theme file

Later files override earlier ones at `:root`. This is load-order dependent and intentional. Consumers who cannot control load order should use a single bundled output — a bundle mode is a subsequent deliverable.

**Theme application:**

```css
/* theme-light.css */
:root,
[data-theme="light"] {
  --ds-surface-base: var(--ds-neutral-l-1);
}

/* theme-dark.css */
[data-theme="dark"] {
  --ds-surface-base: var(--ds-neutral-d-12);
}

/* theme-high-contrast.css */
[data-theme="high-contrast"] {
  --ds-surface-base: var(--ds-neutral-l-1);
}

/* theme-high-contrast-dark.css */
[data-theme="high-contrast-dark"] {
  --ds-surface-base: var(--ds-neutral-d-12);
}
```

**Default theme:** `:root` applies light theme values. No `data-theme` attribute required for light.

**P3 block in tokens-p3.css:**

```css
@supports (color: color(display-p3 0 0 0)) {
  :root {
    --ds-palette-a-l-1: color(display-p3 R G B);
    /* one entry per primitive, only where P3 differs from sRGB */
  }
}
```

Only tokens where the P3 value differs from the sRGB value appear in tokens-p3.css (Case B and Case C from the P3 decision tree). Identical tokens (Case A) are omitted from the P3 file.

**Primitive value format:** `oklch(L C H)` for sRGB tokens. `color(display-p3 R G B)` for P3 tokens.

**Semantic value format:** `var(--{ns}-{primitive-name})`.

---

## Error Type Hierarchy

**ValidationError — throws before any output is produced:**
- `INVALID_SEED_FORMAT`
- `ACHROMATIC_SEED`
- `INVALID_HARMONY`
- `INVALID_TAPER_CONFIG`
- `INVALID_OVERRIDE_REFERENCE`

**AssertionResult — in EngineOutput.assertions, never halts:**
- Contrast failures, polarity errors, status contrast limit hits

**EngineWarning — in EngineOutput.warnings, never halts:**
- `SEED_LIGHTNESS_CLAMPED`
- `SEED_LIGHTNESS_EDGE`
- `GAMUT_MAPPED` (one per palette slot, aggregated)
- `STATUS_CONTRAST_LIMIT`
- `HC_DIFFERENTIATION_LIMIT`

---

## Package Structure

Monorepo using Turborepo.

```
packages/
  color-engine  // @puzzlefactory/color-engine; APCA — zero runtime dependencies
  tokens        // @puzzlefactory/tokens; semantic roles, CSS output layer, theme application
  layout        // @puzzlefactory/layout; Stack, Box, Cluster, Sidebar, Grid, Frame, Cover, Switcher
  primitives    // @puzzlefactory/primitives; forked headless behavior layer
  components    // @puzzlefactory/components; styled components
  icons         // @puzzlefactory/icons; icon system
  themes        // @puzzlefactory/themes; pre-built configurations, generator utilities

apps/
  docs/
  kitchen-sink/
```

`@puzzlefactory/color-engine` has zero runtime external dependencies. Enforced. The input normalization layer at the boundary may use a minimal conversion utility with no transitive dependencies — sole permitted exception.

---

## Escape Hatch

Explicitly deferred to the component layer step. The mechanism (CSS layer, wrapper element, token prefix convention) will be defined at that stage with the same specificity as the rest of the system. What is settled: the escape hatch is a deliberate visible boundary, not a context token, not silent override accumulation.

---

## What This Step Produces

1. Color engine: seed + harmony + mood → complete primitive set in sRGB and P3
2. Input normalization for hex, rgb(), hsl(), oklch()
3. Seed validation with ordered steps, explicit error codes, and correct early-termination behavior
4. Gamut mapping via chroma reduction at constant L and H, with three-case P3 decision tree
5. Smoothstep chroma taper using standard convention only, with fully expanded formula
6. Two ramps per hue, shared boundary at L 0.55, no gap
7. ΔL ≥ 0.035 enforced as generation invariant
8. APCA with absolute Lc thresholds and polarity as a separate failure class
9. Reference semantic mappings for light, dark, HC light, and HC dark
10. HC themes with explicit per-role rules and elevated assertion minimums
11. Monochromatic harmony with chroma variant naming
12. Full TypeScript type definitions including PaletteSlot, TaperConfig, SemanticMappingOverrides
13. Error type hierarchy distinguishing ValidationError, AssertionResult, EngineWarning
14. CSS output in six files with specified namespace, load order, data-theme application, and value formats

Nothing else. Components, layout primitives, and the headless behavior layer are subsequent steps.
