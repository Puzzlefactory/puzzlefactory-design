import {
  createColorEngineTheme,
  ColorEngineValidationError,
  type AssertionResult,
  type EngineInput,
  type EngineOutput,
  type HarmonyStrategy,
  type Mood,
  type PaletteSlot,
  type PrimitiveTokenName,
  type RampTone,
  type SemanticThemeKey,
  type SemanticTokenName,
  type Step,
} from "@puzzlefactory/color-engine";
import {
  createTokenCssOutput,
  type TokenCssRenderResult,
} from "@puzzlefactory/tokens";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router";

const navItems = [
  { to: "/overview", label: "Overview" },
  { to: "/controls", label: "Controls" },
  { to: "/primitives", label: "Primitives" },
  { to: "/semantic", label: "Semantic" },
  { to: "/themes", label: "Themes" },
  { to: "/assertions", label: "Assertions" },
] as const;

const harmonyOptions: readonly HarmonyStrategy[] = [
  "complementary",
  "analogous",
  "triadic",
  "split-complementary",
  "monochromatic",
];

const moodOptions: readonly Mood[] = ["vibrant", "muted", "neutral"];

const themeOptions = [
  { key: "light", dataTheme: "light", label: "Light" },
  { key: "dark", dataTheme: "dark", label: "Dark" },
  { key: "highContrast", dataTheme: "high-contrast", label: "High Contrast" },
  {
    key: "highContrastDark",
    dataTheme: "high-contrast-dark",
    label: "High Contrast Dark",
  },
] as const satisfies readonly {
  readonly key: SemanticThemeKey;
  readonly dataTheme: string;
  readonly label: string;
}[];

const semanticPreviewGroups = [
  {
    label: "Surface and text",
    tokens: ["surface-base", "surface-raised", "surface-tinted", "text-primary", "text-secondary"],
  },
  {
    label: "Interactive",
    tokens: [
      "interactive-bg-rest",
      "interactive-bg-hover",
      "interactive-bg-active",
      "interactive-text",
      "interactive-border",
    ],
  },
  {
    label: "Status",
    tokens: [
      "status-danger-bg",
      "status-warning-bg",
      "status-success-bg",
      "status-info-bg",
      "status-danger-text",
      "status-warning-text",
    ],
  },
] as const satisfies readonly {
  readonly label: string;
  readonly tokens: readonly SemanticTokenName[];
}[];

export function App() {
  const [seed, setSeed] = useState("#3366ff");
  const [harmony, setHarmony] = useState<HarmonyStrategy>("complementary");
  const [mood, setMood] = useState<Mood>("vibrant");
  const [theme, setTheme] = useState<SemanticThemeKey>("light");

  const engine = useMemo(
    () => createEngineState({ seed, harmony, mood, namespace: "ds" }),
    [seed, harmony, mood],
  );
  const activeTheme = themeOptions.find((option) => option.key === theme) ?? themeOptions[0];

  return (
    <div className="app-shell" data-theme={activeTheme.dataTheme}>
      {engine.kind === "ready" ? <TokenStyles css={engine.css} /> : null}
      <aside className="sidebar" aria-label="Kitchen sink navigation">
        <div className="brand-block">
          <span className="eyebrow">PuzzleFactory</span>
          <h1>Color Engine Kitchen Sink</h1>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route
            path="/overview"
            element={<Overview engine={engine} activeTheme={activeTheme.label} />}
          />
          <Route
            path="/controls"
            element={
              <SeedControls
                seed={seed}
                harmony={harmony}
                mood={mood}
                theme={theme}
                engine={engine}
                onSeedChange={setSeed}
                onHarmonyChange={setHarmony}
                onMoodChange={setMood}
                onThemeChange={setTheme}
              />
            }
          />
          <Route path="/primitives" element={<Primitives engine={engine} />} />
          <Route path="/semantic" element={<SemanticPreview engine={engine} />} />
          <Route path="/themes" element={<ThemeVariants engine={engine} />} />
          <Route path="/assertions" element={<Assertions engine={engine} />} />
        </Routes>
      </main>
    </div>
  );
}

function Overview({
  engine,
  activeTheme,
}: {
  engine: EngineState;
  activeTheme: string;
}) {
  const summary = engine.kind === "ready" ? summarizeOutput(engine.output) : undefined;

  return (
    <ViewFrame
      title="Engine Verification"
      subtitle="Live output from the color engine and token CSS renderer."
    >
      <section className="metric-grid" aria-label="Engine summary">
        <Metric label="Active theme" value={activeTheme} />
        <Metric
          label="Primitive tokens"
          value={summary?.primitiveCount.toString() ?? "Invalid input"}
        />
        <Metric label="Assertions" value={summary?.assertionSummary ?? "Invalid input"} />
        <Metric label="Warnings" value={summary?.warningCount.toString() ?? "Invalid input"} />
      </section>
      <section className="overview-grid" aria-label="Verification areas">
        {navItems.slice(1).map((item) => (
          <NavLink className="area-link" key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </section>
    </ViewFrame>
  );
}

function SeedControls({
  seed,
  harmony,
  mood,
  theme,
  engine,
  onSeedChange,
  onHarmonyChange,
  onMoodChange,
  onThemeChange,
}: {
  seed: string;
  harmony: HarmonyStrategy;
  mood: Mood;
  theme: SemanticThemeKey;
  engine: EngineState;
  onSeedChange: (value: string) => void;
  onHarmonyChange: (value: HarmonyStrategy) => void;
  onMoodChange: (value: Mood) => void;
  onThemeChange: (value: SemanticThemeKey) => void;
}) {
  return (
    <ViewFrame
      title="Seed Controls"
      subtitle="Edit the engine input and inspect the generated output across routes."
    >
      <section className="toolbar-grid" aria-label="Seed controls">
        <label className="field">
          <span>Seed</span>
          <input value={seed} onChange={(event) => onSeedChange(event.target.value)} />
        </label>
        <label className="field">
          <span>Harmony</span>
          <select
            value={harmony}
            onChange={(event) => onHarmonyChange(event.target.value as HarmonyStrategy)}
          >
            {harmonyOptions.map((option) => (
              <option key={option} value={option}>
                {labelize(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Mood</span>
          <select value={mood} onChange={(event) => onMoodChange(event.target.value as Mood)}>
            {moodOptions.map((option) => (
              <option key={option} value={option}>
                {labelize(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Theme</span>
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as SemanticThemeKey)}
          >
            {themeOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>
      {engine.kind === "error" ? (
        <div className="notice notice-fail" role="alert">
          <strong>{engine.code}</strong>
          <span>{engine.message}</span>
        </div>
      ) : (
        <EngineMetadata output={engine.output} css={engine.css} />
      )}
    </ViewFrame>
  );
}

function Primitives({ engine }: { engine: EngineState }) {
  if (engine.kind === "error") {
    return <ErrorView engine={engine} />;
  }

  const groups = groupPrimitiveTokens(engine.output);

  return (
    <ViewFrame
      title="Primitive Ramps"
      subtitle="Generated OKLCH primitive tokens grouped by slot and split light/dark ramps."
    >
      <section className="ramp-stack" aria-label="Primitive ramps">
        {groups.map((group) => (
          <article className="ramp-panel" key={group.slot}>
            <header className="panel-header">
              <h3>{group.slot}</h3>
              <span>{group.light.length + group.dark.length} tokens</span>
            </header>
            <RampRow label="Light" tokens={group.light} namespace={engine.css.namespace} />
            <RampRow label="Dark" tokens={group.dark} namespace={engine.css.namespace} />
          </article>
        ))}
      </section>
    </ViewFrame>
  );
}

function SemanticPreview({ engine }: { engine: EngineState }) {
  if (engine.kind === "error") {
    return <ErrorView engine={engine} />;
  }

  return (
    <ViewFrame
      title="Semantic Preview"
      subtitle="Semantic roles rendered through generated CSS variables."
    >
      <section className="semantic-layout">
        {semanticPreviewGroups.map((group) => (
          <article className="semantic-panel" key={group.label}>
            <header className="panel-header">
              <h3>{group.label}</h3>
              <span>{group.tokens.length} roles</span>
            </header>
            <div className="semantic-grid">
              {group.tokens.map((token) => (
                <SemanticSwatch key={token} token={token} namespace={engine.css.namespace} />
              ))}
            </div>
          </article>
        ))}
        <ComponentPreview />
      </section>
    </ViewFrame>
  );
}

function ThemeVariants({ engine }: { engine: EngineState }) {
  if (engine.kind === "error") {
    return <ErrorView engine={engine} />;
  }

  return (
    <ViewFrame
      title="Theme Variants"
      subtitle="The same generated semantic roles rendered under each supported theme variant."
    >
      <section className="preview-grid" aria-label="Theme variants">
        {themeOptions.map((variant) => (
          <article className="theme-tile" data-theme={variant.dataTheme} key={variant.key}>
            <header>
              <h3>{variant.label}</h3>
              <span>{variant.dataTheme}</span>
            </header>
            <div className="theme-sample">
              <strong>Panel sample</strong>
              <p>Text, surface, border, and action roles come from generated semantic tokens.</p>
              <button type="button">Action</button>
            </div>
          </article>
        ))}
      </section>
    </ViewFrame>
  );
}

function Assertions({ engine }: { engine: EngineState }) {
  if (engine.kind === "error") {
    return <ErrorView engine={engine} />;
  }

  const visibleAssertions = engine.output.assertions
    .filter((assertion) => assertion.status !== "pass")
    .slice(0, 18);

  return (
    <ViewFrame
      title="Assertion Report"
      subtitle="Contrast warnings and failures are reported by the generated engine output."
    >
      <section className="metric-grid" aria-label="Assertion summary">
        <Metric label="Pass" value={countAssertions(engine.output.assertions, "pass").toString()} />
        <Metric
          label="Warning"
          value={countAssertions(engine.output.assertions, "warning").toString()}
        />
        <Metric label="Fail" value={countAssertions(engine.output.assertions, "fail").toString()} />
        <Metric label="Warnings" value={engine.output.warnings.length.toString()} />
      </section>
      <DataTable
        columns={["Theme", "Pair", "Status", "Lc", "Source"]}
        rows={visibleAssertions.map(assertionToRow)}
      />
      <section className="warning-list" aria-label="Engine warnings">
        {engine.output.warnings.map((warning) => (
          <article className="notice" key={`${warning.code}:${warning.message}`}>
            <strong>{warning.code}</strong>
            <span>{warning.message}</span>
          </article>
        ))}
      </section>
    </ViewFrame>
  );
}

function TokenStyles({ css }: { css: TokenCssRenderResult }) {
  const source = Object.values(css.files).join("\n\n");

  return <style data-generated-token-css>{source}</style>;
}

function EngineMetadata({
  output,
  css,
}: {
  output: EngineOutput;
  css: TokenCssRenderResult;
}) {
  return (
    <section className="metadata-grid" aria-label="Generated output metadata">
      <Metric label="Namespace" value={css.namespace} />
      <Metric label="Input seed" value={output.metadata.inputSeed} />
      <Metric
        label="Adjusted seed"
        value={`L ${formatNumber(output.metadata.adjustedSeed.l)} C ${formatNumber(
          output.metadata.adjustedSeed.c,
        )} H ${formatNumber(output.metadata.adjustedSeed.h)}`}
      />
      <Metric label="P3 overrides" value={Object.keys(output.primitives.p3).length.toString()} />
      <Metric label="CSS files" value={Object.keys(css.files).length.toString()} />
      <Metric label="Gamut mapped" value={output.metadata.gamutMappedCount.toString()} />
    </section>
  );
}

function ComponentPreview() {
  return (
    <article className="component-strip" aria-label="Semantic component preview">
      <div className="preview-copy">
        <h3>Generated Semantic Roles</h3>
        <p>Preview text and controls use the active semantic custom properties.</p>
      </div>
      <button type="button">Primary</button>
      <button type="button" className="secondary-button">
        Secondary
      </button>
      <input aria-label="Example input" placeholder="Field preview" />
    </article>
  );
}

function SemanticSwatch({
  token,
  namespace,
}: {
  token: SemanticTokenName;
  namespace: string;
}) {
  return (
    <div className="semantic-swatch">
      <span
        className="semantic-chip"
        style={{ background: cssVar(namespace, token) }}
        aria-hidden="true"
      />
      <div>
        <strong>{token}</strong>
        <code>{cssVar(namespace, token)}</code>
      </div>
    </div>
  );
}

function RampRow({
  label,
  tokens,
  namespace,
}: {
  label: string;
  tokens: readonly PrimitiveRampToken[];
  namespace: string;
}) {
  return (
    <div className="ramp-row">
      <span>{label}</span>
      <div className="swatch-row">
        {tokens.map((token) => (
          <div className="swatch-cell" key={token.name}>
            <span
              className="swatch"
              style={{ background: cssVar(namespace, token.name) }}
              title={`${token.name}: ${token.value}`}
            />
            <small>{token.step}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorView({ engine }: { engine: Extract<EngineState, { kind: "error" }> }) {
  return (
    <ViewFrame title="Invalid Engine Input" subtitle="The color engine rejected the current input.">
      <div className="notice notice-fail" role="alert">
        <strong>{engine.code}</strong>
        <span>{engine.message}</span>
      </div>
    </ViewFrame>
  );
}

function ViewFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="view-frame">
      <header className="view-header">
        <span className="eyebrow">Kitchen Sink</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataTable({
  columns,
  rows,
}: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.join(":")}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>No assertion warnings or failures.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function createEngineState(input: EngineInput): EngineState {
  try {
    const output = createColorEngineTheme(input);

    return {
      kind: "ready",
      output,
      css: createTokenCssOutput(output),
    };
  } catch (error) {
    if (error instanceof ColorEngineValidationError) {
      return {
        kind: "error",
        code: error.code,
        message: error.message,
      };
    }

    throw error;
  }
}

function summarizeOutput(output: EngineOutput) {
  const failCount = countAssertions(output.assertions, "fail");
  const warningCount = countAssertions(output.assertions, "warning");

  return {
    primitiveCount: Object.keys(output.primitives.srgb).length,
    assertionSummary: `${failCount} fail / ${warningCount} warn`,
    warningCount: output.warnings.length,
  };
}

function groupPrimitiveTokens(output: EngineOutput): readonly PrimitiveRampGroup[] {
  const groups = new Map<PaletteSlot, { light: PrimitiveRampToken[]; dark: PrimitiveRampToken[] }>();

  for (const [name, value] of Object.entries(output.primitives.srgb)) {
    const parsed = parsePrimitiveName(name as PrimitiveTokenName);
    const group = groups.get(parsed.slot) ?? { light: [], dark: [] };
    const token = {
      name: name as PrimitiveTokenName,
      value,
      step: parsed.step,
    };

    if (parsed.tone === "l") {
      group.light.push(token);
    } else {
      group.dark.push(token);
    }

    groups.set(parsed.slot, group);
  }

  return [...groups.entries()].map(([slot, group]) => ({
    slot,
    light: group.light.sort(byStep),
    dark: group.dark.sort(byStep),
  }));
}

function parsePrimitiveName(name: PrimitiveTokenName): {
  readonly slot: PaletteSlot;
  readonly tone: RampTone;
  readonly step: Step;
} {
  const match = /^(.*)-([ld])-([0-9]+)$/.exec(name);

  if (!match) {
    throw new Error(`Invalid primitive token name: ${name}`);
  }

  return {
    slot: match[1] as PaletteSlot,
    tone: match[2] as RampTone,
    step: Number(match[3]) as Step,
  };
}

function countAssertions(
  assertions: readonly AssertionResult[],
  status: AssertionResult["status"],
): number {
  return assertions.filter((assertion) => assertion.status === status).length;
}

function assertionToRow(assertion: AssertionResult): readonly string[] {
  return [
    themeOptions.find((option) => option.key === assertion.theme)?.label ?? assertion.theme,
    `${assertion.tokenA} / ${assertion.tokenB}`,
    assertion.failureType ?? assertion.status,
    `${assertion.actualLc.toFixed(1)} / ${assertion.requiredLc}`,
    assertion.source,
  ];
}

function cssVar(namespace: string, token: string): `var(--${string})` {
  return `var(--${namespace}-${token})`;
}

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}

function byStep(a: PrimitiveRampToken, b: PrimitiveRampToken): number {
  return a.step - b.step;
}

type EngineState =
  | {
      readonly kind: "ready";
      readonly output: EngineOutput;
      readonly css: TokenCssRenderResult;
    }
  | {
      readonly kind: "error";
      readonly code: string;
      readonly message: string;
    };

interface PrimitiveRampGroup {
  readonly slot: PaletteSlot;
  readonly light: readonly PrimitiveRampToken[];
  readonly dark: readonly PrimitiveRampToken[];
}

interface PrimitiveRampToken {
  readonly name: PrimitiveTokenName;
  readonly value: string;
  readonly step: Step;
}
