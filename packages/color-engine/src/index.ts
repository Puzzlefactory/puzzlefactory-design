export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type RampTone = "l" | "d";

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

export type SemanticThemeKey =
  | "light"
  | "dark"
  | "highContrast"
  | "highContrastDark";

export type PaletteSlot =
  | "palette-a"
  | "palette-b"
  | "palette-c"
  | "palette-a-mid"
  | "palette-a-subtle"
  | "neutral"
  | "status-danger"
  | "status-warning"
  | "status-success"
  | "status-info";

export type PalettePrimitiveSlot = Exclude<PaletteSlot, "neutral">;

export type StatusSlot =
  | "status-danger"
  | "status-warning"
  | "status-success"
  | "status-info";

export type StatusName = "danger" | "warning" | "success" | "info";

export type PrimitiveTokenName = `${PaletteSlot}-${RampTone}-${Step}`;

export type SurfaceSemanticTokenName =
  | "surface-base"
  | "surface-raised"
  | "surface-overlay"
  | "surface-tinted";

export type TextSemanticTokenName =
  | "text-primary"
  | "text-secondary"
  | "text-disabled";

export type InteractiveSemanticTokenName =
  | "interactive-bg-rest"
  | "interactive-bg-hover"
  | "interactive-bg-active"
  | "interactive-bg-disabled"
  | "interactive-text"
  | "interactive-border";

export type FocusSemanticTokenName = "focus-ring";

export type BorderSemanticTokenName = "border-strong" | "border-subtle";

export type StatusSemanticTokenName =
  `${StatusSlot extends `status-${infer Name}` ? `status-${Name}` : never}-${
    | "bg"
    | "text"
    | "container"
    | "on-container"
    | "border"}`;

export type SemanticTokenName =
  | SurfaceSemanticTokenName
  | TextSemanticTokenName
  | InteractiveSemanticTokenName
  | FocusSemanticTokenName
  | BorderSemanticTokenName
  | StatusSemanticTokenName;

export type WarningCode =
  | "SEED_LIGHTNESS_CLAMPED"
  | "SEED_LIGHTNESS_EDGE"
  | "GAMUT_MAPPED"
  | "STATUS_CONTRAST_LIMIT"
  | "HC_DIFFERENTIATION_LIMIT";

export type ValidationErrorCode =
  | "INVALID_SEED_FORMAT"
  | "ACHROMATIC_SEED"
  | "INVALID_HARMONY"
  | "INVALID_TAPER_CONFIG"
  | "INVALID_OVERRIDE_REFERENCE";

export type AssertionStatus = "pass" | "fail" | "warning";

export type AssertionFailureType = "CONTRAST" | "POLARITY_ERROR";

export type AssertionPolarity = "CORRECT" | "WRONG";

export type AssertionSource = "reference" | "override";

export type OklchCssString = `oklch(${string})`;

export type DisplayP3CssString = `color(display-p3 ${string})`;

export interface OklchValue {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

export type OklchColor = OklchValue;

export interface SrgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface DisplayP3Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface TaperConfig {
  readonly lightUpperFadeStart: number;
  readonly lightUpperFadeEnd: number;
  readonly lightLowerFadeStart: number;
  readonly lightLowerFadeEnd: number;
  readonly darkUpperFadeStart: number;
  readonly darkUpperFadeEnd: number;
  readonly darkLowerFadeStart: number;
  readonly darkLowerFadeEnd: number;
}

export interface StatusHueAnchors {
  readonly danger: number;
  readonly warning: number;
  readonly success: number;
  readonly info: number;
}

export type SemanticMappingOverrides = Partial<
  Record<SemanticTokenName, PrimitiveTokenName>
>;

export interface EngineOverrides {
  readonly statusHues?: Partial<StatusHueAnchors>;
  readonly darkHueShift?: Partial<Record<PaletteSlot, number>>;
  readonly taperParams?: Partial<TaperConfig>;
  readonly semanticMapping?: SemanticMappingOverrides;
}

export interface EngineInput {
  readonly seed: string;
  readonly harmony: HarmonyStrategy;
  readonly mood?: Mood;
  readonly namespace?: string;
  readonly overrides?: EngineOverrides;
}

export type ColorEngineInput = EngineInput;

export interface PrimitiveColorToken {
  readonly name: PrimitiveTokenName;
  readonly slot: PaletteSlot;
  readonly tone: RampTone;
  readonly step: Step;
  readonly oklch: OklchValue;
  readonly srgb: OklchCssString;
  readonly p3: DisplayP3CssString;
}

export interface SemanticTokenMapping {
  readonly name: SemanticTokenName;
  readonly primitive: PrimitiveTokenName;
}

export interface AssertionResult {
  readonly tokenA: SemanticTokenName;
  readonly tokenB: SemanticTokenName;
  readonly requiredLc: number;
  readonly actualLc: number;
  readonly polarity: AssertionPolarity;
  readonly status: AssertionStatus;
  readonly failureType?: AssertionFailureType;
  readonly source: AssertionSource;
}

export interface EngineWarningData {
  readonly [key: string]: unknown;
}

export interface GamutMappedWarningData extends EngineWarningData {
  readonly count: number;
  readonly minCReduction: number;
  readonly maxCReduction: number;
}

export interface EngineWarning {
  readonly code: WarningCode;
  readonly message: string;
  readonly affectedTokens?: readonly PrimitiveTokenName[];
  readonly data?: EngineWarningData;
}

export interface ValidationError extends Error {
  readonly code: ValidationErrorCode;
  readonly field: string;
  readonly value: unknown;
}

export interface EngineMetadata {
  readonly inputSeed: string;
  readonly normalizedSeed: OklchValue;
  readonly adjustedSeed: OklchValue;
  readonly seedAdjusted: boolean;
  readonly harmonyHues: readonly number[];
  readonly gamutMappedCount: number;
}

export interface EngineOutput {
  readonly primitives: {
    readonly srgb: Partial<Record<PrimitiveTokenName, OklchCssString>>;
    readonly p3: Partial<Record<PrimitiveTokenName, DisplayP3CssString>>;
  };
  readonly semantic: Record<
    SemanticThemeKey,
    Record<SemanticTokenName, `var(--${string})`>
  >;
  readonly assertions: readonly AssertionResult[];
  readonly warnings: readonly EngineWarning[];
  readonly metadata: EngineMetadata;
}

export type CreateColorEngineTheme = (input: EngineInput) => EngineOutput;
