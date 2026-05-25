import { useState } from "react";

const INITIAL_PROMPT = `# Design System Foundation — Color Engine & Token Architecture
## Revision 2 — Post Review Corrections

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

**Dependencies are a liability.** Every external dependency is a future maintenance burden accepted on behalf of every consumer. The bar for inclusion is: small, stable, does exactly one precise thing, has no transitive dependencies of its own. When in doubt, write it from the specification. This applies to the APCA formula — implement from the published specification at git.apcacontrast.com, test against published sample values, own it completely. No npm dependency for APCA is acceptable.

---

## Step One: The Color Engine

### Color Space

All ramp generation must use **OKLCH**. HSL produces perceptually uneven steps and is not acceptable. OKLCH is perceptually uniform — equal numeric steps produce visually equal perceptual differences. This property is the foundation on which automated, assertion-verified ramp generation is possible.

OKLCH components:
- **L** — perceptual lightness, 0 to 1
- **C** — chroma (colorfulness), 0 to a hue-and-lightness-dependent maximum (see Gamut Mapping)
- **H** — hue angle, 0 to 360

### Accepted Seed Input Formats

The engine accepts seed colors in the following formats only:

- Hex: \`#rrggbb\`, \`#rgb\`
- RGB: \`rgb(r, g, b)\` with values 0–255
- HSL: \`hsl(h, s%, l%)\`
- OKLCH: \`oklch(L C H)\`

All input formats are normalized to OKLCH at the engine boundary before any processing occurs. This normalization layer is the one place a small, well-understood conversion utility may be used — it is not part of the engine core. The engine core receives OKLCH values only and has zero external dependencies.

Named colors, display-p3, color-mix(), relative color syntax, and other CSS color formats are explicitly out of scope for v1. Passing an unsupported format produces a validation error with a clear message, not silent failure or incorrect output.

### Seed Validation and Normalization

Before ramp generation begins, the seed is validated against the following bounds:

**Minimum viable chroma:** C < 0.04 is considered achromatic. An achromatic seed cannot drive a meaningful harmony strategy. The engine must reject it with a descriptive error. If the consumer needs a neutral-only system they pass a near-neutral seed and select monochromatic harmony explicitly — the engine does not silently fall back to this.

**Lightness bounds:** Seeds with L < 0.08 or L > 0.92 are flagged as edge cases. The engine does not reject them but emits a warning: very dark or very light seeds produce ramps where the usable midrange is compressed and contrast targets become difficult to satisfy. The consumer is informed, not blocked.

**Lightness adjustment for usability:** If the seed lightness falls outside L 0.25–0.75, the engine clamps the seed lightness to the nearest bound before deriving the seed hue and chroma. The original seed color is preserved in the output metadata for reference. This clamping affects only the seed used for ramp generation — the consumer's actual brand or input color is not lost.

All warnings include the specific value that triggered them and the specific consequence to expect in the output.

### Gamut Mapping

OKLCH can describe colors outside the sRGB gamut. This is not an edge case — it occurs routinely for saturated mid-lightness values in the vibrant mood. The engine must handle this explicitly.

**Strategy: chroma reduction at constant L and H.** When a computed OKLCH value falls outside the sRGB gamut, reduce C in small decrements (0.001 steps) while holding L and H constant until the value is in gamut. This preserves hue and lightness — the perceptual properties that matter for ramp consistency — while bringing the color into range.

**Target gamut: sRGB** is the minimum required target. All output values must be valid sRGB. 

**P3 enhancement:** Where the engine generates an sRGB-mapped value, it should also generate the P3 equivalent (the original OKLCH value if it falls within P3 gamut, or the P3-gamut-mapped value). Output both. The token output layer decides which to use based on context and browser support. The engine does not make this decision.

**Chroma ceiling guidance:** Actual maximum chroma varies by hue and lightness and cannot be stated as a single number. The gamut mapping algorithm handles this dynamically — there is no hardcoded chroma ceiling in the engine. Attempting to set a static chroma maximum would produce inconsistent results across hues.

### Ramp Model

Each hue gets **two ramps**, not one:

- **Light ramp** — 12 steps concentrated and evenly distributed in the range L 0.92 down to L 0.55. Designed for surfaces, components, and elements on light backgrounds.
- **Dark ramp** — 12 steps concentrated and evenly distributed in the range L 0.45 down to L 0.08. Designed for dark background contexts.

A single full-range ramp cannot satisfy both requirements simultaneously. Steps fine enough for smooth state transitions at the light end are too coarse at the dark end and vice versa. The two-ramp model eliminates this tension.

**State transitions are a structural property of the ramp.** Rest, hover, and active states are adjacent steps within the appropriate ramp. This is not a per-component decision. The minimum perceptible lightness difference between adjacent steps is defined as ΔL ≥ 0.035 in OKLCH. This value ensures a visible but not jarring state shift at any point in the ramp. If a computed ramp produces adjacent steps with ΔL < 0.035, the ramp distribution must be adjusted. This is verified as part of ramp generation, not as a post-hoc assertion.

### Chroma Behavior

Chroma is tapered at both extremes of each ramp. Full chroma at very light or very dark values produces washed-out lights and muddy darks. The taper follows a smooth curve — not a cliff — beginning around L 0.85 on the light end and L 0.20 on the dark end.

The mood argument controls the chroma envelope:
- **vibrant** — chroma held near the gamut boundary across the midrange, tapered only at extremes
- **muted** — chroma tapered aggressively across the full range, producing near-pastel lights and near-neutral darks
- **neutral** — chroma reduced to C ≤ 0.04 across the full ramp, producing near-achromatic steps with trace hue presence

### Neutral Ramp

The neutral ramp is not a gray ramp. It is derived from the seed hue with chroma held at C 0.015 (light ramp) and C 0.012 (dark ramp) — low enough to read as neutral in isolation, present enough to feel tonally related to the generated palette rather than disconnected from it.

The neutral ramp uses the same 12-step light/dark structure as all other ramps. Its lightness distribution follows the same L bounds: 0.92–0.55 for the light ramp, 0.45–0.08 for the dark ramp. Neutral steps are the primary source for surface backgrounds, text colors, and border colors across both light and dark themes.

### Hue Behavior

Hue is held constant across steps with one tunable exception: hue rotation at the dark end of a ramp. Blues benefit from a subtle shift toward purple (H + 8 to H + 15) at very dark values to prevent the hue from reading as black-blue. This rotation is a named parameter defaulting to 0, with recommended values documented per hue range. It is not applied automatically.

### Harmony Strategy

From a single seed hue, the engine derives supporting hues using standard color theory relationships computed in OKLCH hue space:

- **complementary** — seed hue + 180
- **analogous** — seed hue ± 30
- **triadic** — seed hue + 120, seed hue + 240
- **split-complementary** — (seed hue + 180) ± 30
- **monochromatic** — seed hue only, multiple chroma levels

The harmony strategy is a required input. There is no default — the consumer declares intent explicitly.

### Anchored Status Hues

Four hue positions are anchored regardless of seed and harmony strategy. These must not shift when the seed changes:

- **Danger** — anchored H 25 (red-orange in OKLCH)
- **Warning** — anchored H 65 (amber)
- **Success** — anchored H 145 (green)
- **Info** — anchored H 245 (blue)

These are tunable defaults. A consumer may override them deliberately. The harmony algorithm must never override them automatically. Status ramps are generated with the same two-ramp model as all other hues.

### Primitive Naming

Primitives are named by **structure, not color**. Color names are meaningless at generation time because the hue is not known until a seed is provided.

Convention:
\`\`\`
palette-a-l-{1..12}     // primary seed ramp, light
palette-a-d-{1..12}     // primary seed ramp, dark
palette-b-l-{1..12}     // first harmony ramp, light
palette-b-d-{1..12}     // first harmony ramp, dark
palette-c-l-{1..12}     // second harmony ramp if applicable, light
palette-c-d-{1..12}     // second harmony ramp, dark
neutral-l-{1..12}       // seed-tinted near-achromatic, light
neutral-d-{1..12}       // seed-tinted near-achromatic, dark
status-danger-l-{1..12}
status-danger-d-{1..12}
status-warning-l-{1..12}
status-warning-d-{1..12}
status-success-l-{1..12}
status-success-d-{1..12}
status-info-l-{1..12}
status-info-d-{1..12}
\`\`\`

Primitive tokens are never consumed directly by components. They are only referenced by semantic tokens.

---

## Contrast Validation

### Algorithm

Contrast is evaluated using **APCA** (Advanced Perceptual Contrast Algorithm). The WCAG 2.x relative luminance formula produces incorrect results for mid-tones and is not acceptable. APCA is implemented from the published specification. No external APCA package is taken as a dependency.

Verify the implementation against all published APCA sample values before treating it as correct. A single wrong constant in the formula produces plausible-looking but wrong output.

### Minimum Thresholds (APCA Bronze)

| Use case | Minimum Lc |
|---|---|
| Body text | 75 |
| Large / heading text | 60 |
| UI components (buttons, inputs) | 45 |
| Non-text indicators (meaningful borders, icons) | 30 |
| Decorative / disabled | No requirement |

Note: Lc 15 is below the threshold of perceptible meaningful distinction for any UI element that must communicate information. The minimum for any non-decorative non-text element is Lc 30.

### Assertion Model

The engine validates **relationships**, not individual token values. Assertions cover:

- semantic-text-primary on semantic-surface-default must meet Lc 75
- semantic-text-secondary on semantic-surface-default must meet Lc 60
- semantic-text-primary on semantic-surface-raised must meet Lc 75
- semantic-text-primary on semantic-surface-tinted must meet Lc 75
- semantic-interactive-border on semantic-surface-default must meet Lc 30
- semantic-status-danger-text on semantic-status-danger-bg must meet Lc 45
- (equivalent assertions for warning, success, info)
- on-container text must meet Lc 60 against its container background for all semantic status pairs

**State differentiation is not an APCA assertion.** The minimum perceptible difference between rest, hover, and active states is a ΔL ≥ 0.035 property of the ramp structure itself — enforced at ramp generation time, not at the assertion layer. APCA Lc values are not used to validate state differentiation. Attempting to compute an Lc delta between two surface states is a category error.

Assertion failures surface as warnings with specific failing token pairs and their actual Lc values identified. They do not silently produce an invalid theme. The engine emits a complete output in all cases — the consumer decides whether to proceed with a flagged theme.

---

## Semantic Role Inventory

The semantic layer maps structural primitives to named functional roles. The M3 color roles specification (m3.material.io/styles/color/roles) is the reference inventory, adapted to this system's requirements.

Required role categories:

**Surface roles** — base surface, raised surface (cards, elevated containers), overlay surface (modals, popovers), tinted surface (seed-hued panels and regions with no status meaning). Each defined for both light and dark themes.

**Text roles per surface** — primary text, secondary text, disabled text. Each surface level carries its own text role set because the background changes between levels. Text roles are verified against every surface they may appear on.

**Interactive roles** — background at rest, hover, active, focus ring, disabled. These are verified against their foreground text at every state. State steps are drawn from adjacent ramp positions — structural differentiation, not individually authored values.

**Container/on-container pairs** — a softened tinted background and a legible foreground for chips, badges, tags, tonal panels. Required for every semantic color including the generated palette hues, not only status colors. Each on-container foreground must meet Lc 60 against its container.

**Status roles** — for each of danger, warning, success, info: background, on-background text, container, on-container text, border. Border must meet Lc 30 against the surface it appears on.

**Border and separator roles** — strong border (input outlines, focused states, Lc 30 minimum against adjacent surface), subtle border (card edges, dividers, Lc 15 acceptable for purely decorative separation).

Semantic token naming convention:
\`\`\`
--{namespace}-{category}-{element}-{variant}-{state}
\`\`\`

All semantic tokens are CSS custom properties. Theme application is a remapping of semantic tokens at :root or a theme wrapper element. Primitive values never change between themes. Only semantic mappings change.

---

## Surfaces

Surfaces are a **constrained, explicit set**. Components are designed against this set only. No other surface is a supported hosting context.

- **surface-base** — default page background
- **surface-raised** — cards, contained sections
- **surface-overlay** — modals, popovers, tooltips
- **surface-tinted** — one softly tinted surface derived from palette-a light ramp step 2, for panels and contained regions that need hue presence without status meaning

The tinted surface exists specifically to provide a non-semantic home for decorative tinted panels — eliminating the need to reach into status token territory for purely visual purposes. Components must be verified against all four surfaces. A component verified only against surface-base is incomplete.

---

## Theme Variants

From a single seed the engine produces three complete theme variants:

**Light theme** — semantic tokens draw from light ramps. Backgrounds are high lightness, text is low lightness.

**Dark theme** — semantic tokens draw from dark ramps. Backgrounds are low lightness, text is high lightness. This is a semantic remapping only. Primitives do not change.

**High contrast theme** — semantic tokens draw from more extreme steps in the existing ramps. Text-on-surface contrast targets Lc 90+. Not a new ramp generation — a tighter remapping of the same primitives with elevated assertion minimums.

---

## Engine API

The engine is a pure function. Given inputs, it produces a complete token set. No side effects, no global state.

\`\`\`typescript
type HarmonyStrategy =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'monochromatic';

type Mood = 'vibrant' | 'muted' | 'neutral';

type SeedFormat = 'hex' | 'rgb' | 'hsl' | 'oklch';

interface EngineInput {
  seed: string;              // hex, rgb(), hsl(), or oklch() only
  harmony: HarmonyStrategy;  // required, no default
  mood?: Mood;               // defaults to 'vibrant'
  overrides?: {
    statusHues?: Partial<StatusHueAnchors>;
    hueRotation?: Partial<HueRotationConfig>;
  };
}

interface EngineOutput {
  primitives: {
    srgb: Record<string, string>;   // All primitive tokens, sRGB gamut-mapped
    p3: Record<string, string>;     // P3 equivalents where available
  };
  semantic: {
    light: Record<string, string>;
    dark: Record<string, string>;
    highContrast: Record<string, string>;
  };
  assertions: AssertionResult[];    // Pass/fail for all contrast relationships
  warnings: EngineWarning[];        // Seed validation issues, gamut mapping events, ΔL violations
  metadata: {
    inputSeed: string;              // Original seed as provided
    normalizedSeed: OklchValue;     // Seed after format conversion
    adjustedSeed: OklchValue;       // Seed after lightness clamping if applied
    seedAdjusted: boolean;
  };
}
\`\`\`

---

## Package Structure

Monorepo using Turborepo.

\`\`\`
packages/
  @ds/engine          // Color engine, APCA, ramp generator — zero runtime dependencies
  @ds/tokens          // Semantic role definitions, CSS custom property output, theme application
  @ds/layout          // Stack, Box, Cluster, Sidebar, Grid, Frame, Cover, Switcher
  @ds/primitives      // Forked headless behavior layer (Radix fork at known good commit)
  @ds/components      // Styled components consuming primitives + tokens
  @ds/icons           // Icon system
  @ds/themes          // Pre-built theme configurations, theme generator utilities

apps/
  docs/               // Documentation and Storybook
  kitchen-sink/       // Full integration testbed
\`\`\`

@ds/engine has zero runtime external dependencies. This is enforced. The APCA implementation lives here and is written from the specification. The input normalization layer at the engine boundary may use a minimal, well-understood CSS color parsing utility — this is the sole permitted exception and it must have no transitive dependencies of its own.

@ds/primitives is a fork of Radix UI Primitives at a known stable commit. It is not updated automatically. Upstream changes are evaluated manually and cherry-picked deliberately.

---

## Escape Hatch

An explicit, deliberate escape mechanism exists for consumers who need to go outside the generated system. It is not a context token that silently overrides. It is a visible boundary that says: beyond this point you own what happens.

The escape hatch is documented, not discouraged. The goal is that it is rarely needed because the generative output is genuinely good. When it is needed it is clean and explicit rather than accumulated override debt.

---

## What This Step Produces

On completion of step one the system has:

1. A working color engine that accepts seed + harmony + mood and produces a complete primitive token set in both sRGB and P3
2. An input normalization layer handling hex, rgb(), hsl(), and oklch() formats
3. Seed validation with explicit bounds, error conditions, and warning thresholds
4. Gamut mapping via chroma reduction at constant L and H
5. Two ramps per hue (light and dark) with ΔL ≥ 0.035 between adjacent steps verified at generation time
6. An APCA implementation tested against published sample values
7. A semantic role inventory with all required categories defined
8. A semantic mapping layer producing light, dark, and high contrast themes
9. An assertion suite validating all required contrast relationships using corrected APCA thresholds
10. CSS custom property output for all three theme variants in both sRGB and P3
11. Structured warnings for seed edge cases, gamut mapping events, and assertion failures

Nothing else. Components, layout primitives, and the headless behavior layer are subsequent steps. The engine must be complete and correct before anything builds on top of it.`;

const REVIEW_SYSTEM = `You are a senior principal engineer and design systems architect with deep expertise in color science, token architecture, accessibility standards, and frontend system design. You have built production design systems for large organizations.

You are reviewing a detailed technical prompt that will be used to initiate work on a design system color engine and token architecture. This is revision 2 — it has already been reviewed once and corrected. Your job is to find anything that remains wrong or incomplete:

1. Technical inaccuracies or errors
2. Missing requirements that will cause problems later
3. Internal contradictions
4. Ambiguities that will cause misinterpretation
5. Anything overconstrained in a way that will cause implementation problems
6. Anything underconstrained that will cause drift or inconsistency

Be direct and specific. Reference exact sections. Do not pad with praise. If something is correct and complete, move on. The goal is to find genuine remaining problems, not to appear thorough.

Format your response as:

## Critical Issues
Things that will cause the implementation to fail or produce wrong results.

## Missing Requirements
Things not addressed that will create problems downstream.

## Ambiguities
Things stated unclearly enough to cause misinterpretation.

## Minor Issues
Small corrections or tightenings worth making.

## Assessment
One paragraph on whether this prompt is ready to hand to an implementation agent or needs another revision pass.`;

export default function DesignSystemPrompt() {
  const [activeTab, setActiveTab] = useState("prompt");
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [copied, setCopied] = useState(false);

  const runReview = async () => {
    setReviewing(true);
    setActiveTab("review");
    setReview(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: REVIEW_SYSTEM,
          messages: [
            {
              role: "user",
              content: `Please review this revised design system foundation prompt:\n\n${INITIAL_PROMPT}`
            }
          ]
        })
      });

      const data = await response.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "No response received.";
      setReview(text);
    } catch (err) {
      setReview(`Review failed: ${err.message}`);
    } finally {
      setReviewing(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(INITIAL_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMarkdown = (text) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeLines = [];

    return lines.map((line, i) => {
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLines = [];
          return null;
        } else {
          inCodeBlock = false;
          const code = codeLines.join("\n");
          codeLines = [];
          return (
            <pre key={i} style={{
              background: "#0d1117",
              border: "1px solid #21262d",
              borderRadius: "6px",
              padding: "16px",
              fontSize: "11px",
              color: "#a5d6ff",
              overflowX: "auto",
              margin: "12px 0",
              lineHeight: 1.6
            }}>{code}</pre>
          );
        }
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return null;
      }

      if (line.startsWith("## ")) {
        return <h2 key={i} style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0", marginTop: "28px", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #21262d", paddingBottom: "6px" }}>{line.slice(3)}</h2>;
      }
      if (line.startsWith("# ")) {
        return (
          <div key={i} style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#f7fafc", marginBottom: "4px" }}>{line.slice(2)}</h1>
          </div>
        );
      }
      if (line.startsWith("### ")) {
        return <h3 key={i} style={{ fontSize: "11px", fontWeight: 600, color: "#79c0ff", marginTop: "18px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{line.slice(4)}</h3>;
      }

      if (line.match(/^\|/)) {
        const cells = line.split("|").filter(c => c.trim() !== "");
        const isSeparator = cells.every(c => c.trim().match(/^-+$/));
        if (isSeparator) return null;
        return (
          <div key={i} style={{ display: "flex", borderBottom: "1px solid #21262d", padding: "4px 0" }}>
            {cells.map((cell, j) => (
              <div key={j} style={{ flex: 1, fontSize: "12px", color: "#cbd5e0", padding: "2px 8px" }}>{cell.trim()}</div>
            ))}
          </div>
        );
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        const content = line.slice(2);
        const boldParts = content.split(/\*\*(.*?)\*\*/g);
        return (
          <li key={i} style={{ fontSize: "13px", color: "#cbd5e0", lineHeight: 1.7, marginLeft: "20px", marginBottom: "3px", listStyleType: "disc" }}>
            {boldParts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} style={{ color: "#e2e8f0", fontWeight: 600 }}>{part}</strong> : part
            )}
          </li>
        );
      }

      if (line.trim() === "---") {
        return <hr key={i} style={{ border: "none", borderTop: "1px solid #21262d", margin: "24px 0" }} />;
      }

      if (line.trim() === "") {
        return <div key={i} style={{ height: "4px" }} />;
      }

      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      if (boldParts.length > 1) {
        return (
          <p key={i} style={{ fontSize: "13px", color: "#cbd5e0", lineHeight: 1.75, marginBottom: "4px" }}>
            {boldParts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} style={{ color: "#e2e8f0", fontWeight: 600 }}>{part}</strong> : part
            )}
          </p>
        );
      }

      const inlineParts = line.split(/`([^`]+)`/g);
      if (inlineParts.length > 1) {
        return (
          <p key={i} style={{ fontSize: "13px", color: "#cbd5e0", lineHeight: 1.75, marginBottom: "4px" }}>
            {inlineParts.map((part, j) =>
              j % 2 === 1
                ? <code key={j} style={{ background: "#1c2128", border: "1px solid #30363d", borderRadius: "3px", padding: "1px 5px", fontSize: "11px", color: "#a5d6ff", fontFamily: "inherit" }}>{part}</code>
                : part
            )}
          </p>
        );
      }

      return <p key={i} style={{ fontSize: "13px", color: "#cbd5e0", lineHeight: 1.75, marginBottom: "4px" }}>{line}</p>;
    });
  };

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      background: "#0d1117",
      minHeight: "100vh",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{
        background: "#161b22",
        borderBottom: "1px solid #21262d",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap"
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#8b949e", marginBottom: "2px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Design System Foundation</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#f0f6fc" }}>Color Engine & Token Architecture</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <span style={{ fontSize: "10px", background: "#1f3a1f", border: "1px solid #2ea043", color: "#3fb950", padding: "1px 8px", borderRadius: "20px", letterSpacing: "0.06em" }}>REVISION 2</span>
            <span style={{ fontSize: "10px", color: "#6e7681" }}>Post sub-agent review corrections applied</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={copyPrompt}
            style={{
              background: copied ? "#1a472a" : "#21262d",
              border: `1px solid ${copied ? "#2ea043" : "#30363d"}`,
              color: copied ? "#3fb950" : "#8b949e",
              padding: "7px 14px",
              borderRadius: "6px",
              fontSize: "11px",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
              letterSpacing: "0.04em"
            }}
          >
            {copied ? "✓ Copied" : "Copy Prompt"}
          </button>
          <button
            onClick={runReview}
            disabled={reviewing}
            style={{
              background: reviewing ? "#21262d" : "#238636",
              border: `1px solid ${reviewing ? "#30363d" : "#2ea043"}`,
              color: reviewing ? "#8b949e" : "#f0f6fc",
              padding: "7px 14px",
              borderRadius: "6px",
              fontSize: "11px",
              cursor: reviewing ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
              letterSpacing: "0.04em",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {reviewing && (
              <span style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                border: "2px solid #8b949e",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }} />
            )}
            {reviewing ? "Reviewing..." : "Run Sub-Agent Review"}
          </button>
        </div>
      </div>

      <div style={{
        background: "#161b22",
        borderBottom: "1px solid #21262d",
        padding: "0 24px",
        display: "flex"
      }}>
        {["prompt", "review"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #f78166" : "2px solid transparent",
              color: activeTab === tab ? "#f0f6fc" : "#8b949e",
              padding: "10px 16px",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: activeTab === tab ? 600 : 400,
              transition: "all 0.15s"
            }}
          >
            {tab === "prompt" ? "Prompt" : `Sub-Agent Review${review ? "" : reviewing ? " ⟳" : ""}`}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {activeTab === "prompt" && (
          <div style={{
            maxWidth: "820px",
            margin: "0 auto",
            background: "#161b22",
            border: "1px solid #21262d",
            borderRadius: "8px",
            padding: "36px"
          }}>
            {renderMarkdown(INITIAL_PROMPT)}
          </div>
        )}

        {activeTab === "review" && (
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            {reviewing && (
              <div style={{
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "56px",
                textAlign: "center",
                color: "#8b949e"
              }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  border: "2px solid #30363d",
                  borderTopColor: "#58a6ff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px"
                }} />
                <div style={{ fontSize: "13px" }}>Sub-agent reviewing revision 2...</div>
                <div style={{ fontSize: "11px", marginTop: "6px", color: "#6e7681" }}>Cold read — no access to conversation history</div>
              </div>
            )}

            {!reviewing && !review && (
              <div style={{
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "56px",
                textAlign: "center",
                color: "#8b949e"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }}>⟳</div>
                <div style={{ fontSize: "13px" }}>Press "Run Sub-Agent Review" to have an independent agent critique revision 2</div>
                <div style={{ fontSize: "11px", marginTop: "6px", color: "#6e7681" }}>The review agent has no access to this conversation</div>
              </div>
            )}

            {review && (
              <div style={{
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "36px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "24px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #21262d"
                }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3fb950" }} />
                  <span style={{ fontSize: "10px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sub-Agent Review — Revision 2</span>
                </div>
                {renderMarkdown(review)}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
      `}</style>
    </div>
  );
}
