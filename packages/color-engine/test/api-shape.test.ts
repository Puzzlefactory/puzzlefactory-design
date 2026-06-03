import type {
  ColorEngineInput,
  ColorEngineOutput,
  ColorToken,
  OklchValue,
  SurfacePreset,
  SurfacePresetName,
  SurfaceSemanticTokenName,
} from "../src/index.js";
import { SURFACE_PRESETS, createColorEngineTheme } from "../src/index.js";

const presetName: SurfacePresetName = "standard";
const preset: SurfacePreset = SURFACE_PRESETS[presetName];
const input: ColorEngineInput = {
  neutralSeed: "#d8dee8",
  surfaceLightSeed: "oklch(0.94 0.01 255)",
  surfaceDarkSeed: "#111827",
  preset: presetName,
  namespace: "pf",
};
const output: ColorEngineOutput = createColorEngineTheme(input);
const token: ColorToken | undefined = output.primitives["surface-light"][0];
const semanticName: SurfaceSemanticTokenName = "surface-1-hover";
const oklch: OklchValue = output.seeds.neutral;

void preset;
void token;
void semanticName;
void oklch;
