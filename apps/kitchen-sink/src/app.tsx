import {
  ColorEngineValidationError,
  COLOR_ENGINE_THEME_PRESET_NAMES,
  COLOR_ENGINE_THEME_PRESETS,
  NEUTRAL_SEMANTIC_TOKEN_NAMES,
  PRIMARY_SEMANTIC_TOKEN_NAMES,
  SEED_POLICY_NAMES,
  SEMANTIC_TOKEN_NAMES,
  SURFACE_PRESETS,
  SURFACE_PRESET_NAMES,
  SURFACE_SEMANTIC_TOKEN_NAMES,
  STATUS_INTENTS,
  STATUS_SEMANTIC_TOKEN_NAMES,
  TEXT_LEVELS,
  TEXT_TREATMENT_STRATEGIES,
  TEXT_TREATMENT_STRATEGY_NAMES,
  createColorEngineTheme,
  type ColorEngineInput,
  type ColorEngineOutput,
  type ColorEngineThemePresetName,
  type ColorEngineThemePresetInput,
  type ColorToken,
  type ContrastAssertionRole,
  type ResolvedContrastAssertion,
  type PrimitiveFamilyName,
  type SeedPolicy,
  type SemanticTokenName,
  type SurfacePresetName,
  type SurfaceTheme,
  type TextTreatmentStrategyName,
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
  { to: "/components", label: "Components" },
  { to: "/assertions", label: "Assertions" },
] as const;

const primitiveFamilies = [
  "neutral-light",
  "text-dark",
  "surface-light",
  "chrome-light",
  "primary-seed",
  "primary-light-soft",
  "primary-light-solid",
  "neutral-dark",
  "text-light",
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

const assertionRoles = [
  "body",
  "secondary",
  "muted",
  "ui",
  "status-soft",
  "status-solid",
] as const satisfies readonly ContrastAssertionRole[];

const assertionRoleLabels = {
  body: "Body",
  secondary: "Secondary",
  muted: "Muted",
  ui: "UI",
  "status-soft": "Status Soft",
  "status-solid": "Status Solid",
} as const satisfies Readonly<Record<ContrastAssertionRole, string>>;

const defaultInput = {
  ...COLOR_ENGINE_THEME_PRESETS.evergreen.input,
  namespace: "ds",
} as const satisfies Required<ColorEngineInput>;

type ActiveThemePresetName = ColorEngineThemePresetName | "custom";
type SurfacePresetSelection = SurfacePresetName | "inherit";

export function App() {
  const [neutralSeed, setNeutralSeed] = useState<string>(defaultInput.neutralSeed);
  const [primarySeed, setPrimarySeed] = useState<string>(defaultInput.primarySeed);
  const [primaryDarkSeed, setPrimaryDarkSeed] = useState<string>(defaultInput.primaryDarkSeed);
  const [surfaceLightSeed, setSurfaceLightSeed] = useState<string>(defaultInput.surfaceLightSeed);
  const [surfaceDarkSeed, setSurfaceDarkSeed] = useState<string>(defaultInput.surfaceDarkSeed);
  const [dangerSeed, setDangerSeed] = useState<string>(defaultInput.dangerSeed);
  const [dangerDarkSeed, setDangerDarkSeed] = useState<string>(defaultInput.dangerDarkSeed);
  const [dangerSeedPolicy, setDangerSeedPolicy] = useState<SeedPolicy>(defaultInput.dangerSeedPolicy);
  const [warningSeed, setWarningSeed] = useState<string>(defaultInput.warningSeed);
  const [warningDarkSeed, setWarningDarkSeed] = useState<string>(defaultInput.warningDarkSeed);
  const [warningSeedPolicy, setWarningSeedPolicy] = useState<SeedPolicy>(defaultInput.warningSeedPolicy);
  const [successSeed, setSuccessSeed] = useState<string>(defaultInput.successSeed);
  const [successDarkSeed, setSuccessDarkSeed] = useState<string>(defaultInput.successDarkSeed);
  const [successSeedPolicy, setSuccessSeedPolicy] = useState<SeedPolicy>(defaultInput.successSeedPolicy);
  const [infoSeed, setInfoSeed] = useState<string>(defaultInput.infoSeed);
  const [infoDarkSeed, setInfoDarkSeed] = useState<string>(defaultInput.infoDarkSeed);
  const [infoSeedPolicy, setInfoSeedPolicy] = useState<SeedPolicy>(defaultInput.infoSeedPolicy);
  const [primarySeedPolicy, setPrimarySeedPolicy] = useState<SeedPolicy>(defaultInput.primarySeedPolicy);
  const [textTreatment, setTextTreatment] = useState<TextTreatmentStrategyName>(defaultInput.textTreatment);
  const [preset, setPreset] = useState<SurfacePresetName>(defaultInput.preset);
  const [lightSurfacePreset, setLightSurfacePreset] = useState<SurfacePresetSelection>(
    toSurfacePresetSelection(defaultInput.preset, defaultInput.lightSurfacePreset),
  );
  const [darkSurfacePreset, setDarkSurfacePreset] = useState<SurfacePresetSelection>(
    toSurfacePresetSelection(defaultInput.preset, defaultInput.darkSurfacePreset),
  );
  const [activeTheme, setActiveTheme] = useState<SurfaceTheme>("light");
  const [activeThemePresetName, setActiveThemePresetName] = useState<ActiveThemePresetName>("evergreen");

  function applyThemePreset(name: ColorEngineThemePresetName) {
    applyThemePresetInput(COLOR_ENGINE_THEME_PRESETS[name].input);
    setActiveThemePresetName(name);
  }

  function applyThemePresetInput(input: ColorEngineThemePresetInput) {
    setNeutralSeed(input.neutralSeed);
    setPrimarySeed(input.primarySeed);
    setPrimaryDarkSeed(input.primaryDarkSeed);
    setPrimarySeedPolicy(input.primarySeedPolicy);
    setSurfaceLightSeed(input.surfaceLightSeed);
    setSurfaceDarkSeed(input.surfaceDarkSeed);
    setDangerSeed(input.dangerSeed);
    setDangerDarkSeed(input.dangerDarkSeed);
    setDangerSeedPolicy(input.dangerSeedPolicy);
    setWarningSeed(input.warningSeed);
    setWarningDarkSeed(input.warningDarkSeed);
    setWarningSeedPolicy(input.warningSeedPolicy);
    setSuccessSeed(input.successSeed);
    setSuccessDarkSeed(input.successDarkSeed);
    setSuccessSeedPolicy(input.successSeedPolicy);
    setInfoSeed(input.infoSeed);
    setInfoDarkSeed(input.infoDarkSeed);
    setInfoSeedPolicy(input.infoSeedPolicy);
    setTextTreatment(input.textTreatment);
    setPreset(input.preset);
    setLightSurfacePreset(toSurfacePresetSelection(input.preset, input.lightSurfacePreset));
    setDarkSurfacePreset(toSurfacePresetSelection(input.preset, input.darkSurfacePreset));
  }

  function markCustom() {
    setActiveThemePresetName("custom");
  }

  const engine = useMemo(
    () => {
      const resolvedPrimaryDarkSeed = optionalSeed(primaryDarkSeed);
      const resolvedDangerDarkSeed = optionalSeed(dangerDarkSeed);
      const resolvedWarningDarkSeed = optionalSeed(warningDarkSeed);
      const resolvedSuccessDarkSeed = optionalSeed(successDarkSeed);
      const resolvedInfoDarkSeed = optionalSeed(infoDarkSeed);

      return createEngineState({
        neutralSeed,
        primarySeed,
        ...(resolvedPrimaryDarkSeed ? { primaryDarkSeed: resolvedPrimaryDarkSeed } : {}),
        surfaceLightSeed,
        surfaceDarkSeed,
        dangerSeed,
        ...(resolvedDangerDarkSeed ? { dangerDarkSeed: resolvedDangerDarkSeed } : {}),
        dangerSeedPolicy,
        warningSeed,
        ...(resolvedWarningDarkSeed ? { warningDarkSeed: resolvedWarningDarkSeed } : {}),
        warningSeedPolicy,
        successSeed,
        ...(resolvedSuccessDarkSeed ? { successDarkSeed: resolvedSuccessDarkSeed } : {}),
        successSeedPolicy,
        infoSeed,
        ...(resolvedInfoDarkSeed ? { infoDarkSeed: resolvedInfoDarkSeed } : {}),
        infoSeedPolicy,
        primarySeedPolicy,
        textTreatment,
        preset,
        ...(lightSurfacePreset === "inherit" ? {} : { lightSurfacePreset }),
        ...(darkSurfacePreset === "inherit" ? {} : { darkSurfacePreset }),
        namespace: defaultInput.namespace,
      });
    },
    [
      dangerSeed,
      dangerDarkSeed,
      dangerSeedPolicy,
      infoDarkSeed,
      infoSeed,
      infoSeedPolicy,
      darkSurfacePreset,
      lightSurfacePreset,
      neutralSeed,
      preset,
      primarySeed,
      primaryDarkSeed,
      primarySeedPolicy,
      successDarkSeed,
      successSeed,
      successSeedPolicy,
      surfaceDarkSeed,
      surfaceLightSeed,
      textTreatment,
      warningSeed,
      warningDarkSeed,
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
                activeThemePresetName={activeThemePresetName}
                dangerSeed={dangerSeed}
                dangerDarkSeed={dangerDarkSeed}
                dangerSeedPolicy={dangerSeedPolicy}
                engine={engine}
                infoSeed={infoSeed}
                infoDarkSeed={infoDarkSeed}
                infoSeedPolicy={infoSeedPolicy}
                neutralSeed={neutralSeed}
                primarySeed={primarySeed}
                primaryDarkSeed={primaryDarkSeed}
                primarySeedPolicy={primarySeedPolicy}
                preset={preset}
                lightSurfacePreset={lightSurfacePreset}
                darkSurfacePreset={darkSurfacePreset}
                successSeed={successSeed}
                successDarkSeed={successDarkSeed}
                successSeedPolicy={successSeedPolicy}
                surfaceDarkSeed={surfaceDarkSeed}
                surfaceLightSeed={surfaceLightSeed}
                textTreatment={textTreatment}
                warningSeed={warningSeed}
                warningDarkSeed={warningDarkSeed}
                warningSeedPolicy={warningSeedPolicy}
                onThemePresetApply={applyThemePreset}
                onActiveThemeChange={setActiveTheme}
                onDangerSeedChange={(value) => {
                  setDangerSeed(value);
                  markCustom();
                }}
                onDangerDarkSeedChange={(value) => {
                  setDangerDarkSeed(value);
                  markCustom();
                }}
                onDangerSeedPolicyChange={(value) => {
                  setDangerSeedPolicy(value);
                  markCustom();
                }}
                onInfoSeedChange={(value) => {
                  setInfoSeed(value);
                  markCustom();
                }}
                onInfoDarkSeedChange={(value) => {
                  setInfoDarkSeed(value);
                  markCustom();
                }}
                onInfoSeedPolicyChange={(value) => {
                  setInfoSeedPolicy(value);
                  markCustom();
                }}
                onNeutralSeedChange={(value) => {
                  setNeutralSeed(value);
                  markCustom();
                }}
                onPrimarySeedChange={(value) => {
                  setPrimarySeed(value);
                  markCustom();
                }}
                onPrimaryDarkSeedChange={(value) => {
                  setPrimaryDarkSeed(value);
                  markCustom();
                }}
                onPrimarySeedPolicyChange={(value) => {
                  setPrimarySeedPolicy(value);
                  markCustom();
                }}
                onPresetChange={(value) => {
                  setPreset(value);
                  markCustom();
                }}
                onLightSurfacePresetChange={(value) => {
                  setLightSurfacePreset(value);
                  markCustom();
                }}
                onDarkSurfacePresetChange={(value) => {
                  setDarkSurfacePreset(value);
                  markCustom();
                }}
                onSuccessSeedChange={(value) => {
                  setSuccessSeed(value);
                  markCustom();
                }}
                onSuccessDarkSeedChange={(value) => {
                  setSuccessDarkSeed(value);
                  markCustom();
                }}
                onSuccessSeedPolicyChange={(value) => {
                  setSuccessSeedPolicy(value);
                  markCustom();
                }}
                onSurfaceDarkSeedChange={(value) => {
                  setSurfaceDarkSeed(value);
                  markCustom();
                }}
                onSurfaceLightSeedChange={(value) => {
                  setSurfaceLightSeed(value);
                  markCustom();
                }}
                onTextTreatmentChange={(value) => {
                  setTextTreatment(value);
                  markCustom();
                }}
                onWarningSeedChange={(value) => {
                  setWarningSeed(value);
                  markCustom();
                }}
                onWarningDarkSeedChange={(value) => {
                  setWarningDarkSeed(value);
                  markCustom();
                }}
                onWarningSeedPolicyChange={(value) => {
                  setWarningSeedPolicy(value);
                  markCustom();
                }}
              />
            }
          />
          <Route path="/primitives" element={<Primitives engine={engine} />} />
          <Route path="/semantic" element={<SemanticPreview engine={engine} />} />
          <Route path="/themes" element={<ThemePreview engine={engine} />} />
          <Route path="/components" element={<ComponentProof engine={engine} />} />
          <Route path="/assertions" element={<AssertionReport engine={engine} />} />
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
            <Metric label="Shared surface preset" value={engine.output.preset.label} />
            <Metric label="Light surface preset" value={engine.output.surfacePresets.light.label} />
            <Metric label="Dark surface preset" value={engine.output.surfacePresets.dark.label} />
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
  activeThemePresetName,
  dangerSeed,
  dangerDarkSeed,
  dangerSeedPolicy,
  engine,
  infoSeed,
  infoDarkSeed,
  infoSeedPolicy,
  neutralSeed,
  primarySeed,
  primaryDarkSeed,
  primarySeedPolicy,
  preset,
  lightSurfacePreset,
  darkSurfacePreset,
  successSeed,
  successDarkSeed,
  successSeedPolicy,
  surfaceDarkSeed,
  surfaceLightSeed,
  textTreatment,
  warningSeed,
  warningDarkSeed,
  warningSeedPolicy,
  onThemePresetApply,
  onActiveThemeChange,
  onDangerSeedChange,
  onDangerDarkSeedChange,
  onDangerSeedPolicyChange,
  onInfoSeedChange,
  onInfoDarkSeedChange,
  onInfoSeedPolicyChange,
  onNeutralSeedChange,
  onPrimarySeedChange,
  onPrimaryDarkSeedChange,
  onPrimarySeedPolicyChange,
  onPresetChange,
  onLightSurfacePresetChange,
  onDarkSurfacePresetChange,
  onSuccessSeedChange,
  onSuccessDarkSeedChange,
  onSuccessSeedPolicyChange,
  onSurfaceDarkSeedChange,
  onSurfaceLightSeedChange,
  onTextTreatmentChange,
  onWarningSeedChange,
  onWarningDarkSeedChange,
  onWarningSeedPolicyChange,
}: {
  activeTheme: SurfaceTheme;
  activeThemePresetName: ActiveThemePresetName;
  dangerSeed: string;
  dangerDarkSeed: string;
  dangerSeedPolicy: SeedPolicy;
  engine: EngineState;
  infoSeed: string;
  infoDarkSeed: string;
  infoSeedPolicy: SeedPolicy;
  neutralSeed: string;
  primarySeed: string;
  primaryDarkSeed: string;
  primarySeedPolicy: SeedPolicy;
  preset: SurfacePresetName;
  lightSurfacePreset: SurfacePresetSelection;
  darkSurfacePreset: SurfacePresetSelection;
  successSeed: string;
  successDarkSeed: string;
  successSeedPolicy: SeedPolicy;
  surfaceDarkSeed: string;
  surfaceLightSeed: string;
  textTreatment: TextTreatmentStrategyName;
  warningSeed: string;
  warningDarkSeed: string;
  warningSeedPolicy: SeedPolicy;
  onThemePresetApply: (value: ColorEngineThemePresetName) => void;
  onActiveThemeChange: (value: SurfaceTheme) => void;
  onDangerSeedChange: (value: string) => void;
  onDangerDarkSeedChange: (value: string) => void;
  onDangerSeedPolicyChange: (value: SeedPolicy) => void;
  onInfoSeedChange: (value: string) => void;
  onInfoDarkSeedChange: (value: string) => void;
  onInfoSeedPolicyChange: (value: SeedPolicy) => void;
  onNeutralSeedChange: (value: string) => void;
  onPrimarySeedChange: (value: string) => void;
  onPrimaryDarkSeedChange: (value: string) => void;
  onPrimarySeedPolicyChange: (value: SeedPolicy) => void;
  onPresetChange: (value: SurfacePresetName) => void;
  onLightSurfacePresetChange: (value: SurfacePresetSelection) => void;
  onDarkSurfacePresetChange: (value: SurfacePresetSelection) => void;
  onSuccessSeedChange: (value: string) => void;
  onSuccessDarkSeedChange: (value: string) => void;
  onSuccessSeedPolicyChange: (value: SeedPolicy) => void;
  onSurfaceDarkSeedChange: (value: string) => void;
  onSurfaceLightSeedChange: (value: string) => void;
  onTextTreatmentChange: (value: TextTreatmentStrategyName) => void;
  onWarningSeedChange: (value: string) => void;
  onWarningDarkSeedChange: (value: string) => void;
  onWarningSeedPolicyChange: (value: SeedPolicy) => void;
}) {
  return (
    <ViewFrame
      title="Controls"
      subtitle="Tune neutral, surface, primary, and status seeds with a named surface separation preset."
    >
      <section className="control-section" aria-label="Example theme presets">
        <div className="section-heading">
          <h3>Theme Presets</h3>
          <span>{activeThemePresetName === "custom" ? "Custom" : COLOR_ENGINE_THEME_PRESETS[activeThemePresetName].label}</span>
        </div>
        <div className="preset-grid">
          {COLOR_ENGINE_THEME_PRESET_NAMES.map((name) => {
            const themePreset = COLOR_ENGINE_THEME_PRESETS[name];

            return (
              <button
                className={
                  activeThemePresetName === name
                    ? "preset-button preset-button-active"
                    : "preset-button"
                }
                aria-pressed={activeThemePresetName === name}
                key={name}
                type="button"
                onClick={() => onThemePresetApply(name)}
              >
                <strong>{themePreset.label}</strong>
                <span>{themePreset.description}</span>
                <code>{themePreset.input.lightSurfacePreset} / {themePreset.input.darkSurfacePreset}</code>
              </button>
            );
          })}
        </div>
      </section>
      <section className="control-grid" aria-label="Engine controls">
        <SeedField
          label="Neutral seed"
          value={neutralSeed}
          onChange={onNeutralSeedChange}
        />
        <SeedField
          label="Primary light seed"
          value={primarySeed}
          onChange={onPrimarySeedChange}
        />
        <SeedField
          label="Primary dark seed (optional)"
          value={primaryDarkSeed}
          onChange={onPrimaryDarkSeedChange}
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
          label="Danger light seed"
          value={dangerSeed}
          onChange={onDangerSeedChange}
        />
        <SeedField
          label="Danger dark seed (optional)"
          value={dangerDarkSeed}
          onChange={onDangerDarkSeedChange}
        />
        <PolicyField
          label="Danger policy"
          value={dangerSeedPolicy}
          onChange={onDangerSeedPolicyChange}
        />
        <SeedField
          label="Warning light seed"
          value={warningSeed}
          onChange={onWarningSeedChange}
        />
        <SeedField
          label="Warning dark seed (optional)"
          value={warningDarkSeed}
          onChange={onWarningDarkSeedChange}
        />
        <PolicyField
          label="Warning policy"
          value={warningSeedPolicy}
          onChange={onWarningSeedPolicyChange}
        />
        <SeedField
          label="Success light seed"
          value={successSeed}
          onChange={onSuccessSeedChange}
        />
        <SeedField
          label="Success dark seed (optional)"
          value={successDarkSeed}
          onChange={onSuccessDarkSeedChange}
        />
        <PolicyField
          label="Success policy"
          value={successSeedPolicy}
          onChange={onSuccessSeedPolicyChange}
        />
        <SeedField
          label="Info light seed"
          value={infoSeed}
          onChange={onInfoSeedChange}
        />
        <SeedField
          label="Info dark seed (optional)"
          value={infoDarkSeed}
          onChange={onInfoDarkSeedChange}
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
      <section className="control-section" aria-label="Surface presets">
        <div className="section-heading">
          <h3>Surface Separation</h3>
          <span>{SURFACE_PRESETS[preset].label} fallback</span>
        </div>
        <div className="surface-preset-stack">
          <SurfacePresetPicker
            label="Shared fallback"
            value={preset}
            onChange={(value) => {
              if (value !== "inherit") {
                onPresetChange(value);
              }
            }}
          />
          <SurfacePresetPicker
            label="Light surface separation"
            sharedPreset={preset}
            value={lightSurfacePreset}
            onChange={onLightSurfacePresetChange}
          />
          <SurfacePresetPicker
            label="Dark surface separation"
            sharedPreset={preset}
            value={darkSurfacePreset}
            onChange={onDarkSurfacePresetChange}
          />
        </div>
      </section>
      <section className="control-section" aria-label="Text treatment strategies">
        <div className="section-heading">
          <h3>Text Treatment</h3>
          <span>{TEXT_TREATMENT_STRATEGIES[textTreatment].label}</span>
        </div>
        <div className="preset-grid">
          {TEXT_TREATMENT_STRATEGY_NAMES.map((name) => {
            const option = TEXT_TREATMENT_STRATEGIES[name];

            return (
              <button
                className={textTreatment === name ? "preset-button preset-button-active" : "preset-button"}
                aria-pressed={textTreatment === name}
                key={name}
                type="button"
                onClick={() => onTextTreatmentChange(name)}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            );
          })}
        </div>
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
      subtitle="Compact primitive families keep neutral, text, surface, primary, and status concerns split by UI job."
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
      <ForegroundTextReview />
      <TextTreatmentReview output={engine.output} />
    </ViewFrame>
  );
}

function ComponentProof({ engine }: { engine: EngineState }) {
  if (engine.kind === "error") {
    return <ErrorView engine={engine} />;
  }

  return (
    <ViewFrame
      title="Component Proof"
      subtitle="Custom elements rendered from the generated semantic CSS contract in light and dark theme boundaries."
    >
      <section className="component-grid" aria-label="Web component proof">
        {themeOptions.map((theme) => (
          <ComponentSample key={theme.key} label={theme.label} theme={theme.key} />
        ))}
      </section>
    </ViewFrame>
  );
}

function ComponentSample({ label, theme }: { label: string; theme: SurfaceTheme }) {
  return (
    <article className="component-sample" data-theme-v2={theme}>
      <header className="theme-sample-header">
        <h3>{label}</h3>
        <span>{theme}</span>
      </header>
      <div className="component-surface">
        <div className="component-actions" aria-label={`${label} button proof`}>
          <pf-button>Primary action</pf-button>
          <pf-button variant="secondary">Secondary</pf-button>
          <pf-button disabled>Disabled</pf-button>
          <pf-button variant="secondary" disabled>
            Disabled secondary
          </pf-button>
        </div>
        <div className="component-badges" aria-label={`${label} badge proof`}>
          {statusIntents.map((intent) => (
            <pf-badge key={`${intent.key}-badge-soft`} status={intent.key}>
              {intent.label}
            </pf-badge>
          ))}
          {statusIntents.map((intent) => (
            <pf-badge key={`${intent.key}-badge-solid`} status={intent.key} variant="solid">
              {intent.label}
            </pf-badge>
          ))}
        </div>
        <div className="component-cards" aria-label={`${label} card proof`}>
          <pf-card>
            <span slot="eyebrow">Surface</span>
            <span slot="title">Default card</span>
            Surface, border, and text roles compose this proof without primitive variables.
            <span slot="footer">Semantic CSS variables only</span>
          </pf-card>
          <pf-card variant="raised">
            <span slot="eyebrow">Raised</span>
            <span slot="title">Raised card</span>
            The raised variant switches to stronger surface and chrome semantics.
            <span slot="footer">No component-local color derivation</span>
          </pf-card>
        </div>
        <div className="component-alerts" aria-label={`${label} alert proof`}>
          {statusIntents.map((intent) => (
            <pf-alert key={`${intent.key}-soft`} status={intent.key}>
              <span slot="title">{intent.label} soft</span>
              Semantic status variables drive the container, border, and text.
            </pf-alert>
          ))}
          {statusIntents.map((intent) => (
            <pf-alert key={`${intent.key}-solid`} status={intent.key} variant="solid">
              <span slot="title">{intent.label} solid</span>
              Solid status variables drive the background and foreground.
            </pf-alert>
          ))}
        </div>
      </div>
    </article>
  );
}

function ForegroundTextReview() {
  return (
    <section className="foreground-text-review" aria-label="Foreground text review">
      <header className="panel-header">
        <h3>Foreground Text Review</h3>
        <span>{TEXT_LEVELS.length} levels</span>
      </header>
      <div className="foreground-text-grid">
        {themeOptions.map((theme) => (
          <article className="foreground-text-card" data-theme-v2={theme.key} key={theme.key}>
            <header className="theme-sample-header">
              <h3>{theme.label}</h3>
              <span>{theme.key}</span>
            </header>
            <div className="foreground-text-surface">
              {TEXT_LEVELS.map((level) => (
                <p className={`foreground-text-line foreground-text-${level}`} key={level}>
                  <strong>{labelize(level)}</strong>
                  <span>
                    This line uses the {theme.key === "light" ? "text-dark" : "text-light"} {level} primitive
                    on a normal app surface.
                  </span>
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TextTreatmentReview({ output }: { output: ColorEngineOutput }) {
  const strategyOutputs = TEXT_TREATMENT_STRATEGY_NAMES.map((strategy) => ({
    strategy,
    output: createColorEngineTheme({
      ...output.input,
      namespace: `ds-${strategy}`,
      textTreatment: strategy,
    }),
  }));

  return (
    <section className="text-treatment-review" aria-label="Text treatment strategy review">
      <EngineStyles css={strategyOutputs.map((entry) => entry.output.css).join("\n\n")} />
      <header className="panel-header">
        <h3>Text Treatment Review</h3>
        <span>{TEXT_TREATMENT_STRATEGY_NAMES.length} strategies</span>
      </header>
      <div className="text-treatment-grid">
        {strategyOutputs.flatMap(({ output: strategyOutput, strategy }) =>
          themeOptions.map((theme) => (
            <TextTreatmentCard
              key={`${strategy}-${theme.key}`}
              output={strategyOutput}
              strategy={strategy}
              theme={theme.key}
            />
          )),
        )}
      </div>
    </section>
  );
}

function TextTreatmentCard({
  output,
  strategy,
  theme,
}: {
  output: ColorEngineOutput;
  strategy: TextTreatmentStrategyName;
  theme: SurfaceTheme;
}) {
  const namespace = output.namespace;
  const label = `${TEXT_TREATMENT_STRATEGIES[strategy].label} ${labelize(theme)}`;
  const requiredFailures = output.assertions.results.filter((result) =>
    result.theme === theme &&
    result.severity === "required" &&
    !result.passed
  ).length;

  return (
    <article className="text-treatment-card" data-theme-v2={theme}>
      <header className="theme-sample-header">
        <h3>{label}</h3>
        <span>{requiredFailures} required fails</span>
      </header>
      <p>{TEXT_TREATMENT_STRATEGIES[strategy].description}</p>
      <div
        className="text-treatment-soft-sample"
        style={{
          background: scopedCssVar(namespace, "primary-soft-bg"),
          borderColor: scopedCssVar(namespace, "primary-soft-border"),
          color: scopedCssVar(namespace, "primary-soft-text"),
        }}
      >
        <strong>Primary soft</strong>
        <span>Soft colored surface text treatment.</span>
      </div>
      <div className="text-treatment-status-grid">
        {statusIntents.map((intent) => (
          <div
            className="text-treatment-soft-sample"
            key={intent.key}
            style={{
              background: scopedCssVar(namespace, `${intent.key}-soft-bg`),
              borderColor: scopedCssVar(namespace, `${intent.key}-soft-border`),
              color: scopedCssVar(namespace, `${intent.key}-soft-text`),
            }}
          >
            <strong>{intent.label} soft</strong>
            <span>Same surface, alternate text.</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function AssertionReport({ engine }: { engine: EngineState }) {
  if (engine.kind === "error") {
    return <ErrorView engine={engine} />;
  }

  const report = engine.output.assertions;
  const failed = report.results.filter((result) => !result.passed);

  return (
    <ViewFrame
      title="APCA Assertions"
      subtitle="Diagnostic text and UI contrast pairs rendered from generated semantic roles. Failures are reported only; no tuning is applied here."
    >
      <section className="metric-grid" aria-label="Assertion summary">
        <Metric label="Total pairs" value={report.summary.total.toString()} />
        <Metric label="Passed" value={report.summary.passed.toString()} />
        <Metric label="Required failed" value={report.summary.requiredFailed.toString()} />
        <Metric label="Diagnostic failed" value={report.summary.diagnosticFailed.toString()} />
      </section>
      <AnchoredPolicyDiagnostics output={engine.output} failures={failed} />
      <section className="assertion-summary-row" aria-label="Assertion metadata">
        <Metric label="Algorithm" value={report.apcaAlgorithmVersion} />
        {assertionRoles.map((role) => (
          <Metric
            key={role}
            label={`${assertionRoleLabels[role]} threshold`}
            value={`Lc ${report.thresholds[role]}`}
          />
        ))}
      </section>
      <section className="assertion-panel assertion-failure-panel" aria-label="Failed assertions">
        <header className="panel-header">
          <h3>Failures</h3>
          <span>{failed.length} pairs</span>
        </header>
        {failed.length > 0 ? (
          <div className="assertion-list">
            {failed.map((result) => (
              <AssertionResultRow key={result.id} output={engine.output} result={result} />
            ))}
          </div>
        ) : (
          <p className="assertion-empty">No assertion failures for the current inputs.</p>
        )}
      </section>
      <section className="assertion-groups" aria-label="Assertions grouped by theme and role">
        {themeOptions.flatMap((theme) =>
          assertionRoles.map((role) => {
            const results = report.results.filter(
              (result) => result.theme === theme.key && result.role === role,
            );
            const failures = results.filter((result) => !result.passed).length;

            return (
              <article className="assertion-panel" key={`${theme.key}-${role}`}>
                <header className="panel-header">
                  <h3>{theme.label} {assertionRoleLabels[role]}</h3>
                  <span>{failures} failed / {results.length}</span>
                </header>
                <div className="assertion-list">
                  {results.map((result) => (
                    <AssertionResultRow key={result.id} output={engine.output} result={result} />
                  ))}
                </div>
              </article>
            );
          }),
        )}
      </section>
    </ViewFrame>
  );
}

function AnchoredPolicyDiagnostics({
  failures,
  output,
}: {
  failures: readonly ResolvedContrastAssertion[];
  output: ColorEngineOutput;
}) {
  const activeAnchoredPolicies = getActiveAnchoredPolicyLabels(output);

  if (activeAnchoredPolicies.length === 0) {
    return null;
  }

  const anchoredFailures = failures.filter((result) => getAnchoredPolicyNote(result, output) !== null);

  return (
    <section className="assertion-panel assertion-policy-panel" aria-label="Anchored policy diagnostics">
      <header className="panel-header">
        <h3>Anchored Policy Diagnostics</h3>
        <span>{anchoredFailures.length} linked failures</span>
      </header>
      <p>
        Anchored mode preserves the exact seed as the solid level 2 token. Related failures mean the preserved seed
        or its derived state does not meet the role threshold without adaptation.
      </p>
      <div className="policy-chip-row" aria-label="Active anchored policies">
        {activeAnchoredPolicies.map((label) => (
          <span className="policy-chip" key={label}>{label}</span>
        ))}
      </div>
    </section>
  );
}

function AssertionResultRow({
  output,
  result,
}: {
  output: ColorEngineOutput;
  result: ResolvedContrastAssertion;
}) {
  const anchoredPolicyNote = getAnchoredPolicyNote(result, output);

  return (
    <div className={result.passed ? "assertion-row assertion-row-pass" : "assertion-row assertion-row-fail"}>
      <div className="assertion-row-main">
        <span className="assertion-status">{result.passed ? "Pass" : "Fail"}</span>
        <strong>{result.foreground} on {result.background}</strong>
      </div>
      <div className="assertion-row-metrics">
        <span>Lc {formatNumber(result.lc)}</span>
        <span>Abs {formatNumber(result.absLc)}</span>
        <span>Min {result.threshold}</span>
        <span>{labelize(result.severity)}</span>
      </div>
      <div className="assertion-row-tokens">
        <code>{result.foregroundToken.name}</code>
        <code>{result.backgroundToken.name}</code>
      </div>
      {anchoredPolicyNote ? <p className="assertion-note">{anchoredPolicyNote}</p> : null}
    </div>
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
      <div className="text-demo" aria-label={`${label} foreground text preview`}>
        <strong>Heading text</strong>
        <p>Body text uses dedicated foreground primitives instead of borrowed surface colors.</p>
        <span>Muted supporting text remains lower emphasis.</span>
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

function SurfacePresetPicker({
  label,
  sharedPreset,
  value,
  onChange,
}: {
  label: string;
  sharedPreset?: SurfacePresetName;
  value: SurfacePresetSelection;
  onChange: (value: SurfacePresetSelection) => void;
}) {
  const resolvedValue = value === "inherit" ? sharedPreset ?? "standard" : value;

  return (
    <div className="surface-preset-picker">
      <div className="section-heading">
        <h4>{label}</h4>
        <span>{value === "inherit" ? `Using ${SURFACE_PRESETS[resolvedValue].label}` : SURFACE_PRESETS[resolvedValue].label}</span>
      </div>
      <div className="preset-grid">
        {sharedPreset ? (
          <button
            className={value === "inherit" ? "preset-button preset-button-active" : "preset-button"}
            aria-pressed={value === "inherit"}
            type="button"
            onClick={() => onChange("inherit")}
          >
            <strong>Use shared</strong>
            <span>Inherit the shared fallback setting.</span>
          </button>
        ) : null}
        {SURFACE_PRESET_NAMES.map((name) => {
          const option = SURFACE_PRESETS[name];

          return (
            <button
              className={value === name ? "preset-button preset-button-active" : "preset-button"}
              aria-pressed={value === name}
              key={name}
              type="button"
              onClick={() => onChange(name)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
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
      <Metric label="Text treatment" value={output.textTreatment.label} />
      <Metric label="Neutral LCH" value={formatOklchSummary(output.seeds.neutral)} />
      <Metric label="Primary light LCH" value={formatOklchSummary(output.seeds.primary)} />
      <Metric label="Primary dark LCH" value={formatOklchSummary(output.seeds.primaryDark)} />
      <Metric label="Danger light LCH" value={formatOklchSummary(output.seeds.status.danger)} />
      <Metric label="Danger dark LCH" value={formatOklchSummary(output.seeds.statusDark.danger)} />
      <Metric label="Warning light LCH" value={formatOklchSummary(output.seeds.status.warning)} />
      <Metric label="Warning dark LCH" value={formatOklchSummary(output.seeds.statusDark.warning)} />
      <Metric label="Success light LCH" value={formatOklchSummary(output.seeds.status.success)} />
      <Metric label="Success dark LCH" value={formatOklchSummary(output.seeds.statusDark.success)} />
      <Metric label="Info light LCH" value={formatOklchSummary(output.seeds.status.info)} />
      <Metric label="Info dark LCH" value={formatOklchSummary(output.seeds.statusDark.info)} />
      <Metric label="Light surface LCH" value={formatOklchSummary(output.seeds.surfaceLight)} />
      <Metric label="Dark surface LCH" value={formatOklchSummary(output.seeds.surfaceDark)} />
      <Metric label="Shared preset" value={output.preset.label} />
      <Metric label="Light preset" value={output.surfacePresets.light.label} />
      <Metric label="Dark preset" value={output.surfacePresets.dark.label} />
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

function optionalSeed(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed.length > 0 ? value : undefined;
}

function toSurfacePresetSelection(
  sharedPreset: SurfacePresetName,
  themePreset: SurfacePresetName,
): SurfacePresetSelection {
  return themePreset === sharedPreset ? "inherit" : themePreset;
}

function cssVar(token: string): `var(--${string})` {
  return `var(--${defaultInput.namespace}-${token})`;
}

function scopedCssVar(namespace: string, token: string): `var(--${string})` {
  return `var(--${namespace}-${token})`;
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
    return "Exact parsed primary light seed. Dark output can use a separate dark seed.";
  }

  if (family === "primary-light-solid") {
    return `${labelize(output.seedPolicies.primary)} primary policy. ${output.seedPolicies.primary === "anchored" ? "Level 2 preserves the light seed." : "Light seed adapted into a balanced solid ramp."}`;
  }

  if (family === "primary-dark-solid") {
    return `${labelize(output.seedPolicies.primary)} primary policy. ${output.seedPolicies.primary === "anchored" ? "Level 2 preserves the dark seed." : "Dark seed adapted into a balanced solid ramp."}`;
  }

  if (family === "primary-light-soft") {
    return `${labelize(output.seedPolicies.primary)} primary policy. Soft ramp derives from the light seed for usable containers.`;
  }

  if (family === "primary-dark-soft") {
    return `${labelize(output.seedPolicies.primary)} primary policy. Soft ramp derives from the dark seed for dark containers.`;
  }

  for (const intent of STATUS_INTENTS) {
    if (family === `${intent}-seed`) {
      return `Exact parsed ${intent} light seed. Dark output can use a separate dark seed.`;
    }

    if (family === `${intent}-light-solid`) {
      const policy = output.seedPolicies.status[intent];

      return `${labelize(policy)} ${intent} policy. ${policy === "anchored" ? "Level 2 preserves the light seed." : "Light seed adapted into a balanced solid ramp."}`;
    }

    if (family === `${intent}-dark-solid`) {
      const policy = output.seedPolicies.status[intent];

      return `${labelize(policy)} ${intent} policy. ${policy === "anchored" ? "Level 2 preserves the dark seed." : "Dark seed adapted into a balanced solid ramp."}`;
    }

    if (family === `${intent}-light-soft`) {
      const policy = output.seedPolicies.status[intent];

      return `${labelize(policy)} ${intent} policy. Soft ramp derives from the light seed for usable containers.`;
    }

    if (family === `${intent}-dark-soft`) {
      const policy = output.seedPolicies.status[intent];

      return `${labelize(policy)} ${intent} policy. Soft ramp derives from the dark seed for dark containers.`;
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

function getActiveAnchoredPolicyLabels(output: ColorEngineOutput): readonly string[] {
  const labels: string[] = [];

  if (output.seedPolicies.primary === "anchored") {
    labels.push("Primary");
  }

  for (const intent of STATUS_INTENTS) {
    if (output.seedPolicies.status[intent] === "anchored") {
      labels.push(labelize(intent));
    }
  }

  return labels;
}

function getAnchoredPolicyNote(
  result: ResolvedContrastAssertion,
  output: ColorEngineOutput,
): string | null {
  if (result.passed) {
    return null;
  }

  if (
    output.seedPolicies.primary === "anchored" &&
    (result.foreground.startsWith("primary-") || result.background.startsWith("primary-"))
  ) {
    return "Anchored primary preserves the seed in the solid action ramp; this failure is the contrast cost of that preservation.";
  }

  for (const intent of STATUS_INTENTS) {
    if (
      output.seedPolicies.status[intent] === "anchored" &&
      (result.foreground.startsWith(`${intent}-`) || result.background.startsWith(`${intent}-`))
    ) {
      return `Anchored ${intent} preserves the seed in its solid ramp; this failure is the contrast cost of that preservation.`;
    }
  }

  return null;
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
