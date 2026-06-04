import type {
  ApcaConstants,
  ColorEngineCssFile,
  ColorEngineCssFileKind,
  ColorEngineCssFileName,
  ColorEngineThemePreset,
  ColorEngineThemePresetInput,
  ColorEngineThemePresetName,
  ChromeLevel,
  ColorEngineCssOutput,
  ColorEngineInput,
  ColorEngineOutput,
  ColorToken,
  ContrastAssertionPair,
  ContrastAssertionReport,
  ContrastAssertionRole,
  ContrastAssertionSeverity,
  ContrastAssertionSummary,
  NeutralSemanticTokenName,
  OklchValue,
  PrimarySemanticTokenName,
  ResolvedContrastAssertion,
  SeedPolicy,
  SrgbColor,
  SurfacePreset,
  SurfacePresetName,
  SemanticTokenName,
  StatusIntent,
  StatusSemanticTokenName,
  TextLevel,
  TextTreatmentStrategy,
  TextTreatmentStrategyName,
} from "../src/index.js";
import {
  APCA_ALGORITHM_VERSION,
  APCA_CONSTANTS,
  CHROME_LEVELS,
  COLOR_ENGINE_CSS_LOAD_ORDER,
  COLOR_ENGINE_THEME_PRESET_NAMES,
  COLOR_ENGINE_THEME_PRESETS,
  CONTRAST_ASSERTION_THRESHOLDS,
  NEUTRAL_SEMANTIC_TOKEN_NAMES,
  PRIMARY_SEMANTIC_TOKEN_NAMES,
  SEED_POLICY_NAMES,
  SEMANTIC_TOKEN_NAMES,
  SURFACE_PRESETS,
  SURFACE_SEMANTIC_TOKEN_NAMES,
  STATUS_SEMANTIC_TOKEN_NAMES,
  TEXT_LEVELS,
  TEXT_TREATMENT_STRATEGIES,
  TEXT_TREATMENT_STRATEGY_NAMES,
  calculateApcaLc,
  calculateApcaLcFromOklch,
  calculateApcaLcFromY,
  createContrastAssertionReport,
  createColorEngineTheme,
  srgbToApcaY,
} from "../src/index.js";

const presetName: SurfacePresetName = "standard";
const preset: SurfacePreset = SURFACE_PRESETS[presetName];
const lightStepDelta: number = preset.lightStepDelta;
const darkStepDelta: number = preset.darkStepDelta;
const input: ColorEngineInput = {
  neutralSeed: "#d8dee8",
  primarySeed: "#0f6f3d",
  primaryDarkSeed: "oklch(0.64 0.11 150)",
  primarySeedPolicy: "anchored",
  dangerSeed: "#c62828",
  dangerDarkSeed: "oklch(0.68 0.12 28)",
  dangerSeedPolicy: "balanced",
  warningSeed: "#b26a00",
  warningDarkSeed: "oklch(0.75 0.13 88)",
  warningSeedPolicy: "anchored",
  successSeed: "#16823a",
  successDarkSeed: "oklch(0.68 0.11 150)",
  successSeedPolicy: "balanced",
  infoSeed: "#0b6ea8",
  infoDarkSeed: "oklch(0.68 0.11 235)",
  infoSeedPolicy: "balanced",
  surfaceLightSeed: "oklch(0.94 0.01 255)",
  surfaceDarkSeed: "#111827",
  textTreatment: "adaptive",
  preset: presetName,
  lightSurfacePreset: "quiet",
  darkSurfacePreset: "layered",
  namespace: "pf",
};
const output: ColorEngineOutput = createColorEngineTheme(input);
const seedPolicy: SeedPolicy = "anchored";
const chromeLevel: ChromeLevel = "default";
const textLevel: TextLevel = "strong";
const token: ColorToken | undefined = output.primitives["primary-light-solid"][0];
const chromeToken: ColorToken | undefined = output.primitives["chrome-light"][0];
const textToken: ColorToken | undefined = output.primitives["text-light"][0];
const seedToken: ColorToken | undefined = output.primitives["primary-seed"][0];
const statusToken: ColorToken | undefined = output.primitives["danger-light-soft"][0];
const neutralSemanticName: NeutralSemanticTokenName = "border-default";
const surfaceSemanticName: SemanticTokenName = "surface-1-hover";
const primarySemanticName: PrimarySemanticTokenName = "primary-action-bg";
const statusSemanticName: StatusSemanticTokenName = "danger-soft-bg";
const statusIntent: StatusIntent = "warning";
const oklch: OklchValue = output.seeds.neutral;
const primarySeed: OklchValue = output.seeds.primary;
const primaryDarkSeed: OklchValue = output.seeds.primaryDark;
const warningSeed: OklchValue = output.seeds.status.warning;
const warningDarkSeed: OklchValue = output.seeds.statusDark.warning;
const warningSeedPolicy: SeedPolicy = output.seedPolicies.status.warning;
const textTreatmentName: TextTreatmentStrategyName = output.textTreatment.name;
const textTreatment: TextTreatmentStrategy = TEXT_TREATMENT_STRATEGIES[textTreatmentName];
const lightSurfacePreset: SurfacePreset = output.surfacePresets.light;
const darkSurfacePreset: SurfacePreset = output.surfacePresets.dark;
const cssOutput: ColorEngineCssOutput = output.cssOutput;
const cssFile: ColorEngineCssFile | undefined = cssOutput.files[0];
const cssFileName: ColorEngineCssFileName = "primitives.css";
const cssFileKind: ColorEngineCssFileKind = "primitives";
const themePresetName: ColorEngineThemePresetName = "evergreen";
const themePreset: ColorEngineThemePreset = COLOR_ENGINE_THEME_PRESETS[themePresetName];
const themePresetInput: ColorEngineThemePresetInput = themePreset.input;
const semanticTokenNames: readonly SemanticTokenName[] = SEMANTIC_TOKEN_NAMES;
const apcaConstants: ApcaConstants = APCA_CONSTANTS;
const srgbColor: SrgbColor = { r: 0, g: 0, b: 0 };
const apcaLc: number = calculateApcaLc(srgbColor, { r: 1, g: 1, b: 1 });
const apcaOklchLc: number = calculateApcaLcFromOklch(output.seeds.primary, output.seeds.surfaceLight);
const apcaYLc: number = calculateApcaLcFromY(0, 1);
const apcaY: number = srgbToApcaY(srgbColor);
const apcaAlgorithmVersion: string = APCA_ALGORITHM_VERSION;
const assertionRole: ContrastAssertionRole = "body";
const assertionSeverity: ContrastAssertionSeverity = "required";
const assertionReport: ContrastAssertionReport = output.assertions;
const assertionPair: ContrastAssertionPair | undefined = assertionReport.pairs[0];
const assertionResult: ResolvedContrastAssertion | undefined = assertionReport.results[0];
const assertionSummary: ContrastAssertionSummary = assertionReport.summary;
const assertionThreshold: number = CONTRAST_ASSERTION_THRESHOLDS["status-solid"];
const assertionReportFromHelper: ContrastAssertionReport = createContrastAssertionReport({
  namespace: output.namespace,
  primitives: output.primitives,
  semantics: output.semantics,
});

void preset;
void lightStepDelta;
void darkStepDelta;
void lightSurfacePreset;
void darkSurfacePreset;
void seedPolicy;
void chromeLevel;
void textLevel;
void token;
void chromeToken;
void textToken;
void seedToken;
void statusToken;
void neutralSemanticName;
void surfaceSemanticName;
void primarySemanticName;
void statusSemanticName;
void statusIntent;
void oklch;
void primarySeed;
void primaryDarkSeed;
void warningSeed;
void warningDarkSeed;
void warningSeedPolicy;
void textTreatmentName;
void textTreatment;
void cssOutput;
void cssFile;
void cssFileName;
void cssFileKind;
void themePresetName;
void themePreset;
void themePresetInput;
void COLOR_ENGINE_CSS_LOAD_ORDER;
void COLOR_ENGINE_THEME_PRESET_NAMES;
void semanticTokenNames;
void NEUTRAL_SEMANTIC_TOKEN_NAMES;
void SURFACE_SEMANTIC_TOKEN_NAMES;
void PRIMARY_SEMANTIC_TOKEN_NAMES;
void STATUS_SEMANTIC_TOKEN_NAMES;
void apcaConstants;
void apcaLc;
void apcaOklchLc;
void apcaYLc;
void apcaY;
void apcaAlgorithmVersion;
void assertionRole;
void assertionSeverity;
void assertionReport;
void assertionPair;
void assertionResult;
void assertionSummary;
void assertionThreshold;
void assertionReportFromHelper;
void SEED_POLICY_NAMES;
void CHROME_LEVELS;
void TEXT_LEVELS;
void TEXT_TREATMENT_STRATEGY_NAMES;
