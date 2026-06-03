import type {
  ColorEngineInput,
  ColorEngineOutput,
  ColorToken,
  OklchValue,
  PrimarySemanticTokenName,
  SurfacePreset,
  SurfacePresetName,
  SemanticTokenName,
} from "../src/index.js";
import { SURFACE_PRESETS, createColorEngineTheme } from "../src/index.js";

const presetName: SurfacePresetName = "standard";
const preset: SurfacePreset = SURFACE_PRESETS[presetName];
const lightStepDelta: number = preset.lightStepDelta;
const darkStepDelta: number = preset.darkStepDelta;
const input: ColorEngineInput = {
  neutralSeed: "#d8dee8",
  primarySeed: "#0f6f3d",
  surfaceLightSeed: "oklch(0.94 0.01 255)",
  surfaceDarkSeed: "#111827",
  preset: presetName,
  namespace: "pf",
};
const output: ColorEngineOutput = createColorEngineTheme(input);
const token: ColorToken | undefined = output.primitives["primary-light-solid"][0];
const surfaceSemanticName: SemanticTokenName = "surface-1-hover";
const primarySemanticName: PrimarySemanticTokenName = "primary-action-bg";
const oklch: OklchValue = output.seeds.neutral;
const primarySeed: OklchValue = output.seeds.primary;

void preset;
void lightStepDelta;
void darkStepDelta;
void token;
void surfaceSemanticName;
void primarySemanticName;
void oklch;
void primarySeed;
