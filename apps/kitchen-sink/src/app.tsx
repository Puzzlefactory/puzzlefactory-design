import {
  ColorEngineValidationError,
  NEUTRAL_SEMANTIC_TOKEN_NAMES,
  PRIMARY_SEMANTIC_TOKEN_NAMES,
  SEED_POLICY_NAMES,
  SEMANTIC_TOKEN_NAMES,
  SURFACE_PRESETS,
  SURFACE_PRESET_NAMES,
  SURFACE_SEMANTIC_TOKEN_NAMES,
  STATUS_INTENTS,
  STATUS_SEMANTIC_TOKEN_NAMES,
  createColorEngineTheme,
  type ColorEngineInput,
  type ColorEngineOutput,
  type ColorToken,
  type PrimitiveFamilyName,
  type SeedPolicy,
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
  "chrome-light",
  "primary-seed",
  "primary-light-soft",
  "primary-light-solid",
  "neutral-dark",
  "surface-dark",
  "chrome-dark",
  "primary-dark-soft",
  "primary-dark-solid",
  "danger-seed",
  "danger-light-soft",
  "danger-light-solid",
  "danger-dark-soft",
  "danger-dark-solid",
  "warning-seed",
  "warning-light-soft",
  "warning-light-solid",
  "warning-dark-soft",
  "warning-dark-solid",
  "success-seed",
  "success-light-soft",
  "success-light-solid",
  "success-dark-soft",
  "success-dark-solid",
  "info-seed",
  "info-light-soft",
  "info-light-solid",
  "info-dark-soft",
  "info-dark-solid",
] as const satisfies readonly PrimitiveFamilyName[];

const statusIntents = [
  { key: "danger", label: "Danger" },
  { key: "warning", label: "Warning" },
  { key: "success", label: "Success" },
  { key: "info", label: "Info" },
] as const satisfies readonly { readonly key: (typeof STATUS_INTENTS)[number]; readonly label: string }[];

const themeOptions = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
] as const satisfies readonly { readonly key: SurfaceTheme; readonly label: string }[];

const defaultInput = {
  neutralSeed: "#d8dee8",
  primarySeed: "#0f6f3d",
  surfaceLightSeed: "#edf2f7",
  surfaceDarkSeed: "#111827",
  dangerSeed: "#c62828",
  dangerSeedPolicy: "balanced",
  warningSeed: "#b26a00",
  warningSeedPolicy: "balanced",
  successSeed: "#16823a",
  successSeedPolicy: "balanced",
  infoSeed: "#0b6ea8",
  infoSeedPolicy: "balanced",
  primarySeedPolicy: "balanced",
  preset: "standard",
  namespace: "ds",
} as const satisfies Required<ColorEngineInput>;

export function App() {
  const [neutralSeed, setNeutralSeed] = useState<string>(defaultInput.neutralSeed);
  const [primarySeed, setPrimarySeed] = useState<string>(defaultInput.primarySeed);
  const [surfaceLightSeed, setSurfaceLightSeed] = useState<string>(defaultInput.surfaceLightSeed);
  const [surfaceDarkSeed, setSurfaceDarkSeed] = useState<string>(defaultInput.surfaceDarkSeed);
  const [dangerSeed, setDangerSeed] = useState<string>(defaultInput.dangerSeed);
  const [dangerSeedPolicy, setDangerSeedPolicy] = useState<SeedPolicy>(defaultInput.dangerSeedPolicy);
  const [warningSeed, setWarningSeed] = useState<string>(defaultInput.warningSeed);
  const [warningSeedPolicy, setWarningSeedPolicy] = useState<SeedPolicy>(defaultInput.warningSeedPolicy);
  const [successSeed, setSuccessSeed] = useState<string>(defaultInput.successSeed);
  const [successSeedPolicy, setSuccessSeedPolicy] = useState<SeedPolicy>(defaultInput.successSeedPolicy);
  const [infoSeed, setInfoSeed] = useState<string>(defaultInput.infoSeed);
  const [infoSeedPolicy, setInfoSeedPolicy] = useState<SeedPolicy>(defaultInput.infoSeedPolicy);
  const [primarySeedPolicy, setPrimarySeedPolicy] = useState<SeedPolicy>(defaultInput.primarySeedPolicy);
  const [preset, setPreset] = useState<SurfacePresetName>(defaultInput.preset);
  const [activeTheme, setActiveTheme] = useState<SurfaceTheme>("light");

  const engine = useMemo(
    () =>
      createEngineState({
        neutralSeed,
        primarySeed,
        surfaceLightSeed,
        surfaceDarkSeed,
        dangerSeed,
        dangerSeedPolicy,
        warningSeed,
        warningSeedPolicy,
        successSeed,
        successSeedPolicy,
        infoSeed,
        infoSeedPolicy,
        primarySeedPolicy,
        preset,
        namespace: defaultInput.namespace,
      }),
    [
      dangerSeed,
      dangerSeedPolicy,
      infoSeed,
      infoSeedPolicy,
      neutralSeed,
      preset,
      primarySeed,
      primarySeedPolicy,
      successSeed,
      successSeedPolicy,
      surfaceDarkSeed,
      surfaceLightSeed,
      warningSeed,
      warningSeedPolicy,
    ],
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
                dangerSeed={dangerSeed}
                dangerSeedPolicy={dangerSeedPolicy}
                engine={engine}
                infoSeed={infoSeed}
                infoSeedPolicy={infoSeedPolicy}
                neutralSeed={neutralSeed}
                primarySeed={primarySeed}
                primarySeedPolicy={primarySeedPolicy}
                preset={preset}
                successSeed={successSeed}
                successSeedPolicy={successSeedPolicy}
                surfaceDarkSeed={surfaceDarkSeed}
                surfaceLightSeed={surfaceLightSeed}
                warningSeed={warningSeed}
                warningSeedPolicy={warningSeedPolicy}
                onActiveThemeChange={setActiveTheme}
                onDangerSeedChange={setDangerSeed}
                onDangerSeedPolicyChange={setDangerSeedPolicy}
                onInfoSeedChange={setInfoSeed}
                onInfoSeedPolicyChange={setInfoSeedPolicy}
                onNeutralSeedChange={setNeutralSeed}
                onPrimarySeedChange={setPrimarySeed}
                onPrimarySeedPolicyChange={setPrimarySeedPolicy}
                onPresetChange={setPreset}
                onSuccessSeedChange={setSuccessSeed}
                onSuccessSeedPolicyChange={setSuccessSeedPolicy}
                onSurfaceDarkSeedChange={setSurfaceDarkSeed}
                onSurfaceLightSeedChange={setSurfaceLightSeed}
                onWarningSeedChange={setWarningSeed}
                onWarningSeedPolicyChange={setWarningSeedPolicy}
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
            <Metric label="Semantic roles" value={SEMANTIC_TOKEN_NAMES.length.toString()} />
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
  dangerSeed,
  dangerSeedPolicy,
  engine,
  infoSeed,
  infoSeedPolicy,
  neutralSeed,
  primarySeed,
  primarySeedPolicy,
  preset,
  successSeed,
  successSeedPolicy,
  surfaceDarkSeed,
  surfaceLightSeed,
  warningSeed,
  warningSeedPolicy,
  onActiveThemeChange,
  onDangerSeedChange,
  onDangerSeedPolicyChange,
  onInfoSeedChange,
  onInfoSeedPolicyChange,
  onNeutralSeedChange,
  onPrimarySeedChange,
  onPrimarySeedPolicyChange,
  onPresetChange,
  onSuccessSeedChange,
  onSuccessSeedPolicyChange,
  onSurfaceDarkSeedChange,
  onSurfaceLightSeedChange,
  onWarningSeedChange,
  onWarningSeedPolicyChange,
}: {
  activeTheme: SurfaceTheme;
  dangerSeed: string;
  dangerSeedPolicy: SeedPolicy;
  engine: EngineState;
  infoSeed: string;
  infoSeedPolicy: SeedPolicy;
  neutralSeed: string;
  primarySeed: string;
  primarySeedPolicy: SeedPolicy;
  preset: SurfacePresetName;
  successSeed: string;
  successSeedPolicy: SeedPolicy;
  surfaceDarkSeed: string;
  surfaceLightSeed: string;
  warningSeed: string;
  warningSeedPolicy: SeedPolicy;
  onActiveThemeChange: (value: SurfaceTheme) => void;
  onDangerSeedChange: (value: string) => void;
  onDangerSeedPolicyChange: (value: SeedPolicy) => void;
  onInfoSeedChange: (value: string) => void;
  onInfoSeedPolicyChange: (value: SeedPolicy) => void;
  onNeutralSeedChange: (value: string) => void;
  onPrimarySeedChange: (value: string) => void;
  onPrimarySeedPolicyChange: (value: SeedPolicy) => void;
  onPresetChange: (value: SurfacePresetName) => void;
  onSuccessSeedChange: (value: string) => void;
  onSuccessSeedPolicyChange: (value: SeedPolicy) => void;
  onSurfaceDarkSeedChange: (value: string) => void;
  onSurfaceLightSeedChange: (value: string) => void;
  onWarningSeedChange: (value: string) => void;
  onWarningSeedPolicyChange: (value: SeedPolicy) => void;
}) {
  return (
    <ViewFrame
      title="Controls"
      subtitle="Tune neutral, surface, primary, and status seeds with a named surface separation preset."
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
        <PolicyField
          label="Primary policy"
          value={primarySeedPolicy}
          onChange={onPrimarySeedPolicyChange}
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
        <SeedField
          label="Danger seed"
          value={dangerSeed}
          onChange={onDangerSeedChange}
        />
        <PolicyField
          label="Danger policy"
          value={dangerSeedPolicy}
          onChange={onDangerSeedPolicyChange}
        />
        <SeedField
          label="Warning seed"
          value={warningSeed}
          onChange={onWarningSeedChange}
        />
        <PolicyField
          label="Warning policy"
          value={warningSeedPolicy}
          onChange={onWarningSeedPolicyChange}
        />
        <SeedField
          label="Success seed"
          value={successSeed}
          onChange={onSuccessSeedChange}
        />
        <PolicyField
          label="Success policy"
          value={successSeedPolicy}
          onChange={onSuccessSeedPolicyChange}
        />
        <SeedField
          label="Info seed"
          value={infoSeed}
          onChange={onInfoSeedChange}
        />
        <PolicyField
          label="Info policy"
          value={infoSeedPolicy}
          onChange={onInfoSeedPolicyChange}
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
      subtitle="Four-step ramps keep neutral, surface, primary, and status concerns split by UI job."
    >
      <section className="ramp-stack" aria-label="Primitive ramps">
        {primitiveFamilies.map((family) => (
          <RampPanel
            family={family}
            key={family}
            output={engine.output}
            tokens={engine.output.primitives[family]}
          />
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
      subtitle="Stable semantic aliases point at generated primitive families for each theme."
    >
      <section className="semantic-layout">
        {themeOptions.map((theme) => (
          <article className="semantic-panel" data-theme-v2={theme.key} key={`${theme.key}-neutral`}>
            <header className="panel-header">
              <h3>{theme.label} Text and Chrome</h3>
              <span>{NEUTRAL_SEMANTIC_TOKEN_NAMES.length} roles</span>
            </header>
            <div className="semantic-grid">
              {NEUTRAL_SEMANTIC_TOKEN_NAMES.map((token) => (
                <SemanticSwatch key={token} token={token} />
              ))}
            </div>
          </article>
        ))}
        {themeOptions.map((theme) => (
          <article className="semantic-panel" data-theme-v2={theme.key} key={`${theme.key}-surface`}>
            <header className="panel-header">
              <h3>{theme.label} Surface</h3>
              <span>{SURFACE_SEMANTIC_TOKEN_NAMES.length} roles</span>
            </header>
            <div className="semantic-grid">
              {SURFACE_SEMANTIC_TOKEN_NAMES.map((token) => (
                <SemanticSwatch key={token} token={token} />
              ))}
            </div>
          </article>
        ))}
        {themeOptions.map((theme) => (
          <article className="semantic-panel" data-theme-v2={theme.key} key={`${theme.key}-primary`}>
            <header className="panel-header">
              <h3>{theme.label} Primary</h3>
              <span>{PRIMARY_SEMANTIC_TOKEN_NAMES.length} roles</span>
            </header>
            <div className="semantic-grid">
              {PRIMARY_SEMANTIC_TOKEN_NAMES.map((token) => (
                <SemanticSwatch key={token} token={token} />
              ))}
            </div>
          </article>
        ))}
        {themeOptions.map((theme) => (
          <article className="semantic-panel" data-theme-v2={theme.key} key={`${theme.key}-status`}>
            <header className="panel-header">
              <h3>{theme.label} Status</h3>
              <span>{STATUS_SEMANTIC_TOKEN_NAMES.length} roles</span>
            </header>
            <div className="semantic-grid">
              {STATUS_SEMANTIC_TOKEN_NAMES.map((token) => (
                <SemanticSwatch key={token} token={token} />
              ))}
            </div>
          </article>
        ))}
      </section>
      <CssOutputSummary output={engine.output} />
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
      subtitle="Light and dark surfaces, primary actions, and status treatments are rendered from separate explicit seeds."
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
      <div className="status-demo" aria-label={`${label} status usage preview`}>
        {statusIntents.map((intent) => (
          <StatusCard key={intent.key} intent={intent.key} label={intent.label} />
        ))}
      </div>
    </article>
  );
}

function StatusCard({
  intent,
  label,
}: {
  intent: (typeof STATUS_INTENTS)[number];
  label: string;
}) {
  return (
    <div className={`status-card status-card-${intent}`}>
      <div className="status-soft">
        <strong>{label} soft</strong>
        <p>Soft status surface, border, and text.</p>
      </div>
      <button type="button">{label} solid</button>
    </div>
  );
}

function CssOutputSummary({ output }: { output: ColorEngineOutput }) {
  return (
    <section className="css-output" aria-label="Generated CSS output">
      <header className="panel-header">
        <h3>CSS Output</h3>
        <span>{declarationCount(output.cssOutput.all)} declarations</span>
      </header>
      <div className="css-output-grid">
        <CssOutputCard
          label="Primitive rule"
          selector=":root"
          declarations={declarationCount(output.cssOutput.primitives)}
        />
        {themeOptions.map((theme) => (
          <CssOutputCard
            key={theme.key}
            label={`${theme.label} aliases`}
            selector={`[data-theme-v2="${theme.key}"]`}
            declarations={declarationCount(output.cssOutput.themes[theme.key])}
          />
        ))}
      </div>
    </section>
  );
}

function CssOutputCard({
  declarations,
  label,
  selector,
}: {
  declarations: number;
  label: string;
  selector: string;
}) {
  return (
    <div className="css-output-card">
      <span>{label}</span>
      <code>{selector}</code>
      <strong>{declarations} custom properties</strong>
    </div>
  );
}

function RampPanel({
  family,
  output,
  tokens,
}: {
  family: PrimitiveFamilyName;
  output: ColorEngineOutput;
  tokens: readonly ColorToken[];
}) {
  const policyLabel = getFamilyPolicyLabel(family, output);

  return (
    <article className="ramp-panel">
      <header className="panel-header">
        <h3>{family}</h3>
        <span>{tokens.length} tokens</span>
      </header>
      {policyLabel ? <p className="ramp-meta">{policyLabel}</p> : null}
      <div className="swatch-row">
        {tokens.map((token) => (
          <div
            className={isSeedAnchor(family, token.name, output) ? "swatch-card swatch-card-anchor" : "swatch-card"}
            key={token.name}
          >
            <span
              className="swatch"
              style={{ background: cssVar(token.name) }}
              title={`${token.name}: ${token.value}`}
            />
            {isSeedAnchor(family, token.name, output) ? <span className="swatch-badge">Seed anchor</span> : null}
            <strong>{levelLabel(token.name)}</strong>
            <code>{token.value}</code>
          </div>
        ))}
      </div>
    </article>
  );
}

function PolicyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SeedPolicy;
  onChange: (value: SeedPolicy) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as SeedPolicy)}>
        {SEED_POLICY_NAMES.map((option) => (
          <option key={option} value={option}>
            {labelize(option)}
          </option>
        ))}
      </select>
    </label>
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
      <Metric label="Danger LCH" value={formatOklchSummary(output.seeds.status.danger)} />
      <Metric label="Warning LCH" value={formatOklchSummary(output.seeds.status.warning)} />
      <Metric label="Success LCH" value={formatOklchSummary(output.seeds.status.success)} />
      <Metric label="Info LCH" value={formatOklchSummary(output.seeds.status.info)} />
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

function declarationCount(css: string): number {
  return css
    .split("\n")
    .filter((line) => line.trim().startsWith("--")).length;
}

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function levelLabel(name: string): string {
  if (name.endsWith("-seed")) {
    return "Seed";
  }

  return `Level ${name.slice(name.lastIndexOf("-") + 1)}`;
}

function getFamilyPolicyLabel(family: PrimitiveFamilyName, output: ColorEngineOutput): string | null {
  if (family === "primary-seed") {
    return "Exact parsed primary seed.";
  }

  if (family === "primary-light-solid" || family === "primary-dark-solid") {
    return `${labelize(output.seedPolicies.primary)} primary policy. ${output.seedPolicies.primary === "anchored" ? "Level 2 preserves the seed." : "Seed adapted into a balanced solid ramp."}`;
  }

  if (family === "primary-light-soft" || family === "primary-dark-soft") {
    return `${labelize(output.seedPolicies.primary)} primary policy. Soft ramps stay derived for usable containers.`;
  }

  for (const intent of STATUS_INTENTS) {
    if (family === `${intent}-seed`) {
      return `Exact parsed ${intent} seed.`;
    }

    if (family === `${intent}-light-solid` || family === `${intent}-dark-solid`) {
      const policy = output.seedPolicies.status[intent];

      return `${labelize(policy)} ${intent} policy. ${policy === "anchored" ? "Level 2 preserves the seed." : "Seed adapted into a balanced solid ramp."}`;
    }

    if (family === `${intent}-light-soft` || family === `${intent}-dark-soft`) {
      const policy = output.seedPolicies.status[intent];

      return `${labelize(policy)} ${intent} policy. Soft ramps stay derived for usable containers.`;
    }
  }

  return null;
}

function isSeedAnchor(
  family: PrimitiveFamilyName,
  tokenName: string,
  output: ColorEngineOutput,
): boolean {
  if (tokenName.endsWith("-seed")) {
    return true;
  }

  if (
    output.seedPolicies.primary === "anchored" &&
    (family === "primary-light-solid" || family === "primary-dark-solid")
  ) {
    return tokenName.endsWith("-2");
  }

  for (const intent of STATUS_INTENTS) {
    if (
      output.seedPolicies.status[intent] === "anchored" &&
      (family === `${intent}-light-solid` || family === `${intent}-dark-solid`)
    ) {
      return tokenName.endsWith("-2");
    }
  }

  return false;
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
