import {
  ColorEngineValidationError,
  SURFACE_PRESETS,
  SURFACE_PRESET_NAMES,
  createColorEngineTheme,
  type ColorEngineInput,
  type ColorEngineOutput,
  type ColorToken,
  type PrimarySemanticTokenName,
  type PrimitiveFamilyName,
  type SemanticTokenName,
  type SurfacePresetName,
  type SurfaceTheme,
} from "@puzzlefactory/color-engine";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router";

const navItems = [
  { to: "/overview", label: "Overview" },
  { to: "/controls", label: "Controls" },
  { to: "/primitives", label: "Primitives" },
  { to: "/semantic", label: "Semantic" },
  { to: "/themes", label: "Themes" },
] as const;

const primitiveFamilies = [
  "neutral-light",
  "surface-light",
  "primary-light-soft",
  "primary-light-solid",
  "neutral-dark",
  "surface-dark",
  "primary-dark-soft",
  "primary-dark-solid",
] as const satisfies readonly PrimitiveFamilyName[];

const surfaceSemanticTokens = [
  "surface-1",
  "surface-2",
  "surface-3",
  "surface-4",
  "surface-1-hover",
  "surface-2-hover",
  "surface-3-hover",
  "surface-4-hover",
  "surface-1-selected",
  "surface-2-selected",
  "surface-3-selected",
  "surface-4-selected",
  "surface-1-pressed",
  "surface-2-pressed",
  "surface-3-pressed",
  "surface-4-pressed",
] as const satisfies readonly SemanticTokenName[];

const primarySemanticTokens = [
  "primary-action-bg",
  "primary-action-bg-hover",
  "primary-action-bg-pressed",
  "primary-action-text",
  "primary-link",
  "primary-link-hover",
  "primary-focus-ring",
  "primary-soft-bg",
  "primary-soft-bg-hover",
  "primary-soft-border",
  "primary-soft-text",
] as const satisfies readonly PrimarySemanticTokenName[];

const semanticTokens = [
  ...surfaceSemanticTokens,
  ...primarySemanticTokens,
] as const satisfies readonly SemanticTokenName[];

const themeOptions = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
] as const satisfies readonly { readonly key: SurfaceTheme; readonly label: string }[];

const defaultInput = {
  neutralSeed: "#d8dee8",
  primarySeed: "#0f6f3d",
  surfaceLightSeed: "#edf2f7",
  surfaceDarkSeed: "#111827",
  preset: "standard",
  namespace: "ds",
} as const satisfies Required<ColorEngineInput>;

export function App() {
  const [neutralSeed, setNeutralSeed] = useState<string>(defaultInput.neutralSeed);
  const [primarySeed, setPrimarySeed] = useState<string>(defaultInput.primarySeed);
  const [surfaceLightSeed, setSurfaceLightSeed] = useState<string>(defaultInput.surfaceLightSeed);
  const [surfaceDarkSeed, setSurfaceDarkSeed] = useState<string>(defaultInput.surfaceDarkSeed);
  const [preset, setPreset] = useState<SurfacePresetName>(defaultInput.preset);
  const [activeTheme, setActiveTheme] = useState<SurfaceTheme>("light");

  const engine = useMemo(
    () =>
      createEngineState({
        neutralSeed,
        primarySeed,
        surfaceLightSeed,
        surfaceDarkSeed,
        preset,
        namespace: defaultInput.namespace,
      }),
    [neutralSeed, preset, primarySeed, surfaceDarkSeed, surfaceLightSeed],
  );

  return (
    <div className="app-shell" data-theme-v2={activeTheme}>
      {engine.kind === "ready" ? <EngineStyles css={engine.output.css} /> : null}
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
            element={<Overview engine={engine} activeTheme={activeTheme} />}
          />
          <Route
            path="/controls"
            element={
              <Controls
                activeTheme={activeTheme}
                engine={engine}
                neutralSeed={neutralSeed}
                primarySeed={primarySeed}
                preset={preset}
                surfaceDarkSeed={surfaceDarkSeed}
                surfaceLightSeed={surfaceLightSeed}
                onActiveThemeChange={setActiveTheme}
                onNeutralSeedChange={setNeutralSeed}
                onPrimarySeedChange={setPrimarySeed}
                onPresetChange={setPreset}
                onSurfaceDarkSeedChange={setSurfaceDarkSeed}
                onSurfaceLightSeedChange={setSurfaceLightSeed}
              />
            }
          />
          <Route path="/primitives" element={<Primitives engine={engine} />} />
          <Route path="/semantic" element={<SemanticPreview engine={engine} />} />
          <Route path="/themes" element={<ThemePreview engine={engine} />} />
        </Routes>
      </main>
    </div>
  );
}

function Overview({
  activeTheme,
  engine,
}: {
  activeTheme: SurfaceTheme;
  engine: EngineState;
}) {
  return (
    <ViewFrame
      title="Neutral and Surface Foundation"
      subtitle="The CE2 engine starts with separate small ramps for neutral tone and surface depth."
    >
      {engine.kind === "error" ? (
        <ErrorNotice engine={engine} />
      ) : (
        <>
          <section className="metric-grid" aria-label="Engine summary">
            <Metric label="Active theme" value={labelize(activeTheme)} />
            <Metric label="Preset" value={engine.output.preset.label} />
            <Metric
              label="Primitive families"
              value={Object.keys(engine.output.primitives).length.toString()}
            />
            <Metric label="Surface roles" value={semanticTokens.length.toString()} />
          </section>
          <section className="overview-grid" aria-label="Verification areas">
            {navItems.slice(1).map((item) => (
              <NavLink className="area-link" key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </section>
        </>
      )}
    </ViewFrame>
  );
}

function Controls({
  activeTheme,
  engine,
  neutralSeed,
  primarySeed,
  preset,
  surfaceDarkSeed,
  surfaceLightSeed,
  onActiveThemeChange,
  onNeutralSeedChange,
  onPrimarySeedChange,
  onPresetChange,
  onSurfaceDarkSeedChange,
  onSurfaceLightSeedChange,
}: {
  activeTheme: SurfaceTheme;
  engine: EngineState;
  neutralSeed: string;
  primarySeed: string;
  preset: SurfacePresetName;
  surfaceDarkSeed: string;
  surfaceLightSeed: string;
  onActiveThemeChange: (value: SurfaceTheme) => void;
  onNeutralSeedChange: (value: string) => void;
  onPrimarySeedChange: (value: string) => void;
  onPresetChange: (value: SurfacePresetName) => void;
  onSurfaceDarkSeedChange: (value: string) => void;
  onSurfaceLightSeedChange: (value: string) => void;
}) {
  return (
    <ViewFrame
      title="Controls"
      subtitle="Tune neutral, surface, and primary seeds with a named surface separation preset."
    >
      <section className="control-grid" aria-label="Engine controls">
        <SeedField
          label="Neutral seed"
          value={neutralSeed}
          onChange={onNeutralSeedChange}
        />
        <SeedField
          label="Primary seed"
          value={primarySeed}
          onChange={onPrimarySeedChange}
        />
        <SeedField
          label="Light surface seed"
          value={surfaceLightSeed}
          onChange={onSurfaceLightSeedChange}
        />
        <SeedField
          label="Dark surface seed"
          value={surfaceDarkSeed}
          onChange={onSurfaceDarkSeedChange}
        />
        <label className="field">
          <span>Preview theme</span>
          <select
            value={activeTheme}
            onChange={(event) => onActiveThemeChange(event.target.value as SurfaceTheme)}
          >
            {themeOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="preset-grid" aria-label="Surface presets">
        {SURFACE_PRESET_NAMES.map((name) => {
          const option = SURFACE_PRESETS[name];

          return (
            <button
              className={preset === name ? "preset-button preset-button-active" : "preset-button"}
              key={name}
              type="button"
              onClick={() => onPresetChange(name)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          );
        })}
      </section>
      {engine.kind === "error" ? <ErrorNotice engine={engine} /> : <EngineMetadata output={engine.output} />}
    </ViewFrame>
  );
}

function Primitives({ engine }: { engine: EngineState }) {
  if (engine.kind === "error") {
    return <ErrorView engine={engine} />;
  }

  return (
    <ViewFrame
      title="Primitive Ramps"
      subtitle="Four-step ramps keep neutral, surface, and primary usage concerns split by UI job."
    >
      <section className="ramp-stack" aria-label="Primitive ramps">
        {primitiveFamilies.map((family) => (
          <RampPanel family={family} key={family} tokens={engine.output.primitives[family]} />
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
      title="Semantic Roles"
      subtitle="Semantic roles point at surface and primary usage families for each theme."
    >
      <section className="semantic-layout">
        {themeOptions.map((theme) => (
          <article className="semantic-panel" data-theme-v2={theme.key} key={`${theme.key}-surface`}>
            <header className="panel-header">
              <h3>{theme.label} Surface</h3>
              <span>{surfaceSemanticTokens.length} roles</span>
            </header>
            <div className="semantic-grid">
              {surfaceSemanticTokens.map((token) => (
                <SemanticSwatch key={token} token={token} />
              ))}
            </div>
          </article>
        ))}
        {themeOptions.map((theme) => (
          <article className="semantic-panel" data-theme-v2={theme.key} key={`${theme.key}-primary`}>
            <header className="panel-header">
              <h3>{theme.label} Primary</h3>
              <span>{primarySemanticTokens.length} roles</span>
            </header>
            <div className="semantic-grid">
              {primarySemanticTokens.map((token) => (
                <SemanticSwatch key={token} token={token} />
              ))}
            </div>
          </article>
        ))}
      </section>
    </ViewFrame>
  );
}

function ThemePreview({ engine }: { engine: EngineState }) {
  if (engine.kind === "error") {
    return <ErrorView engine={engine} />;
  }

  return (
    <ViewFrame
      title="Theme Preview"
      subtitle="Light and dark surfaces and primary actions are rendered from separate explicit seeds."
    >
      <section className="theme-grid" aria-label="Theme surface previews">
        {themeOptions.map((theme) => (
          <ThemeSample key={theme.key} label={theme.label} theme={theme.key} />
        ))}
      </section>
    </ViewFrame>
  );
}

function ThemeSample({ label, theme }: { label: string; theme: SurfaceTheme }) {
  return (
    <article className="theme-sample" data-theme-v2={theme}>
      <header className="theme-sample-header">
        <h3>{label}</h3>
        <span>{theme}</span>
      </header>
      <div className="surface-demo surface-demo-1">
        <strong>Surface 1</strong>
        <p>Base application surface.</p>
        <div className="surface-demo surface-demo-2">
          <strong>Surface 2</strong>
          <p>Raised panel surface.</p>
          <div className="surface-demo surface-demo-3">
            <strong>Surface 3</strong>
            <p>Nested control group.</p>
            <div className="surface-demo surface-demo-4">
              <strong>Surface 4</strong>
              <p>Highest local emphasis.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="state-row" aria-label={`${label} surface states`}>
        <span className="state-chip state-hover">Hover</span>
        <span className="state-chip state-selected">Selected</span>
        <span className="state-chip state-pressed">Pressed</span>
      </div>
      <div className="primary-demo" aria-label={`${label} primary usage preview`}>
        <div className="primary-soft">
          <strong>Primary soft</strong>
          <p>Container, border, and text roles are separate from solid actions.</p>
        </div>
        <div className="primary-actions">
          <button type="button">Primary action</button>
          <a href="/themes" onClick={(event) => event.preventDefault()}>
            Primary link
          </a>
          <span className="focus-sample">Focus</span>
        </div>
      </div>
    </article>
  );
}

function RampPanel({
  family,
  tokens,
}: {
  family: PrimitiveFamilyName;
  tokens: readonly ColorToken[];
}) {
  return (
    <article className="ramp-panel">
      <header className="panel-header">
        <h3>{family}</h3>
        <span>{tokens.length} tokens</span>
      </header>
      <div className="swatch-row">
        {tokens.map((token) => (
          <div className="swatch-card" key={token.name}>
            <span
              className="swatch"
              style={{ background: cssVar(token.name) }}
              title={`${token.name}: ${token.value}`}
            />
            <strong>{levelLabel(token.name)}</strong>
            <code>{token.value}</code>
          </div>
        ))}
      </div>
    </article>
  );
}

function SemanticSwatch({ token }: { token: SemanticTokenName }) {
  return (
    <div className="semantic-swatch">
      <span className="semantic-chip" style={{ background: cssVar(token) }} aria-hidden="true" />
      <div>
        <strong>{token}</strong>
        <code>{cssVar(token)}</code>
      </div>
    </div>
  );
}

function SeedField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function EngineMetadata({ output }: { output: ColorEngineOutput }) {
  return (
    <section className="metric-grid" aria-label="Generated output metadata">
      <Metric label="Namespace" value={output.namespace} />
      <Metric label="Neutral LCH" value={formatOklchSummary(output.seeds.neutral)} />
      <Metric label="Primary LCH" value={formatOklchSummary(output.seeds.primary)} />
      <Metric label="Light surface LCH" value={formatOklchSummary(output.seeds.surfaceLight)} />
      <Metric label="Dark surface LCH" value={formatOklchSummary(output.seeds.surfaceDark)} />
    </section>
  );
}

function EngineStyles({ css }: { css: string }) {
  return <style data-generated-color-engine-css>{css}</style>;
}

function ErrorView({ engine }: { engine: Extract<EngineState, { kind: "error" }> }) {
  return (
    <ViewFrame title="Invalid Engine Input" subtitle="The color engine rejected the current input.">
      <ErrorNotice engine={engine} />
    </ViewFrame>
  );
}

function ErrorNotice({ engine }: { engine: Extract<EngineState, { kind: "error" }> }) {
  return (
    <div className="notice notice-fail" role="alert">
      <strong>{engine.code}</strong>
      <span>{engine.field}: {engine.message}</span>
    </div>
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

function createEngineState(input: ColorEngineInput): EngineState {
  try {
    return {
      kind: "ready",
      output: createColorEngineTheme(input),
    };
  } catch (error) {
    if (error instanceof ColorEngineValidationError) {
      return {
        kind: "error",
        code: error.code,
        field: error.field,
        message: error.message,
      };
    }

    throw error;
  }
}

function cssVar(token: string): `var(--${string})` {
  return `var(--${defaultInput.namespace}-${token})`;
}

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function levelLabel(name: string): string {
  return `Level ${name.slice(name.lastIndexOf("-") + 1)}`;
}

function formatOklchSummary(color: { readonly l: number; readonly c: number; readonly h: number }): string {
  return `L ${formatNumber(color.l)} C ${formatNumber(color.c)} H ${formatNumber(color.h)}`;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(3)).toString();
}

type EngineState =
  | {
      readonly kind: "ready";
      readonly output: ColorEngineOutput;
    }
  | {
      readonly kind: "error";
      readonly code: string;
      readonly field: string;
      readonly message: string;
    };
