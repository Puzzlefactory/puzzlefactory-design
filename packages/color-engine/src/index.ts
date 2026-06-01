export type HarmonyStrategy =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "monochromatic";

export type Mood = "vibrant" | "muted" | "neutral";

export type ThemeVariant =
  | "light"
  | "dark"
  | "high-contrast"
  | "high-contrast-dark";

export interface OklchColor {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

export interface ColorEngineInput {
  readonly seed: string;
  readonly harmony: HarmonyStrategy;
  readonly mood: Mood;
}

export interface EngineMetadata {
  readonly originalSeed: string;
  readonly normalizedSeed: OklchColor;
}

export interface EngineOutput {
  readonly input: ColorEngineInput;
  readonly metadata: EngineMetadata;
}
