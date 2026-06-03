import type {
  ApcaConstants,
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
} from "../src/index.js";
import {
  APCA_ALGORITHM_VERSION,
  APCA_CONSTANTS,
  CHROME_LEVELS,
  CONTRAST_ASSERTION_THRESHOLDS,
  NEUTRAL_SEMANTIC_TOKEN_NAMES,
  PRIMARY_SEMANTIC_TOKEN_NAMES,
  SEED_POLICY_NAMES,
  SEMANTIC_TOKEN_NAMES,
  SURFACE_PRESETS,
  SURFACE_SEMANTIC_TOKEN_NAMES,
  STATUS_SEMANTIC_TOKEN_NAMES,
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
  primarySeedPolicy: "anchored",
  dangerSeed: "#c62828",
  dangerSeedPolicy: "balanced",
  warningSeed: "#b26a00",
  warningSeedPolicy: "anchored",
  successSeed: "#16823a",
  successSeedPolicy: "balanced",
  infoSeed: "#0b6ea8",
  infoSeedPolicy: "balanced",
  surfaceLightSeed: "oklch(0.94 0.01 255)",
  surfaceDarkSeed: "#111827",
  preset: presetName,
  namespace: "pf",
};
const output: ColorEngineOutput = createColorEngineTheme(input);
const seedPolicy: SeedPolicy = "anchored";
const chromeLevel: ChromeLevel = "default";
const token: ColorToken | undefined = output.primitives["primary-light-solid"][0];
const chromeToken: ColorToken | undefined = output.primitives["chrome-light"][0];
const seedToken: ColorToken | undefined = output.primitives["primary-seed"][0];
const statusToken: ColorToken | undefined = output.primitives["danger-light-soft"][0];
const neutralSemanticName: NeutralSemanticTokenName = "border-default";
const surfaceSemanticName: SemanticTokenName = "surface-1-hover";
const primarySemanticName: PrimarySemanticTokenName = "primary-action-bg";
const statusSemanticName: StatusSemanticTokenName = "danger-soft-bg";
const statusIntent: StatusIntent = "warning";
const oklch: OklchValue = output.seeds.neutral;
const primarySeed: OklchValue = output.seeds.primary;
const warningSeed: OklchValue = output.seeds.status.warning;
const warningSeedPolicy: SeedPolicy = output.seedPolicies.status.warning;
const cssOutput: ColorEngineCssOutput = output.cssOutput;
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
void seedPolicy;
void chromeLevel;
void token;
void chromeToken;
void seedToken;
void statusToken;
void neutralSemanticName;
void surfaceSemanticName;
void primarySemanticName;
void statusSemanticName;
void statusIntent;
void oklch;
void primarySeed;
void warningSeed;
void warningSeedPolicy;
void cssOutput;
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
