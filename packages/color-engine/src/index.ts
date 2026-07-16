import {
  CONTRAST_ASSERTION_THRESHOLDS,
  createContrastAssertionReport,
} from "./assertions.js";
import type { ContrastAssertionReport as ContrastAssertionReportType } from "./assertions.js";
import { calculateApcaLcFromOklch } from "./apca.js";

export {
  CONTRAST_ASSERTION_THRESHOLDS,
  createContrastAssertionReport,
} from "./assertions.js";
export type {
  ContrastAssertionPair,
  ContrastAssertionReport,
  ContrastAssertionRole,
  ContrastAssertionSemanticName,
  ContrastAssertionSeverity,
  ContrastAssertionSummary,
  ResolvedContrastAssertion,
} from "./assertions.js";
export {
  APCA_ALGORITHM_VERSION,
  APCA_CONSTANTS,
  calculateApcaLc,
  calculateApcaLcFromOklch,
  calculateApcaLcFromY,
  srgbToApcaY,
} from "./apca.js";
export type { ApcaConstants, SrgbColor } from "./apca.js";

export type ColorSeed = `#${string}` | `oklch(${string})`;

export type ColorEngineThemePresetName =
  | "evergreen"
  | "civic-blue"
  | "plum"
  | "teal";

export type SurfacePresetName =
  | "quiet"
  | "standard"
  | "layered"
  | "high-separation";

export type SurfaceGenerationTheme = "light" | "dark";

export type SurfaceTheme =
  | SurfaceGenerationTheme
  | "high-contrast"
  | "high-contrast-dark";

export type ColorEngineCssFileName =
  | "primitives.css"
  | "theme-light.css"
  | "theme-dark.css"
  | "theme-high-contrast.css"
  | "theme-high-contrast-dark.css";

export type ColorEngineCssFileKind = "primitives" | "theme";

export type SurfaceLevel = 1 | 2 | 3 | 4;

export type SurfaceState = "hover" | "selected" | "pressed";

export type ChromeLevel = "subtle" | "default" | "strong";

export type TextLevel = "strong" | "primary" | "secondary" | "muted" | "disabled";

export type SeedPolicy = "balanced" | "anchored";

export type TextTreatmentStrategyName = "same-hue" | "neutral" | "adaptive";

export type CustomColorRoleSemanticPart =
  | "soft-bg"
  | "soft-bg-hover"
  | "soft-border"
  | "soft-text"
  | "solid-bg"
  | "solid-bg-hover"
  | "solid-bg-pressed"
  | "solid-text";

export type CustomColorRoleCssAliasName =
  `role-${string}-${CustomColorRoleSemanticPart}`;

export type CustomColorRoleCssVariableName =
  `--${string}-role-${string}-${CustomColorRoleSemanticPart}`;

export type CustomColorRoleUsageFamilyName =
  `role-${string}-${"light" | "dark"}-${"soft" | "solid"}`;

export type CustomColorRoleSemanticTokenName = CustomColorRoleCssAliasName;

export type PrimaryUsageFamilyName =
  | "primary-light-soft"
  | "primary-light-solid"
  | "primary-dark-soft"
  | "primary-dark-solid";

export type StatusIntent = "danger" | "warning" | "success" | "info";

export type StatusUsageFamilyName =
  `${StatusIntent}-${"light" | "dark"}-${"soft" | "solid"}`;

type SolidContrastProfile = "ui" | "status";

export type SeedPrimitiveFamilyName =
  | "primary-seed"
  | `${StatusIntent}-seed`;

export type UsageFamilyName = PrimaryUsageFamilyName | StatusUsageFamilyName;
export type CustomUsageFamilyName = UsageFamilyName | CustomColorRoleUsageFamilyName;

export type TextPrimitiveFamilyName = "text-dark" | "text-light";

export type HighContrastPrimitiveFamilyName = "hc-light" | "hc-dark";

export type PrimitiveFamilyName =
  | "neutral-light"
  | "neutral-dark"
  | TextPrimitiveFamilyName
  | HighContrastPrimitiveFamilyName
  | "surface-light"
  | "surface-dark"
  | "chrome-light"
  | "chrome-dark"
  | CustomUsageFamilyName
  | SeedPrimitiveFamilyName;

export type NeutralSemanticTokenName =
  | "text-primary"
  | "text-secondary"
  | "text-muted"
  | "border-subtle"
  | "border-default"
  | "border-strong"
  | "control-border"
  | "control-bg"
  | "control-bg-hover"
  | "control-text";

export type SurfaceSemanticTokenName =
  | `surface-${SurfaceLevel}`
  | `surface-${SurfaceLevel}-${SurfaceState}`;

export type PrimarySemanticTokenName =
  | "primary-action-bg"
  | "primary-action-bg-hover"
  | "primary-action-bg-pressed"
  | "primary-action-text"
  | "primary-link"
  | "primary-link-hover"
  | "primary-focus-ring"
  | "primary-soft-bg"
  | "primary-soft-bg-hover"
  | "primary-soft-border"
  | "primary-soft-text";

export type StatusSemanticTokenName =
  | `${StatusIntent}-soft-bg`
  | `${StatusIntent}-soft-bg-hover`
  | `${StatusIntent}-soft-border`
  | `${StatusIntent}-soft-text`
  | `${StatusIntent}-solid-bg`
  | `${StatusIntent}-solid-bg-hover`
  | `${StatusIntent}-solid-bg-pressed`
  | `${StatusIntent}-solid-text`;

export type SemanticTokenName =
  | NeutralSemanticTokenName
  | SurfaceSemanticTokenName
  | PrimarySemanticTokenName
  | StatusSemanticTokenName;

export type ColorEngineThemeSemantics = Readonly<
  Record<SemanticTokenName, `var(--${string})`> &
  Partial<Record<CustomColorRoleSemanticTokenName, `var(--${string})`>>
>;

export interface OklchValue {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

export interface SurfacePreset {
  readonly name: SurfacePresetName;
  readonly label: string;
  readonly description: string;
  readonly lightStepDelta: number;
  readonly darkStepDelta: number;
  readonly lightStateDelta: number;
  readonly darkStateDelta: number;
  readonly chromaScale: number;
}

export interface TextTreatmentStrategy {
  readonly name: TextTreatmentStrategyName;
  readonly label: string;
  readonly description: string;
}

export interface CustomColorRoleInput {
  readonly seed: ColorSeed | string;
  readonly darkSeed?: ColorSeed | string;
  readonly seedPolicy?: SeedPolicy;
}

export interface ResolvedCustomColorRoleInput {
  readonly seed: ColorSeed | string;
  readonly darkSeed: ColorSeed | string;
  readonly seedPolicy: SeedPolicy;
}

export interface ResolvedCustomColorRole {
  readonly id: string;
  readonly seed: OklchValue;
  readonly darkSeed: OklchValue;
  readonly seedPolicy: SeedPolicy;
  readonly cssAliases: Readonly<Record<CustomColorRoleSemanticPart, CustomColorRoleCssAliasName>>;
  readonly cssVariables: Readonly<Record<CustomColorRoleSemanticPart, CustomColorRoleCssVariableName>>;
}

export interface ColorEngineInput {
  readonly neutralSeed?: ColorSeed | string;
  readonly surfaceLightSeed?: ColorSeed | string;
  readonly surfaceDarkSeed?: ColorSeed | string;
  readonly primarySeed?: ColorSeed | string;
  readonly primaryDarkSeed?: ColorSeed | string;
  readonly primarySeedPolicy?: SeedPolicy;
  readonly dangerSeed?: ColorSeed | string;
  readonly dangerDarkSeed?: ColorSeed | string;
  readonly dangerSeedPolicy?: SeedPolicy;
  readonly warningSeed?: ColorSeed | string;
  readonly warningDarkSeed?: ColorSeed | string;
  readonly warningSeedPolicy?: SeedPolicy;
  readonly successSeed?: ColorSeed | string;
  readonly successDarkSeed?: ColorSeed | string;
  readonly successSeedPolicy?: SeedPolicy;
  readonly infoSeed?: ColorSeed | string;
  readonly infoDarkSeed?: ColorSeed | string;
  readonly infoSeedPolicy?: SeedPolicy;
  readonly textTreatment?: TextTreatmentStrategyName;
  readonly preset?: SurfacePresetName;
  readonly lightSurfacePreset?: SurfacePresetName;
  readonly darkSurfacePreset?: SurfacePresetName;
  readonly namespace?: string;
  readonly customRoles?: Readonly<Record<string, CustomColorRoleInput>>;
}

export type ResolvedColorEngineInput = Readonly<
  Required<Omit<ColorEngineInput, "namespace" | "customRoles">> & {
    readonly namespace: string;
    readonly customRoles: Readonly<Record<string, ResolvedCustomColorRoleInput>>;
  }
>;

export type ColorEngineThemePresetInput = Readonly<Required<Omit<ColorEngineInput, "namespace" | "customRoles">>>;

export interface ColorEngineThemePreset {
  readonly name: ColorEngineThemePresetName;
  readonly label: string;
  readonly description: string;
  readonly input: ColorEngineThemePresetInput;
}

export interface ColorToken {
  readonly name: string;
  readonly value: `oklch(${string})`;
  readonly oklch: OklchValue;
  readonly description: string;
}

export interface ContrastForegroundResolution {
  readonly token: ColorToken;
  readonly minimumLc: number;
  readonly totalLc: number;
  readonly passed: boolean;
  readonly candidateIndex: number;
}

export interface ResolveContrastForegroundOptions {
  readonly backgrounds: readonly ColorToken[];
  readonly candidates: readonly ColorToken[];
  readonly threshold: number;
}

/**
 * Selects the first caller-ordered foreground candidate that meets the APCA
 * threshold across every background. Candidates should be ordered from the
 * quietest acceptable treatment to the strongest. When none pass, the
 * strongest available minimum contrast is returned with `passed: false`.
 */
export function resolveContrastForeground(
  options: ResolveContrastForegroundOptions,
): ContrastForegroundResolution {
  if (options.backgrounds.length === 0) {
    throw new RangeError("Contrast foreground resolution requires at least one background token.");
  }

  if (options.candidates.length === 0) {
    throw new RangeError("Contrast foreground resolution requires at least one candidate token.");
  }

  if (!Number.isFinite(options.threshold) || options.threshold < 0) {
    throw new RangeError("Contrast foreground threshold must be a finite non-negative number.");
  }

  const scores = options.candidates.map((token, candidateIndex) => {
    const contrasts = options.backgrounds.map((background) =>
      Math.abs(calculateApcaLcFromOklch(token.oklch, background.oklch)),
    );

    return {
      token,
      minimumLc: Math.min(...contrasts),
      totalLc: contrasts.reduce((total, contrast) => total + contrast, 0),
      passed: contrasts.every((contrast) => contrast >= options.threshold),
      candidateIndex,
    } satisfies ContrastForegroundResolution;
  });
  const firstPassing = scores.find((score) => score.passed);

  if (firstPassing) {
    return firstPassing;
  }

  return [...scores].sort((left, right) =>
    (right.minimumLc - left.minimumLc)
    || (right.totalLc - left.totalLc)
    || (left.candidateIndex - right.candidateIndex)
  )[0]!;
}

export interface BuiltInPrimitiveSurfaceOutput {
  readonly "neutral-light": readonly ColorToken[];
  readonly "neutral-dark": readonly ColorToken[];
  readonly "text-dark": readonly ColorToken[];
  readonly "text-light": readonly ColorToken[];
  readonly "hc-light": readonly ColorToken[];
  readonly "hc-dark": readonly ColorToken[];
  readonly "surface-light": readonly ColorToken[];
  readonly "surface-dark": readonly ColorToken[];
  readonly "chrome-light": readonly ColorToken[];
  readonly "chrome-dark": readonly ColorToken[];
  readonly "primary-seed": readonly ColorToken[];
  readonly "primary-light-soft": readonly ColorToken[];
  readonly "primary-light-solid": readonly ColorToken[];
  readonly "primary-dark-soft": readonly ColorToken[];
  readonly "primary-dark-solid": readonly ColorToken[];
  readonly "danger-seed": readonly ColorToken[];
  readonly "danger-light-soft": readonly ColorToken[];
  readonly "danger-light-solid": readonly ColorToken[];
  readonly "danger-dark-soft": readonly ColorToken[];
  readonly "danger-dark-solid": readonly ColorToken[];
  readonly "warning-seed": readonly ColorToken[];
  readonly "warning-light-soft": readonly ColorToken[];
  readonly "warning-light-solid": readonly ColorToken[];
  readonly "warning-dark-soft": readonly ColorToken[];
  readonly "warning-dark-solid": readonly ColorToken[];
  readonly "success-seed": readonly ColorToken[];
  readonly "success-light-soft": readonly ColorToken[];
  readonly "success-light-solid": readonly ColorToken[];
  readonly "success-dark-soft": readonly ColorToken[];
  readonly "success-dark-solid": readonly ColorToken[];
  readonly "info-seed": readonly ColorToken[];
  readonly "info-light-soft": readonly ColorToken[];
  readonly "info-light-solid": readonly ColorToken[];
  readonly "info-dark-soft": readonly ColorToken[];
  readonly "info-dark-solid": readonly ColorToken[];
}

export type CustomColorRolePrimitiveOutput =
  Readonly<Partial<Record<CustomColorRoleUsageFamilyName, readonly ColorToken[]>>>;

export type PrimitiveSurfaceOutput = BuiltInPrimitiveSurfaceOutput & CustomColorRolePrimitiveOutput;

export interface ColorEngineOutput {
  readonly namespace: string;
  readonly preset: SurfacePreset;
  readonly surfacePresets: Readonly<Record<SurfaceGenerationTheme, SurfacePreset>>;
  readonly input: ResolvedColorEngineInput;
  readonly customRoles: Readonly<Record<string, ResolvedCustomColorRole>>;
  readonly seeds: {
    readonly neutral: OklchValue;
    readonly surfaceLight: OklchValue;
    readonly surfaceDark: OklchValue;
    readonly primary: OklchValue;
    readonly primaryDark: OklchValue;
    readonly status: Readonly<Record<StatusIntent, OklchValue>>;
    readonly statusDark: Readonly<Record<StatusIntent, OklchValue>>;
  };
  readonly seedPolicies: {
    readonly primary: SeedPolicy;
    readonly status: Readonly<Record<StatusIntent, SeedPolicy>>;
  };
  readonly textTreatment: TextTreatmentStrategy;
  readonly primitives: PrimitiveSurfaceOutput;
  readonly semantics: Readonly<Record<SurfaceTheme, ColorEngineThemeSemantics>>;
  readonly assertions: ContrastAssertionReportType;
  readonly cssOutput: ColorEngineCssOutput;
  readonly css: string;
}

export interface ColorEngineCssOutput {
  readonly primitives: string;
  readonly themes: Readonly<Record<SurfaceTheme, string>>;
  readonly files: readonly ColorEngineCssFile[];
  readonly all: string;
}

export interface ColorEngineCssFile {
  readonly fileName: ColorEngineCssFileName;
  readonly kind: ColorEngineCssFileKind;
  readonly theme?: SurfaceTheme;
  readonly css: string;
}

export type ColorEngineCssArtifactHash = `fnv1a32-${string}`;

export interface ColorEngineCssArtifact extends ColorEngineCssFile {
  readonly byteLength: number;
  readonly contentHash: ColorEngineCssArtifactHash;
}

export type ValidationErrorCode =
  | "INVALID_SEED"
  | "INVALID_SEED_POLICY"
  | "INVALID_TEXT_TREATMENT"
  | "INVALID_PRESET"
  | "INVALID_NAMESPACE"
  | "INVALID_CUSTOM_ROLE_ID"
  | "RESERVED_CUSTOM_ROLE_ID"
  | "INVALID_CUSTOM_ROLE";

export class ColorEngineValidationError extends Error {
  readonly code: ValidationErrorCode;
  readonly field: string;
  readonly value: unknown;

  constructor(options: {
    readonly code: ValidationErrorCode;
    readonly field: string;
    readonly value: unknown;
    readonly message: string;
  }) {
    super(options.message);
    this.name = "ColorEngineValidationError";
    this.code = options.code;
    this.field = options.field;
    this.value = options.value;
  }
}

export const SURFACE_PRESETS = {
  quiet: {
    name: "quiet",
    label: "Quiet",
    description: "Minimal separation for dense screens where surfaces should recede.",
    lightStepDelta: 0.006,
    darkStepDelta: 0.011,
    lightStateDelta: 0.008,
    darkStateDelta: 0.012,
    chromaScale: 0.65,
  },
  standard: {
    name: "standard",
    label: "Standard",
    description: "Balanced separation for everyday product UI.",
    lightStepDelta: 0.01,
    darkStepDelta: 0.017,
    lightStateDelta: 0.012,
    darkStateDelta: 0.018,
    chromaScale: 0.78,
  },
  layered: {
    name: "layered",
    label: "Layered",
    description: "Clearer hierarchy for nested panels and grouped controls.",
    lightStepDelta: 0.014,
    darkStepDelta: 0.024,
    lightStateDelta: 0.016,
    darkStateDelta: 0.024,
    chromaScale: 0.82,
  },
  "high-separation": {
    name: "high-separation",
    label: "High Separation",
    description: "Strong separation for reviewing hierarchy and edge cases.",
    lightStepDelta: 0.019,
    darkStepDelta: 0.033,
    lightStateDelta: 0.022,
    darkStateDelta: 0.032,
    chromaScale: 0.74,
  },
} as const satisfies Readonly<Record<SurfacePresetName, SurfacePreset>>;

export const SURFACE_PRESET_NAMES = Object.keys(SURFACE_PRESETS) as readonly SurfacePresetName[];

export const COLOR_ENGINE_CSS_LOAD_ORDER = [
  "primitives.css",
  "theme-light.css",
  "theme-dark.css",
  "theme-high-contrast.css",
  "theme-high-contrast-dark.css",
] as const satisfies readonly ColorEngineCssFileName[];

export const COLOR_ENGINE_THEME_NAMES = [
  "light",
  "dark",
  "high-contrast",
  "high-contrast-dark",
] as const satisfies readonly SurfaceTheme[];

export const SURFACE_LEVELS = [1, 2, 3, 4] as const satisfies readonly SurfaceLevel[];

export const SURFACE_STATES = ["hover", "selected", "pressed"] as const satisfies readonly SurfaceState[];

export const CHROME_LEVELS = ["subtle", "default", "strong"] as const satisfies readonly ChromeLevel[];

export const TEXT_LEVELS = ["strong", "primary", "secondary", "muted", "disabled"] as const satisfies readonly TextLevel[];

export const STATUS_INTENTS = ["danger", "warning", "success", "info"] as const satisfies readonly StatusIntent[];

export const SEED_POLICY_NAMES = ["balanced", "anchored"] as const satisfies readonly SeedPolicy[];

export const CUSTOM_COLOR_ROLE_SEMANTIC_PARTS = [
  "soft-bg",
  "soft-bg-hover",
  "soft-border",
  "soft-text",
  "solid-bg",
  "solid-bg-hover",
  "solid-bg-pressed",
  "solid-text",
] as const satisfies readonly CustomColorRoleSemanticPart[];

export const RESERVED_CUSTOM_COLOR_ROLE_IDS = [
  "primary",
  "danger",
  "warning",
  "success",
  "info",
  "surface",
  "text",
  "chrome",
  "border",
] as const;

export const CUSTOM_COLOR_ROLE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const TEXT_TREATMENT_STRATEGIES = {
  "same-hue": {
    name: "same-hue",
    label: "Same Hue",
    description: "Use same-hue solid-family text on soft colored surfaces.",
  },
  neutral: {
    name: "neutral",
    label: "Neutral",
    description: "Use neutral text on soft colored surfaces.",
  },
  adaptive: {
    name: "adaptive",
    label: "Adaptive",
    description: "Choose from same-hue and neutral text candidates by APCA coverage.",
  },
} as const satisfies Readonly<Record<TextTreatmentStrategyName, TextTreatmentStrategy>>;

export const TEXT_TREATMENT_STRATEGY_NAMES = Object.keys(
  TEXT_TREATMENT_STRATEGIES,
) as readonly TextTreatmentStrategyName[];

export const NEUTRAL_SEMANTIC_TOKEN_NAMES = [
  "text-primary",
  "text-secondary",
  "text-muted",
  "border-subtle",
  "border-default",
  "border-strong",
  "control-border",
  "control-bg",
  "control-bg-hover",
  "control-text",
] as const satisfies readonly NeutralSemanticTokenName[];

export const SURFACE_SEMANTIC_TOKEN_NAMES = [
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
] as const satisfies readonly SurfaceSemanticTokenName[];

export const PRIMARY_SEMANTIC_TOKEN_NAMES = [
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

export const STATUS_SEMANTIC_TOKEN_NAMES = [
  "danger-soft-bg",
  "danger-soft-bg-hover",
  "danger-soft-border",
  "danger-soft-text",
  "danger-solid-bg",
  "danger-solid-bg-hover",
  "danger-solid-bg-pressed",
  "danger-solid-text",
  "warning-soft-bg",
  "warning-soft-bg-hover",
  "warning-soft-border",
  "warning-soft-text",
  "warning-solid-bg",
  "warning-solid-bg-hover",
  "warning-solid-bg-pressed",
  "warning-solid-text",
  "success-soft-bg",
  "success-soft-bg-hover",
  "success-soft-border",
  "success-soft-text",
  "success-solid-bg",
  "success-solid-bg-hover",
  "success-solid-bg-pressed",
  "success-solid-text",
  "info-soft-bg",
  "info-soft-bg-hover",
  "info-soft-border",
  "info-soft-text",
  "info-solid-bg",
  "info-solid-bg-hover",
  "info-solid-bg-pressed",
  "info-solid-text",
] as const satisfies readonly StatusSemanticTokenName[];

export const SEMANTIC_TOKEN_NAMES = [
  ...NEUTRAL_SEMANTIC_TOKEN_NAMES,
  ...SURFACE_SEMANTIC_TOKEN_NAMES,
  ...PRIMARY_SEMANTIC_TOKEN_NAMES,
  ...STATUS_SEMANTIC_TOKEN_NAMES,
] as const satisfies readonly SemanticTokenName[];

export const COLOR_ENGINE_THEME_PRESETS = {
  evergreen: {
    name: "evergreen",
    label: "Evergreen",
    description: "Balanced green action color with cool product surfaces and familiar status colors.",
    input: {
      neutralSeed: "oklch(0.86 0.012 255)",
      surfaceLightSeed: "oklch(0.94 0.01 255)",
      surfaceDarkSeed: "oklch(0.12 0.012 255)",
      primarySeed: "oklch(0.47 0.12 150)",
      primaryDarkSeed: "oklch(0.64 0.11 150)",
      primarySeedPolicy: "balanced",
      dangerSeed: "oklch(0.54 0.18 28)",
      dangerDarkSeed: "oklch(0.68 0.12 28)",
      dangerSeedPolicy: "balanced",
      warningSeed: "oklch(0.78 0.16 88)",
      warningDarkSeed: "oklch(0.75 0.13 88)",
      warningSeedPolicy: "balanced",
      successSeed: "oklch(0.52 0.15 150)",
      successDarkSeed: "oklch(0.68 0.11 150)",
      successSeedPolicy: "balanced",
      infoSeed: "oklch(0.48 0.13 235)",
      infoDarkSeed: "oklch(0.68 0.11 235)",
      infoSeedPolicy: "balanced",
      textTreatment: "same-hue",
      preset: "standard",
      lightSurfacePreset: "standard",
      darkSurfacePreset: "layered",
    },
  },
  "civic-blue": {
    name: "civic-blue",
    label: "Civic Blue",
    description: "Blue action color with cooler status choices for administrative or SaaS tools.",
    input: {
      neutralSeed: "oklch(0.85 0.012 250)",
      surfaceLightSeed: "oklch(0.945 0.012 250)",
      surfaceDarkSeed: "oklch(0.13 0.016 250)",
      primarySeed: "oklch(0.47 0.14 250)",
      primaryDarkSeed: "oklch(0.66 0.12 250)",
      primarySeedPolicy: "balanced",
      dangerSeed: "oklch(0.52 0.16 18)",
      dangerDarkSeed: "oklch(0.68 0.11 18)",
      dangerSeedPolicy: "balanced",
      warningSeed: "oklch(0.72 0.18 68)",
      warningDarkSeed: "oklch(0.74 0.14 68)",
      warningSeedPolicy: "balanced",
      successSeed: "oklch(0.5 0.13 165)",
      successDarkSeed: "oklch(0.67 0.1 165)",
      successSeedPolicy: "balanced",
      infoSeed: "oklch(0.5 0.15 250)",
      infoDarkSeed: "oklch(0.68 0.12 250)",
      infoSeedPolicy: "balanced",
      textTreatment: "same-hue",
      preset: "standard",
      lightSurfacePreset: "standard",
      darkSurfacePreset: "layered",
    },
  },
  plum: {
    name: "plum",
    label: "Plum",
    description: "Purple action color with berry and violet status accents for denser product screens.",
    input: {
      neutralSeed: "oklch(0.85 0.014 290)",
      surfaceLightSeed: "oklch(0.945 0.012 290)",
      surfaceDarkSeed: "oklch(0.13 0.016 290)",
      primarySeed: "oklch(0.48 0.14 305)",
      primaryDarkSeed: "oklch(0.66 0.12 305)",
      primarySeedPolicy: "balanced",
      dangerSeed: "oklch(0.5 0.17 355)",
      dangerDarkSeed: "oklch(0.68 0.12 355)",
      dangerSeedPolicy: "balanced",
      warningSeed: "oklch(0.73 0.16 56)",
      warningDarkSeed: "oklch(0.73 0.13 56)",
      warningSeedPolicy: "balanced",
      successSeed: "oklch(0.49 0.12 170)",
      successDarkSeed: "oklch(0.66 0.1 170)",
      successSeedPolicy: "balanced",
      infoSeed: "oklch(0.54 0.12 275)",
      infoDarkSeed: "oklch(0.7 0.1 275)",
      infoSeedPolicy: "balanced",
      textTreatment: "same-hue",
      preset: "layered",
      lightSurfacePreset: "standard",
      darkSurfacePreset: "high-separation",
    },
  },
  teal: {
    name: "teal",
    label: "Teal",
    description: "Quiet teal theme with coral, ochre, mint, and cyan status variation.",
    input: {
      neutralSeed: "oklch(0.86 0.012 205)",
      surfaceLightSeed: "oklch(0.945 0.012 205)",
      surfaceDarkSeed: "oklch(0.12 0.014 205)",
      primarySeed: "oklch(0.48 0.11 190)",
      primaryDarkSeed: "oklch(0.66 0.1 190)",
      primarySeedPolicy: "balanced",
      dangerSeed: "oklch(0.56 0.16 35)",
      dangerDarkSeed: "oklch(0.69 0.11 35)",
      dangerSeedPolicy: "balanced",
      warningSeed: "oklch(0.81 0.13 102)",
      warningDarkSeed: "oklch(0.77 0.11 102)",
      warningSeedPolicy: "balanced",
      successSeed: "oklch(0.5 0.13 155)",
      successDarkSeed: "oklch(0.67 0.1 155)",
      successSeedPolicy: "balanced",
      infoSeed: "oklch(0.56 0.12 215)",
      infoDarkSeed: "oklch(0.7 0.1 215)",
      infoSeedPolicy: "balanced",
      textTreatment: "same-hue",
      preset: "quiet",
      lightSurfacePreset: "quiet",
      darkSurfacePreset: "layered",
    },
  },
} as const satisfies Readonly<Record<ColorEngineThemePresetName, ColorEngineThemePreset>>;

export const COLOR_ENGINE_THEME_PRESET_NAMES = Object.keys(
  COLOR_ENGINE_THEME_PRESETS,
) as readonly ColorEngineThemePresetName[];

const DEFAULT_INPUT = {
  neutralSeed: "oklch(0.86 0.012 255)",
  surfaceLightSeed: "oklch(0.94 0.01 255)",
  surfaceDarkSeed: "oklch(0.12 0.012 255)",
  primarySeed: "#0f6f3d",
  primaryDarkSeed: "#0f6f3d",
  primarySeedPolicy: "balanced",
  dangerSeed: "#c62828",
  dangerDarkSeed: "#c62828",
  dangerSeedPolicy: "balanced",
  warningSeed: "#e3bb1d",
  warningDarkSeed: "#e3bb1d",
  warningSeedPolicy: "balanced",
  successSeed: "#16823a",
  successDarkSeed: "#16823a",
  successSeedPolicy: "balanced",
  infoSeed: "#0b6ea8",
  infoDarkSeed: "#0b6ea8",
  infoSeedPolicy: "balanced",
  textTreatment: "same-hue",
  preset: "standard",
  lightSurfacePreset: "standard",
  darkSurfacePreset: "standard",
  namespace: "ds",
} as const satisfies Required<Omit<ColorEngineInput, "customRoles">>;

export function createColorEngineTheme(input: ColorEngineInput = {}): ColorEngineOutput {
  const resolvedInput = resolveInput(input);
  const preset = SURFACE_PRESETS[resolvedInput.preset];
  const surfacePresets = {
    light: SURFACE_PRESETS[resolvedInput.lightSurfacePreset],
    dark: SURFACE_PRESETS[resolvedInput.darkSurfacePreset],
  } as const satisfies Readonly<Record<SurfaceGenerationTheme, SurfacePreset>>;
  const neutralSeed = parseColorSeed(resolvedInput.neutralSeed, "neutralSeed");
  const surfaceLightSeed = parseColorSeed(resolvedInput.surfaceLightSeed, "surfaceLightSeed");
  const surfaceDarkSeed = parseColorSeed(resolvedInput.surfaceDarkSeed, "surfaceDarkSeed");
  const primarySeed = parseColorSeed(resolvedInput.primarySeed, "primarySeed");
  const primaryDarkSeed = parseColorSeed(resolvedInput.primaryDarkSeed, "primaryDarkSeed");
  const statusSeeds = {
    danger: parseColorSeed(resolvedInput.dangerSeed, "dangerSeed"),
    warning: parseColorSeed(resolvedInput.warningSeed, "warningSeed"),
    success: parseColorSeed(resolvedInput.successSeed, "successSeed"),
    info: parseColorSeed(resolvedInput.infoSeed, "infoSeed"),
  } as const satisfies Readonly<Record<StatusIntent, OklchValue>>;
  const statusDarkSeeds = {
    danger: parseColorSeed(resolvedInput.dangerDarkSeed, "dangerDarkSeed"),
    warning: parseColorSeed(resolvedInput.warningDarkSeed, "warningDarkSeed"),
    success: parseColorSeed(resolvedInput.successDarkSeed, "successDarkSeed"),
    info: parseColorSeed(resolvedInput.infoDarkSeed, "infoDarkSeed"),
  } as const satisfies Readonly<Record<StatusIntent, OklchValue>>;
  const customRoles = resolveCustomColorRoleMetadata(
    resolvedInput.customRoles,
    resolvedInput.namespace,
  );
  const seedPolicies = {
    primary: resolvedInput.primarySeedPolicy,
    status: {
      danger: resolvedInput.dangerSeedPolicy,
      warning: resolvedInput.warningSeedPolicy,
      success: resolvedInput.successSeedPolicy,
      info: resolvedInput.infoSeedPolicy,
    },
  } as const satisfies ColorEngineOutput["seedPolicies"];
  const neutralLight = createLevelRamp({
    family: "neutral-light",
    seed: toneSeed(surfaceLightSeed, neutralSeed, 0.75),
    delta: surfacePresets.light.lightStepDelta,
    direction: 1,
    maxLightness: 0.995,
    chromaScale: surfacePresets.light.chromaScale * 0.75,
  });
  const neutralDark = createLevelRamp({
    family: "neutral-dark",
    seed: toneSeed(surfaceDarkSeed, neutralSeed, 0.8),
    delta: surfacePresets.dark.darkStepDelta,
    direction: 1,
    maxLightness: 0.28,
    chromaScale: surfacePresets.dark.chromaScale * 0.8,
  });
  const textDark = createTextRamp({
    family: "text-dark",
    seed: neutralSeed,
  });
  const textLight = createTextRamp({
    family: "text-light",
    seed: neutralSeed,
  });
  const highContrast = createHighContrastPrimitiveFamilies();
  const surfaceLight = createLevelRamp({
    family: "surface-light",
    seed: surfaceLightSeed,
    delta: surfacePresets.light.lightStepDelta,
    direction: 1,
    maxLightness: 0.998,
    chromaScale: surfacePresets.light.chromaScale,
  });
  const surfaceDark = createLevelRamp({
    family: "surface-dark",
    seed: surfaceDarkSeed,
    delta: surfacePresets.dark.darkStepDelta,
    direction: 1,
    maxLightness: 0.32,
    chromaScale: surfacePresets.dark.chromaScale,
  });
  const chromeLight = createChromeRamp({
    family: "chrome-light",
    surfaceSeed: surfaceLightSeed,
    neutralSeed,
    theme: "light",
    preset: surfacePresets.light,
  });
  const chromeDark = createChromeRamp({
    family: "chrome-dark",
    surfaceSeed: surfaceDarkSeed,
    neutralSeed,
    theme: "dark",
    preset: surfacePresets.dark,
  });
  const primary = createPrimaryUsageFamilies({
    lightSeed: primarySeed,
    darkSeed: primaryDarkSeed,
    policy: seedPolicies.primary,
  });
  const status = createStatusUsageFamilies({
    lightSeeds: statusSeeds,
    darkSeeds: statusDarkSeeds,
    policies: seedPolicies.status,
  });
  const customRolePrimitives = createCustomColorRoleUsageFamilies(customRoles);
  const primitives: PrimitiveSurfaceOutput = {
    "neutral-light": neutralLight,
    "neutral-dark": neutralDark,
    "text-dark": textDark,
    "text-light": textLight,
    ...highContrast,
    "surface-light": surfaceLight,
    "surface-dark": surfaceDark,
    "chrome-light": chromeLight,
    "chrome-dark": chromeDark,
    "primary-seed": createSeedPrimitiveFamily("primary-seed", primarySeed),
    ...primary,
    "danger-seed": createSeedPrimitiveFamily("danger-seed", statusSeeds.danger),
    "warning-seed": createSeedPrimitiveFamily("warning-seed", statusSeeds.warning),
    "success-seed": createSeedPrimitiveFamily("success-seed", statusSeeds.success),
    "info-seed": createSeedPrimitiveFamily("info-seed", statusSeeds.info),
    ...status,
    ...customRolePrimitives,
  };
  const textTreatment = TEXT_TREATMENT_STRATEGIES[resolvedInput.textTreatment];
  const semantics = createSemantics(
    resolvedInput.namespace,
    primitives,
    textTreatment.name,
    customRoles,
  );
  const assertions = createContrastAssertionReport({
    namespace: resolvedInput.namespace,
    primitives,
    semantics,
    customRoles,
  });
  const cssOutput = createCssOutput(resolvedInput.namespace, primitives, semantics, surfacePresets);

  return {
    namespace: resolvedInput.namespace,
    preset,
    surfacePresets,
    input: resolvedInput,
    customRoles,
    seeds: {
      neutral: neutralSeed,
      surfaceLight: surfaceLightSeed,
      surfaceDark: surfaceDarkSeed,
      primary: primarySeed,
      primaryDark: primaryDarkSeed,
      status: statusSeeds,
      statusDark: statusDarkSeeds,
    },
    seedPolicies,
    textTreatment,
    primitives,
    semantics,
    assertions,
    cssOutput,
    css: cssOutput.all,
  };
}

export function parseColorSeed(seed: string, field = "seed"): OklchValue {
  const trimmed = seed.trim();

  if (trimmed.startsWith("#")) {
    return hexToOklch(trimmed, field);
  }

  const match = /^oklch\(\s*([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+(-?[0-9]*\.?[0-9]+)\s*\)$/i.exec(trimmed);

  if (match) {
    return {
      l: clampNumber(Number(match[1]), 0, 1),
      c: clampNumber(Number(match[2]), 0, 1),
      h: normalizeHue(Number(match[3])),
    };
  }

  throw new ColorEngineValidationError({
    code: "INVALID_SEED",
    field,
    value: seed,
    message: "Seed must be #rgb, #rrggbb, or oklch(L C H).",
  });
}

export function createColorEngineCssArtifacts(
  output: ColorEngineOutput | ColorEngineCssOutput,
): readonly ColorEngineCssArtifact[] {
  const cssOutput = "cssOutput" in output ? output.cssOutput : output;

  return cssOutput.files.map((file) => ({
    ...file,
    byteLength: getUtf8ByteLength(file.css),
    contentHash: createStableCssContentHash(file.css),
  }));
}

function resolveInput(input: ColorEngineInput): ResolvedColorEngineInput {
  const preset = input.preset ?? DEFAULT_INPUT.preset;
  const lightSurfacePreset = input.lightSurfacePreset ?? preset;
  const darkSurfacePreset = input.darkSurfacePreset ?? preset;
  const namespace = input.namespace ?? DEFAULT_INPUT.namespace;

  validateSurfacePreset(preset, "preset");
  validateSurfacePreset(lightSurfacePreset, "lightSurfacePreset");
  validateSurfacePreset(darkSurfacePreset, "darkSurfacePreset");

  validateNamespace(namespace);

  const primarySeedPolicy = resolveSeedPolicy(input.primarySeedPolicy, "primarySeedPolicy");
  const dangerSeedPolicy = resolveSeedPolicy(input.dangerSeedPolicy, "dangerSeedPolicy");
  const warningSeedPolicy = resolveSeedPolicy(input.warningSeedPolicy, "warningSeedPolicy");
  const successSeedPolicy = resolveSeedPolicy(input.successSeedPolicy, "successSeedPolicy");
  const infoSeedPolicy = resolveSeedPolicy(input.infoSeedPolicy, "infoSeedPolicy");
  const textTreatment = resolveTextTreatment(input.textTreatment, "textTreatment");
  const primarySeed = input.primarySeed ?? DEFAULT_INPUT.primarySeed;
  const dangerSeed = input.dangerSeed ?? DEFAULT_INPUT.dangerSeed;
  const warningSeed = input.warningSeed ?? DEFAULT_INPUT.warningSeed;
  const successSeed = input.successSeed ?? DEFAULT_INPUT.successSeed;
  const infoSeed = input.infoSeed ?? DEFAULT_INPUT.infoSeed;

  return {
    neutralSeed: input.neutralSeed ?? DEFAULT_INPUT.neutralSeed,
    surfaceLightSeed: input.surfaceLightSeed ?? DEFAULT_INPUT.surfaceLightSeed,
    surfaceDarkSeed: input.surfaceDarkSeed ?? DEFAULT_INPUT.surfaceDarkSeed,
    primarySeed,
    primaryDarkSeed: input.primaryDarkSeed ?? primarySeed,
    primarySeedPolicy,
    dangerSeed,
    dangerDarkSeed: input.dangerDarkSeed ?? dangerSeed,
    dangerSeedPolicy,
    warningSeed,
    warningDarkSeed: input.warningDarkSeed ?? warningSeed,
    warningSeedPolicy,
    successSeed,
    successDarkSeed: input.successDarkSeed ?? successSeed,
    successSeedPolicy,
    infoSeed,
    infoDarkSeed: input.infoDarkSeed ?? infoSeed,
    infoSeedPolicy,
    textTreatment,
    preset,
    lightSurfacePreset,
    darkSurfacePreset,
    namespace,
    customRoles: resolveCustomColorRoleInputs(input.customRoles),
  };
}

export function createCustomColorRoleCssAliasName(
  roleId: string,
  part: CustomColorRoleSemanticPart,
): CustomColorRoleCssAliasName {
  validateCustomColorRoleId(roleId, `customRoles.${roleId}`);
  validateCustomColorRoleSemanticPart(part, "part");

  return `role-${roleId}-${part}`;
}

export function createCustomColorRoleCssAliasNames(
  roleId: string,
): Readonly<Record<CustomColorRoleSemanticPart, CustomColorRoleCssAliasName>> {
  return CUSTOM_COLOR_ROLE_SEMANTIC_PARTS.reduce(
    (aliases, part) => ({
      ...aliases,
      [part]: createCustomColorRoleCssAliasName(roleId, part),
    }),
    {} as Record<CustomColorRoleSemanticPart, CustomColorRoleCssAliasName>,
  );
}

export function createCustomColorRoleCssVariableName(
  namespace: string,
  roleId: string,
  part: CustomColorRoleSemanticPart,
): CustomColorRoleCssVariableName {
  validateNamespace(namespace);

  return `--${namespace}-${createCustomColorRoleCssAliasName(roleId, part)}`;
}

export function createCustomColorRoleCssVariableNames(
  namespace: string,
  roleId: string,
): Readonly<Record<CustomColorRoleSemanticPart, CustomColorRoleCssVariableName>> {
  return CUSTOM_COLOR_ROLE_SEMANTIC_PARTS.reduce(
    (variables, part) => ({
      ...variables,
      [part]: createCustomColorRoleCssVariableName(namespace, roleId, part),
    }),
    {} as Record<CustomColorRoleSemanticPart, CustomColorRoleCssVariableName>,
  );
}

function validateSurfacePreset(preset: SurfacePresetName, field: string): void {
  if (!SURFACE_PRESET_NAMES.includes(preset)) {
    throw new ColorEngineValidationError({
      code: "INVALID_PRESET",
      field,
      value: preset,
      message: "Surface preset must be quiet, standard, layered, or high-separation.",
    });
  }
}

function resolveCustomColorRoleInputs(
  customRoles: ColorEngineInput["customRoles"],
): ResolvedColorEngineInput["customRoles"] {
  if (customRoles === undefined) {
    return {};
  }

  if (!isRecord(customRoles)) {
    throw new ColorEngineValidationError({
      code: "INVALID_CUSTOM_ROLE",
      field: "customRoles",
      value: customRoles,
      message: "Custom roles must be an object keyed by lowercase kebab-case role id.",
    });
  }

  const resolved: Record<string, ResolvedCustomColorRoleInput> = {};

  for (const [roleId, roleInput] of Object.entries(customRoles)) {
    validateCustomColorRoleId(roleId, `customRoles.${roleId}`);

    if (!isRecord(roleInput)) {
      throw new ColorEngineValidationError({
        code: "INVALID_CUSTOM_ROLE",
        field: `customRoles.${roleId}`,
        value: roleInput,
        message: "Custom role configuration must be an object with a seed.",
      });
    }

    const seed = validateSeedInput(roleInput.seed, `customRoles.${roleId}.seed`);
    const darkSeed = roleInput.darkSeed === undefined
      ? seed
      : validateSeedInput(roleInput.darkSeed, `customRoles.${roleId}.darkSeed`);

    resolved[roleId] = {
      seed,
      darkSeed,
      seedPolicy: resolveSeedPolicy(roleInput.seedPolicy, `customRoles.${roleId}.seedPolicy`),
    };
  }

  return resolved;
}

function resolveCustomColorRoleMetadata(
  customRoles: ResolvedColorEngineInput["customRoles"],
  namespace: string,
): ColorEngineOutput["customRoles"] {
  const resolved: Record<string, ResolvedCustomColorRole> = {};

  for (const [roleId, roleInput] of Object.entries(customRoles)) {
    resolved[roleId] = {
      id: roleId,
      seed: parseColorSeed(roleInput.seed, `customRoles.${roleId}.seed`),
      darkSeed: parseColorSeed(roleInput.darkSeed, `customRoles.${roleId}.darkSeed`),
      seedPolicy: roleInput.seedPolicy,
      cssAliases: createCustomColorRoleCssAliasNames(roleId),
      cssVariables: createCustomColorRoleCssVariableNames(namespace, roleId),
    };
  }

  return resolved;
}

function validateNamespace(namespace: string): void {
  if (!/^[a-z][a-z0-9-]*$/i.test(namespace)) {
    throw new ColorEngineValidationError({
      code: "INVALID_NAMESPACE",
      field: "namespace",
      value: namespace,
      message: "Namespace must start with a letter and contain only letters, numbers, or hyphens.",
    });
  }
}

function validateCustomColorRoleId(roleId: string, field: string): void {
  if (!CUSTOM_COLOR_ROLE_ID_PATTERN.test(roleId)) {
    throw new ColorEngineValidationError({
      code: "INVALID_CUSTOM_ROLE_ID",
      field,
      value: roleId,
      message: "Custom role id must be lowercase kebab-case and start with a letter.",
    });
  }

  if ((RESERVED_CUSTOM_COLOR_ROLE_IDS as readonly string[]).includes(roleId)) {
    throw new ColorEngineValidationError({
      code: "RESERVED_CUSTOM_ROLE_ID",
      field,
      value: roleId,
      message: "Custom role id is reserved by a built-in role or core namespace.",
    });
  }
}

function validateCustomColorRoleSemanticPart(
  part: CustomColorRoleSemanticPart,
  field: string,
): void {
  if (!CUSTOM_COLOR_ROLE_SEMANTIC_PARTS.includes(part)) {
    throw new ColorEngineValidationError({
      code: "INVALID_CUSTOM_ROLE",
      field,
      value: part,
      message: "Custom role semantic part is not supported.",
    });
  }
}

function validateSeedInput(seed: unknown, field: string): ColorSeed | string {
  if (typeof seed === "string") {
    return seed;
  }

  throw new ColorEngineValidationError({
    code: "INVALID_SEED",
    field,
    value: seed,
    message: "Seed must be #rgb, #rrggbb, or oklch(L C H).",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveSeedPolicy(policy: unknown, field: string): SeedPolicy {
  const resolved = policy ?? DEFAULT_INPUT.primarySeedPolicy;

  if (typeof resolved === "string" && (SEED_POLICY_NAMES as readonly string[]).includes(resolved)) {
    return resolved as SeedPolicy;
  }

  throw new ColorEngineValidationError({
    code: "INVALID_SEED_POLICY",
    field,
    value: policy,
    message: "Seed policy must be balanced or anchored.",
  });
}

function resolveTextTreatment(
  strategy: TextTreatmentStrategyName | undefined,
  field: string,
): TextTreatmentStrategyName {
  const resolved = strategy ?? DEFAULT_INPUT.textTreatment;

  if (TEXT_TREATMENT_STRATEGY_NAMES.includes(resolved)) {
    return resolved;
  }

  throw new ColorEngineValidationError({
    code: "INVALID_TEXT_TREATMENT",
    field,
    value: strategy,
    message: "Text treatment must be same-hue, neutral, or adaptive.",
  });
}

function createLevelRamp(options: {
  readonly family: PrimitiveFamilyName;
  readonly seed: OklchValue;
  readonly delta: number;
  readonly direction: 1 | -1;
  readonly maxLightness: number;
  readonly chromaScale: number;
}): readonly ColorToken[] {
  return SURFACE_LEVELS.map((level, index) => {
    const oklch = {
      l: roundChannel(clampNumber(options.seed.l + index * options.delta * options.direction, 0.02, options.maxLightness)),
      c: roundChannel(clampNumber(options.seed.c * options.chromaScale, 0, 0.08)),
      h: roundChannel(normalizeHue(options.seed.h)),
    };

    return {
      name: `${options.family}-${level}`,
      value: formatOklch(oklch),
      oklch,
      description: `${options.family} level ${level}`,
    };
  });
}

function createTextRamp(options: {
  readonly family: TextPrimitiveFamilyName;
  readonly seed: OklchValue;
}): readonly ColorToken[] {
  const lightness: Readonly<Record<TextPrimitiveFamilyName, readonly [number, number, number, number, number]>> = {
    "text-dark": [0.035, 0.16, 0.32, 0.46, 0.58],
    "text-light": [0.995, 0.93, 0.8, 0.66, 0.54],
  };
  const chroma: Readonly<Record<TextPrimitiveFamilyName, readonly [number, number, number, number, number]>> = {
    "text-dark": [0.003, 0.006, 0.009, 0.011, 0.012],
    "text-light": [0.002, 0.004, 0.006, 0.008, 0.009],
  };
  const hue = roundChannel(normalizeHue(options.seed.h));

  return TEXT_LEVELS.map((level, index) => {
    const oklch = {
      l: roundChannel(lightness[options.family][index] ?? lightness[options.family][4]),
      c: roundChannel(Math.min(options.seed.c * 0.45, chroma[options.family][index] ?? chroma[options.family][4])),
      h: hue,
    };

    return {
      name: `${options.family}-${level}`,
      value: formatOklch(oklch),
      oklch,
      description: `${options.family} ${level} foreground`,
    };
  });
}

function createHighContrastPrimitiveFamilies(): Pick<PrimitiveSurfaceOutput, "hc-light" | "hc-dark"> {
  return {
    "hc-light": [
      ...createFixedHighContrastFoundation("hc-light", {
        surface: [0.995, 0.965, 0.925, 0.875],
        text: [0.01, 0.035, 0.14, 0.24, 0.42],
        border: [0.62, 0.36, 0.08],
        controlBg: 0.99,
        controlBorder: 0.18,
        controlText: 0.01,
      }),
      ...createFixedHighContrastInteractive("hc-light", {
        primary: {
          action: [0.24, 0.19, 0.14],
          actionText: [0.995, 0, 0],
          link: [0.24, 0.19],
          focus: [0.5, 0.18, 265],
          soft: [0.99, 0.965, 0.28, 0.16, 265],
          hue: 265,
          chroma: 0.16,
        },
        danger: createLightHighContrastIntent(28, 0.18, 0.3),
        warning: createLightHighContrastIntent(82, 0.14, 0.34),
        success: createLightHighContrastIntent(150, 0.16, 0.29),
        info: createLightHighContrastIntent(235, 0.15, 0.3),
        role: createLightHighContrastIntent(285, 0.16, 0.3),
      }),
    ],
    "hc-dark": [
      ...createFixedHighContrastFoundation("hc-dark", {
        surface: [0.015, 0.055, 0.095, 0.14],
        text: [0.995, 0.94, 0.82, 0.72, 0.6],
        border: [0.42, 0.7, 0.94],
        controlBg: 0.035,
        controlBorder: 0.82,
        controlText: 0.995,
      }),
      ...createFixedHighContrastInteractive("hc-dark", {
        primary: {
          action: [0.84, 0.91, 0.76],
          actionText: [0.01, 0, 0],
          link: [0.84, 0.91],
          focus: [0.9, 0.19, 100],
          soft: [0.045, 0.075, 0.82, 0.84, 210],
          hue: 210,
          chroma: 0.16,
        },
        danger: createDarkHighContrastIntent(28, 0.14, 0.79),
        warning: createDarkHighContrastIntent(88, 0.16, 0.86),
        success: createDarkHighContrastIntent(150, 0.14, 0.8),
        info: createDarkHighContrastIntent(235, 0.13, 0.84),
        role: createDarkHighContrastIntent(285, 0.15, 0.82),
      }),
    ],
  };
}

function createFixedHighContrastFoundation(
  family: HighContrastPrimitiveFamilyName,
  values: {
    readonly surface: readonly [number, number, number, number];
    readonly text: readonly [number, number, number, number, number];
    readonly border: readonly [number, number, number];
    readonly controlBg: number;
    readonly controlBorder: number;
    readonly controlText: number;
  },
): readonly ColorToken[] {
  return [
    ...SURFACE_LEVELS.map((level, index) =>
      createFixedToken(family, `surface-${level}`, values.surface[index] ?? values.surface[3], 0, 0),
    ),
    ...TEXT_LEVELS.map((level, index) =>
      createFixedToken(family, `text-${level}`, values.text[index] ?? values.text[4], 0, 0),
    ),
    createFixedToken(family, "border-subtle", values.border[0], 0, 0),
    createFixedToken(family, "border-default", values.border[1], 0, 0),
    createFixedToken(family, "border-strong", values.border[2], 0, 0),
    createFixedToken(family, "control-bg", values.controlBg, 0, 0),
    createFixedToken(family, "control-border", values.controlBorder, 0, 0),
    createFixedToken(family, "control-text", values.controlText, 0, 0),
  ];
}

function createFixedHighContrastInteractive(
  family: HighContrastPrimitiveFamilyName,
  values: {
    readonly primary: HighContrastPrimarySpec;
    readonly danger: HighContrastIntentSpec;
    readonly warning: HighContrastIntentSpec;
    readonly success: HighContrastIntentSpec;
    readonly info: HighContrastIntentSpec;
    readonly role: HighContrastIntentSpec;
  },
): readonly ColorToken[] {
  return [
    ...createFixedHighContrastPrimary(family, values.primary),
    ...createFixedHighContrastIntent(family, "danger", values.danger),
    ...createFixedHighContrastIntent(family, "warning", values.warning),
    ...createFixedHighContrastIntent(family, "success", values.success),
    ...createFixedHighContrastIntent(family, "info", values.info),
    ...createFixedHighContrastIntent(family, "role", values.role),
  ];
}

interface HighContrastPrimarySpec {
  readonly action: readonly [number, number, number];
  readonly actionText: readonly [number, number, number];
  readonly link: readonly [number, number];
  readonly focus: readonly [number, number, number];
  readonly soft: readonly [number, number, number, number, number];
  readonly hue: number;
  readonly chroma: number;
}

interface HighContrastIntentSpec {
  readonly solid: readonly [number, number, number];
  readonly solidText: readonly [number, number, number];
  readonly soft: readonly [number, number, number, number, number];
  readonly hue: number;
  readonly chroma: number;
}

function createLightHighContrastIntent(
  hue: number,
  chroma: number,
  solidLightness: number,
): HighContrastIntentSpec {
  return {
    solid: [solidLightness, solidLightness - 0.05, solidLightness - 0.1],
    solidText: [0.995, 0, 0],
    soft: [0.99, 0.965, 0.35, 0.22, hue],
    hue,
    chroma,
  };
}

function createDarkHighContrastIntent(
  hue: number,
  chroma: number,
  solidLightness: number,
): HighContrastIntentSpec {
  return {
    solid: [solidLightness, Math.min(solidLightness + 0.07, 0.95), solidLightness],
    solidText: [0.01, 0, 0],
    soft: [0.04, 0.075, 0.78, 0.84, hue],
    hue,
    chroma,
  };
}

function createFixedHighContrastPrimary(
  family: HighContrastPrimitiveFamilyName,
  spec: HighContrastPrimarySpec,
): readonly ColorToken[] {
  return [
    createFixedToken(family, "primary-action-bg", spec.action[0], spec.chroma, spec.hue),
    createFixedToken(family, "primary-action-bg-hover", spec.action[1], spec.chroma, spec.hue),
    createFixedToken(family, "primary-action-bg-pressed", spec.action[2], spec.chroma, spec.hue),
    createFixedToken(family, "primary-action-text", spec.actionText[0], spec.actionText[1], spec.actionText[2]),
    createFixedToken(family, "primary-link", spec.link[0], spec.chroma, spec.hue),
    createFixedToken(family, "primary-link-hover", spec.link[1], spec.chroma, spec.hue),
    createFixedToken(family, "primary-focus-ring", spec.focus[0], spec.focus[1], spec.focus[2]),
    createFixedToken(family, "primary-soft-bg", spec.soft[0], spec.chroma * 0.08, spec.soft[4]),
    createFixedToken(family, "primary-soft-bg-hover", spec.soft[1], spec.chroma * 0.12, spec.soft[4]),
    createFixedToken(family, "primary-soft-border", spec.soft[2], spec.chroma * 0.9, spec.soft[4]),
    createFixedToken(family, "primary-soft-text", spec.soft[3], spec.chroma, spec.soft[4]),
  ];
}

function createFixedHighContrastIntent(
  family: HighContrastPrimitiveFamilyName,
  intent: StatusIntent | "role",
  spec: HighContrastIntentSpec,
): readonly ColorToken[] {
  return [
    createFixedToken(family, `${intent}-solid-bg`, spec.solid[0], spec.chroma, spec.hue),
    createFixedToken(family, `${intent}-solid-bg-hover`, spec.solid[1], spec.chroma, spec.hue),
    createFixedToken(family, `${intent}-solid-bg-pressed`, spec.solid[2], spec.chroma, spec.hue),
    createFixedToken(family, `${intent}-solid-text`, spec.solidText[0], spec.solidText[1], spec.solidText[2]),
    createFixedToken(family, `${intent}-soft-bg`, spec.soft[0], spec.chroma * 0.08, spec.soft[4]),
    createFixedToken(family, `${intent}-soft-bg-hover`, spec.soft[1], spec.chroma * 0.12, spec.soft[4]),
    createFixedToken(family, `${intent}-soft-border`, spec.soft[2], spec.chroma * 0.95, spec.soft[4]),
    createFixedToken(family, `${intent}-soft-text`, spec.soft[3], spec.chroma, spec.soft[4]),
  ];
}

function createFixedToken(
  family: HighContrastPrimitiveFamilyName,
  suffix: string,
  l: number,
  c: number,
  h: number,
): ColorToken {
  const oklch = {
    l: roundChannel(clampNumber(l, 0.01, 0.995)),
    c: roundChannel(clampNumber(c, 0, 0.22)),
    h: roundChannel(normalizeHue(h)),
  };

  return {
    name: `${family}-${suffix}`,
    value: formatOklch(oklch),
    oklch,
    description: `${family} fixed ${suffix}`,
  };
}

function toneSeed(surfaceSeed: OklchValue, neutralSeed: OklchValue, chromaScale: number): OklchValue {
  return {
    l: surfaceSeed.l,
    c: Math.min(surfaceSeed.c, neutralSeed.c) * chromaScale,
    h: neutralSeed.h,
  };
}

function createChromeRamp(options: {
  readonly family: "chrome-light" | "chrome-dark";
  readonly surfaceSeed: OklchValue;
  readonly neutralSeed: OklchValue;
  readonly theme: SurfaceGenerationTheme;
  readonly preset: SurfacePreset;
}): readonly ColorToken[] {
  const baseChroma = clampNumber(
    Math.min(options.surfaceSeed.c, options.neutralSeed.c) * options.preset.chromaScale * 0.9,
    0,
    0.028,
  );
  const hue = roundChannel(normalizeHue(options.neutralSeed.h));
  const lightnessOffsets: readonly [number, number, number] =
    options.theme === "light"
      ? [
          -Math.max(0.035, options.preset.lightStepDelta * 3),
          -Math.max(0.055, options.preset.lightStepDelta * 4.8),
          -Math.max(0.085, options.preset.lightStepDelta * 6.4),
        ]
      : [
          Math.max(0.045, options.preset.darkStepDelta * 2),
          Math.max(0.075, options.preset.darkStepDelta * 3.5),
          Math.max(0.11, options.preset.darkStepDelta * 5),
        ];

  return CHROME_LEVELS.map((level, index) => {
    const lightnessOffset = lightnessOffsets[index] ?? lightnessOffsets[2];
    const oklch = {
      l: roundChannel(clampNumber(options.surfaceSeed.l + lightnessOffset, 0.02, 0.998)),
      c: roundChannel(baseChroma),
      h: hue,
    };

    return {
      name: `${options.family}-${level}`,
      value: formatOklch(oklch),
      oklch,
      description: `${options.family} ${level}`,
    };
  });
}

function createPrimaryUsageFamilies(options: {
  readonly lightSeed: OklchValue;
  readonly darkSeed: OklchValue;
  readonly policy: SeedPolicy;
}): Pick<
  PrimitiveSurfaceOutput,
  "primary-light-soft" | "primary-light-solid" | "primary-dark-soft" | "primary-dark-solid"
> {
  const lightChroma = clampNumber(options.lightSeed.c, 0.055, 0.18);
  const darkChroma = clampNumber(options.darkSeed.c, 0.055, 0.18);
  const lightHue = normalizeHue(options.lightSeed.h);
  const darkHue = normalizeHue(options.darkSeed.h);
  const lightSolidBase = clampNumber(options.lightSeed.l, 0.42, 0.62);
  const darkSolidBase = clampNumber(options.darkSeed.l + 0.2, 0.66, 0.78);

  return {
    "primary-light-soft": createUsageRamp({
      family: "primary-light-soft",
      hue: lightHue,
      lightness: [0.968, 0.942, 0.912, 0.878],
      chroma: [lightChroma * 0.16, lightChroma * 0.23, lightChroma * 0.31, lightChroma * 0.42],
      description: "primary light soft",
    }),
    "primary-light-solid": createUsageRamp({
      family: "primary-light-solid",
      hue: lightHue,
      lightness: createSolidLightness(options.lightSeed, lightSolidBase, "light", options.policy),
      chroma: createSolidChroma(options.lightSeed, lightChroma, "light", options.policy),
      description: "primary light solid",
      ...anchoredUsageBounds(options.policy),
    }),
    "primary-dark-soft": createUsageRamp({
      family: "primary-dark-soft",
      hue: darkHue,
      lightness: [0.18, 0.218, 0.258, 0.302],
      chroma: [darkChroma * 0.28, darkChroma * 0.34, darkChroma * 0.41, darkChroma * 0.48],
      description: "primary dark soft",
    }),
    "primary-dark-solid": createUsageRamp({
      family: "primary-dark-solid",
      hue: darkHue,
      lightness: createSolidLightness(options.darkSeed, darkSolidBase, "dark", options.policy, "ui"),
      chroma: createSolidChroma(options.darkSeed, darkChroma, "dark", options.policy),
      description: "primary dark solid",
      ...anchoredUsageBounds(options.policy),
    }),
  };
}

function createStatusUsageFamilies(options: {
  readonly lightSeeds: Readonly<Record<StatusIntent, OklchValue>>;
  readonly darkSeeds: Readonly<Record<StatusIntent, OklchValue>>;
  readonly policies: Readonly<Record<StatusIntent, SeedPolicy>>;
}): Pick<
  PrimitiveSurfaceOutput,
  | StatusUsageFamilyName
> {
  return {
    ...createStatusIntentFamilies("danger", options.lightSeeds.danger, options.darkSeeds.danger, options.policies.danger),
    ...createStatusIntentFamilies("warning", options.lightSeeds.warning, options.darkSeeds.warning, options.policies.warning),
    ...createStatusIntentFamilies("success", options.lightSeeds.success, options.darkSeeds.success, options.policies.success),
    ...createStatusIntentFamilies("info", options.lightSeeds.info, options.darkSeeds.info, options.policies.info),
  };
}

function createStatusIntentFamilies(
  intent: StatusIntent,
  lightSeed: OklchValue,
  darkSeed: OklchValue,
  policy: SeedPolicy,
): Record<StatusUsageFamilyName, readonly ColorToken[]> {
  const isWarning = intent === "warning";
  const lightHue = normalizeHue(lightSeed.h);
  const darkHue = normalizeHue(darkSeed.h);
  const lightChroma = clampNumber(lightSeed.c, isWarning ? 0.045 : 0.06, isWarning ? 0.145 : 0.18);
  const darkChroma = clampNumber(darkSeed.c, isWarning ? 0.045 : 0.06, isWarning ? 0.145 : 0.18);
  const lightSolidBase = clampNumber(lightSeed.l + (isWarning ? 0.02 : 0), isWarning ? 0.5 : 0.42, isWarning ? 0.61 : 0.6);
  const darkSolidBase = clampNumber(darkSeed.l + (isWarning ? 0.22 : 0.2), isWarning ? 0.7 : 0.66, isWarning ? 0.82 : 0.78);
  const lightSoftChroma: readonly [number, number, number, number] = isWarning
    ? [lightChroma * 0.12, lightChroma * 0.17, lightChroma * 0.24, lightChroma * 0.34]
    : [lightChroma * 0.15, lightChroma * 0.22, lightChroma * 0.3, lightChroma * 0.42];
  const darkSoftChroma: readonly [number, number, number, number] = isWarning
    ? [darkChroma * 0.18, darkChroma * 0.24, darkChroma * 0.31, darkChroma * 0.4]
    : [darkChroma * 0.26, darkChroma * 0.33, darkChroma * 0.41, darkChroma * 0.5];

  return {
    [`${intent}-light-soft`]: createUsageRamp({
      family: `${intent}-light-soft`,
      hue: lightHue,
      lightness: isWarning ? [0.972, 0.952, 0.928, 0.898] : [0.968, 0.944, 0.916, 0.882],
      chroma: lightSoftChroma,
      description: `${intent} light soft`,
    }),
    [`${intent}-light-solid`]: createUsageRamp({
      family: `${intent}-light-solid`,
      hue: lightHue,
      lightness: createSolidLightness(lightSeed, lightSolidBase, "light", policy),
      chroma: createSolidChroma(lightSeed, lightChroma, "light", policy, 0.86),
      description: `${intent} light solid`,
      ...anchoredUsageBounds(policy),
    }),
    [`${intent}-dark-soft`]: createUsageRamp({
      family: `${intent}-dark-soft`,
      hue: darkHue,
      lightness: isWarning ? [0.17, 0.21, 0.252, 0.296] : [0.16, 0.2, 0.242, 0.288],
      chroma: darkSoftChroma,
      description: `${intent} dark soft`,
    }),
    [`${intent}-dark-solid`]: createUsageRamp({
      family: `${intent}-dark-solid`,
      hue: darkHue,
      lightness: createSolidLightness(darkSeed, darkSolidBase, "dark", policy, "status"),
      chroma: createSolidChroma(darkSeed, darkChroma, "dark", policy, 0.72),
      description: `${intent} dark solid`,
      ...anchoredUsageBounds(policy),
    }),
  } as Record<StatusUsageFamilyName, readonly ColorToken[]>;
}

function createCustomColorRoleUsageFamilies(
  customRoles: ColorEngineOutput["customRoles"],
): CustomColorRolePrimitiveOutput {
  const families: Record<CustomColorRoleUsageFamilyName, readonly ColorToken[]> = {};

  for (const role of Object.values(customRoles)) {
    Object.assign(families, createCustomColorRoleFamilies(role));
  }

  return families;
}

function createCustomColorRoleFamilies(
  role: ResolvedCustomColorRole,
): Record<CustomColorRoleUsageFamilyName, readonly ColorToken[]> {
  const lightHue = normalizeHue(role.seed.h);
  const darkHue = normalizeHue(role.darkSeed.h);
  const lightChroma = clampNumber(role.seed.c, 0.06, 0.18);
  const darkChroma = clampNumber(role.darkSeed.c, 0.06, 0.18);
  const lightSolidBase = clampNumber(role.seed.l, 0.42, 0.6);
  const darkSolidBase = clampNumber(role.darkSeed.l + 0.2, 0.66, 0.78);
  const lightSoftFamily = `role-${role.id}-light-soft` as const;
  const lightSolidFamily = `role-${role.id}-light-solid` as const;
  const darkSoftFamily = `role-${role.id}-dark-soft` as const;
  const darkSolidFamily = `role-${role.id}-dark-solid` as const;

  return {
    [lightSoftFamily]: createUsageRamp({
      family: lightSoftFamily,
      hue: lightHue,
      lightness: [0.968, 0.944, 0.916, 0.882],
      chroma: [lightChroma * 0.15, lightChroma * 0.22, lightChroma * 0.3, lightChroma * 0.42],
      description: `custom role ${role.id} light soft`,
    }),
    [lightSolidFamily]: createUsageRamp({
      family: lightSolidFamily,
      hue: lightHue,
      lightness: createSolidLightness(role.seed, lightSolidBase, "light", role.seedPolicy),
      chroma: createSolidChroma(role.seed, lightChroma, "light", role.seedPolicy, 0.86),
      description: `custom role ${role.id} light solid`,
      ...anchoredUsageBounds(role.seedPolicy),
    }),
    [darkSoftFamily]: createUsageRamp({
      family: darkSoftFamily,
      hue: darkHue,
      lightness: [0.16, 0.2, 0.242, 0.288],
      chroma: [darkChroma * 0.26, darkChroma * 0.33, darkChroma * 0.41, darkChroma * 0.5],
      description: `custom role ${role.id} dark soft`,
    }),
    [darkSolidFamily]: createUsageRamp({
      family: darkSolidFamily,
      hue: darkHue,
      lightness: createSolidLightness(role.darkSeed, darkSolidBase, "dark", role.seedPolicy, "status"),
      chroma: createSolidChroma(role.darkSeed, darkChroma, "dark", role.seedPolicy, 0.72),
      description: `custom role ${role.id} dark solid`,
      ...anchoredUsageBounds(role.seedPolicy),
    }),
  } as Record<CustomColorRoleUsageFamilyName, readonly ColorToken[]>;
}

function createSolidLightness(
  seed: OklchValue,
  balancedBase: number,
  theme: SurfaceGenerationTheme,
  policy: SeedPolicy,
  profile: SolidContrastProfile = "ui",
): readonly [number, number, number, number] {
  if (policy === "anchored") {
    const lighterDelta = theme === "light" ? 0.055 : 0.045;
    const darkerDelta = theme === "light" ? 0.045 : 0.055;
    const darkestDelta = theme === "light" ? 0.085 : 0.105;

    return [
      seed.l + lighterDelta,
      seed.l,
      seed.l - darkerDelta,
      seed.l - darkestDelta,
    ];
  }

  if (theme === "dark" && profile === "status") {
    return [
      balancedBase + 0.125,
      balancedBase + 0.1,
      balancedBase + 0.095,
      balancedBase + 0.035,
    ];
  }

  if (theme === "light") {
    return [
      balancedBase + 0.055,
      balancedBase,
      balancedBase - 0.045,
      balancedBase - 0.085,
    ];
  }

  return [
    balancedBase + 0.075,
    balancedBase + 0.045,
    balancedBase + 0.01,
    balancedBase - 0.035,
  ];
}

function anchoredUsageBounds(policy: SeedPolicy): {
  readonly maxChroma?: number;
  readonly minLightness?: number;
  readonly maxLightness?: number;
} {
  return policy === "anchored" ? { maxChroma: 1, minLightness: 0, maxLightness: 1 } : {};
}

function createSolidChroma(
  seed: OklchValue,
  balancedChroma: number,
  theme: SurfaceGenerationTheme,
  policy: SeedPolicy,
  lightFirstStepScale = 0.88,
  darkFirstStepScale = 0.75,
): readonly [number, number, number, number] {
  if (policy === "anchored") {
    const base = seed.c;

    return theme === "light"
      ? [base * lightFirstStepScale, base, base * 1.03, base * 1.05]
      : [base * darkFirstStepScale, base, base * 0.9, base * 1.02];
  }

  return theme === "light"
    ? [balancedChroma * lightFirstStepScale, balancedChroma, balancedChroma * 1.02, balancedChroma * 1.04]
    : [balancedChroma * darkFirstStepScale, balancedChroma * 0.82, balancedChroma * 0.92, balancedChroma];
}

function createSeedPrimitiveFamily(
  family: SeedPrimitiveFamilyName,
  seed: OklchValue,
): readonly ColorToken[] {
  return [
    {
      name: family,
      value: formatOklch(seed),
      oklch: seed,
      description: `${family} exact parsed seed`,
    },
  ];
}

function createUsageRamp(options: {
  readonly family: CustomUsageFamilyName;
  readonly hue: number;
  readonly lightness: readonly [number, number, number, number];
  readonly chroma: readonly [number, number, number, number];
  readonly description: string;
  readonly maxChroma?: number;
  readonly minLightness?: number;
  readonly maxLightness?: number;
}): readonly ColorToken[] {
  return options.lightness.map((lightness, index) => {
    const level = (index + 1) as SurfaceLevel;
    const chroma = options.chroma[index] ?? options.chroma[3];
    const oklch = {
      l: roundChannel(clampNumber(lightness, options.minLightness ?? 0.02, options.maxLightness ?? 0.998)),
      c: roundChannel(clampNumber(chroma, 0, options.maxChroma ?? 0.22)),
      h: roundChannel(options.hue),
    };

    return {
      name: `${options.family}-${level}`,
      value: formatOklch(oklch),
      oklch,
      description: `${options.description} level ${level}`,
    };
  });
}

function createSemantics(
  namespace: string,
  primitives: PrimitiveSurfaceOutput,
  textTreatment: TextTreatmentStrategyName,
  customRoles: ColorEngineOutput["customRoles"],
): ColorEngineOutput["semantics"] {
  return {
    light: {
      ...createNeutralSemantics(namespace, "light"),
      ...createSurfaceSemantics(namespace, "surface-light"),
      ...createPrimarySemantics(namespace, "light", primitives, textTreatment),
      ...createStatusSemantics(namespace, "light", primitives, textTreatment),
      ...createCustomColorRoleSemantics(namespace, "light", primitives, textTreatment, customRoles),
    },
    dark: {
      ...createNeutralSemantics(namespace, "dark"),
      ...createSurfaceSemantics(namespace, "surface-dark"),
      ...createPrimarySemantics(namespace, "dark", primitives, textTreatment),
      ...createStatusSemantics(namespace, "dark", primitives, textTreatment),
      ...createCustomColorRoleSemantics(namespace, "dark", primitives, textTreatment, customRoles),
    },
    "high-contrast": createHighContrastSemantics(namespace, "hc-light", customRoles),
    "high-contrast-dark": createHighContrastSemantics(namespace, "hc-dark", customRoles),
  };
}

function createNeutralSemantics(
  namespace: string,
  theme: SurfaceGenerationTheme,
): Readonly<Record<NeutralSemanticTokenName, `var(--${string})`>> {
  if (theme === "light") {
    return {
      "text-primary": cssVar(namespace, "text-dark-primary"),
      "text-secondary": cssVar(namespace, "text-dark-secondary"),
      "text-muted": cssVar(namespace, "text-dark-muted"),
      "border-subtle": cssVar(namespace, "chrome-light-subtle"),
      "border-default": cssVar(namespace, "chrome-light-default"),
      "border-strong": cssVar(namespace, "chrome-light-strong"),
      "control-border": cssVar(namespace, "chrome-light-default"),
      "control-bg": cssVar(namespace, "surface-light-1"),
      "control-bg-hover": cssVar(namespace, "surface-light-1-hover"),
      "control-text": cssVar(namespace, "text-dark-primary"),
    };
  }

  return {
    "text-primary": cssVar(namespace, "text-light-primary"),
    "text-secondary": cssVar(namespace, "text-light-secondary"),
    "text-muted": cssVar(namespace, "text-light-muted"),
    "border-subtle": cssVar(namespace, "chrome-dark-subtle"),
    "border-default": cssVar(namespace, "chrome-dark-default"),
    "border-strong": cssVar(namespace, "chrome-dark-strong"),
    "control-border": cssVar(namespace, "chrome-dark-default"),
    "control-bg": cssVar(namespace, "surface-dark-2"),
    "control-bg-hover": cssVar(namespace, "surface-dark-2-hover"),
    "control-text": cssVar(namespace, "text-light-primary"),
  };
}

function createSurfaceSemantics(
  namespace: string,
  family: "surface-light" | "surface-dark",
): Readonly<Record<SurfaceSemanticTokenName, `var(--${string})`>> {
  const entries: [SurfaceSemanticTokenName, `var(--${string})`][] = [];

  for (const level of SURFACE_LEVELS) {
    entries.push([`surface-${level}`, cssVar(namespace, `${family}-${level}`)]);
    for (const state of SURFACE_STATES) {
      entries.push([
        `surface-${level}-${state}`,
        cssVar(namespace, `${family}-${level}-${state}`),
      ]);
    }
  }

  return Object.fromEntries(entries) as Record<SurfaceSemanticTokenName, `var(--${string})`>;
}

function createPrimarySemantics(
  namespace: string,
  theme: SurfaceGenerationTheme,
  primitives: PrimitiveSurfaceOutput,
  textTreatment: TextTreatmentStrategyName,
): Readonly<Record<PrimarySemanticTokenName, `var(--${string})`>> {
  const softFamily = theme === "light" ? "primary-light-soft" : "primary-dark-soft";
  const solidFamily = theme === "light" ? "primary-light-solid" : "primary-dark-solid";
  const primaryActionText = resolveSolidForegroundToken({
    primitives,
    backgrounds: theme === "light"
      ? ["primary-light-solid-2", "primary-light-solid-3", "primary-light-solid-4"]
      : ["primary-dark-solid-2", "primary-dark-solid-1", "primary-dark-solid-3"],
    preferredToken: theme === "light" ? "text-light-strong" : "text-dark-strong",
    threshold: CONTRAST_ASSERTION_THRESHOLDS.ui,
    theme,
  });
  const primarySoftText = resolveSoftTextToken({
    primitives,
    softBackgrounds: [`${softFamily}-1`, `${softFamily}-2`],
    sameHueToken: `${solidFamily}-${theme === "light" ? 4 : 1}`,
    strategy: textTreatment,
    theme,
  });

  if (theme === "light") {
    return {
      "primary-action-bg": cssVar(namespace, "primary-light-solid-2"),
      "primary-action-bg-hover": cssVar(namespace, "primary-light-solid-3"),
      "primary-action-bg-pressed": cssVar(namespace, "primary-light-solid-4"),
      "primary-action-text": cssVar(namespace, primaryActionText),
      "primary-link": cssVar(namespace, "primary-light-solid-2"),
      "primary-link-hover": cssVar(namespace, "primary-light-solid-3"),
      "primary-focus-ring": cssVar(namespace, "primary-light-solid-1"),
      "primary-soft-bg": cssVar(namespace, "primary-light-soft-1"),
      "primary-soft-bg-hover": cssVar(namespace, "primary-light-soft-2"),
      "primary-soft-border": cssVar(namespace, "primary-light-soft-4"),
      "primary-soft-text": cssVar(namespace, primarySoftText),
    };
  }

  return {
    "primary-action-bg": cssVar(namespace, "primary-dark-solid-2"),
    "primary-action-bg-hover": cssVar(namespace, "primary-dark-solid-1"),
    "primary-action-bg-pressed": cssVar(namespace, "primary-dark-solid-3"),
    "primary-action-text": cssVar(namespace, primaryActionText),
    "primary-link": cssVar(namespace, "primary-dark-solid-2"),
    "primary-link-hover": cssVar(namespace, "primary-dark-solid-1"),
    "primary-focus-ring": cssVar(namespace, "primary-dark-solid-1"),
    "primary-soft-bg": cssVar(namespace, "primary-dark-soft-1"),
    "primary-soft-bg-hover": cssVar(namespace, "primary-dark-soft-2"),
    "primary-soft-border": cssVar(namespace, "primary-dark-soft-4"),
    "primary-soft-text": cssVar(namespace, primarySoftText),
  };
}

function createStatusSemantics(
  namespace: string,
  theme: SurfaceGenerationTheme,
  primitives: PrimitiveSurfaceOutput,
  textTreatment: TextTreatmentStrategyName,
): Readonly<Record<StatusSemanticTokenName, `var(--${string})`>> {
  const entries: [StatusSemanticTokenName, `var(--${string})`][] = [];
  const themePrefix = theme === "light" ? "light" : "dark";

  for (const intent of STATUS_INTENTS) {
    const softFamily = `${intent}-${themePrefix}-soft`;
    const solidFamily = `${intent}-${themePrefix}-solid` as const;
    const softTextToken = resolveSoftTextToken({
      primitives,
      softBackgrounds: [`${softFamily}-1`, `${softFamily}-2`],
      sameHueToken: `${solidFamily}-${theme === "light" ? 4 : 1}`,
      strategy: textTreatment,
      theme,
    });
    const solidTextToken = resolveStatusSolidTextToken({
      primitives,
      solidFamily,
      theme,
    });

    entries.push([`${intent}-soft-bg`, cssVar(namespace, `${softFamily}-1`)]);
    entries.push([`${intent}-soft-bg-hover`, cssVar(namespace, `${softFamily}-2`)]);
    entries.push([`${intent}-soft-border`, cssVar(namespace, `${softFamily}-4`)]);
    entries.push([`${intent}-soft-text`, cssVar(namespace, softTextToken)]);
    entries.push([`${intent}-solid-bg`, cssVar(namespace, `${solidFamily}-2`)]);
    entries.push([`${intent}-solid-bg-hover`, cssVar(namespace, `${solidFamily}-${theme === "light" ? 3 : 1}`)]);
    entries.push([`${intent}-solid-bg-pressed`, cssVar(namespace, `${solidFamily}-${theme === "light" ? 4 : 3}`)]);
    entries.push([`${intent}-solid-text`, cssVar(namespace, solidTextToken)]);
  }

  return Object.fromEntries(entries) as Record<StatusSemanticTokenName, `var(--${string})`>;
}

function createCustomColorRoleSemantics(
  namespace: string,
  theme: SurfaceGenerationTheme,
  primitives: PrimitiveSurfaceOutput,
  textTreatment: TextTreatmentStrategyName,
  customRoles: ColorEngineOutput["customRoles"],
): Readonly<Partial<Record<CustomColorRoleSemanticTokenName, `var(--${string})`>>> {
  const entries: [CustomColorRoleSemanticTokenName, `var(--${string})`][] = [];
  const themePrefix = theme === "light" ? "light" : "dark";

  for (const role of Object.values(customRoles)) {
    const softFamily = `role-${role.id}-${themePrefix}-soft`;
    const solidFamily = `role-${role.id}-${themePrefix}-solid`;
    const softTextToken = resolveSoftTextToken({
      primitives,
      softBackgrounds: [`${softFamily}-1`, `${softFamily}-2`],
      sameHueToken: `${solidFamily}-${theme === "light" ? 4 : 1}`,
      strategy: textTreatment,
      theme,
    });
    const solidTextToken = resolveSolidForegroundToken({
      primitives,
      backgrounds: getSolidBackgroundTokenNames(solidFamily, theme),
      preferredToken: theme === "light" ? "text-light-strong" : "text-dark-strong",
      threshold: CONTRAST_ASSERTION_THRESHOLDS["status-solid"],
      theme,
    });

    entries.push([role.cssAliases["soft-bg"], cssVar(namespace, `${softFamily}-1`)]);
    entries.push([role.cssAliases["soft-bg-hover"], cssVar(namespace, `${softFamily}-2`)]);
    entries.push([role.cssAliases["soft-border"], cssVar(namespace, `${softFamily}-4`)]);
    entries.push([role.cssAliases["soft-text"], cssVar(namespace, softTextToken)]);
    entries.push([role.cssAliases["solid-bg"], cssVar(namespace, `${solidFamily}-2`)]);
    entries.push([role.cssAliases["solid-bg-hover"], cssVar(namespace, `${solidFamily}-${theme === "light" ? 3 : 1}`)]);
    entries.push([role.cssAliases["solid-bg-pressed"], cssVar(namespace, `${solidFamily}-${theme === "light" ? 4 : 3}`)]);
    entries.push([role.cssAliases["solid-text"], cssVar(namespace, solidTextToken)]);
  }

  return Object.fromEntries(entries) as Partial<Record<CustomColorRoleSemanticTokenName, `var(--${string})`>>;
}

function createHighContrastSemantics(
  namespace: string,
  family: HighContrastPrimitiveFamilyName,
  customRoles: ColorEngineOutput["customRoles"],
): ColorEngineThemeSemantics {
  return {
    ...createHighContrastNeutralSemantics(namespace, family),
    ...createHighContrastSurfaceSemantics(namespace, family),
    ...createHighContrastPrimarySemantics(namespace, family),
    ...createHighContrastStatusSemantics(namespace, family),
    ...createHighContrastCustomColorRoleSemantics(namespace, family, customRoles),
  };
}

function createHighContrastNeutralSemantics(
  namespace: string,
  family: HighContrastPrimitiveFamilyName,
): Readonly<Record<NeutralSemanticTokenName, `var(--${string})`>> {
  return {
    "text-primary": cssVar(namespace, `${family}-text-primary`),
    "text-secondary": cssVar(namespace, `${family}-text-secondary`),
    "text-muted": cssVar(namespace, `${family}-text-muted`),
    "border-subtle": cssVar(namespace, `${family}-border-subtle`),
    "border-default": cssVar(namespace, `${family}-border-default`),
    "border-strong": cssVar(namespace, `${family}-border-strong`),
    "control-border": cssVar(namespace, `${family}-control-border`),
    "control-bg": cssVar(namespace, `${family}-control-bg`),
    "control-bg-hover": cssVar(namespace, `${family}-control-bg-hover`),
    "control-text": cssVar(namespace, `${family}-control-text`),
  };
}

function createHighContrastSurfaceSemantics(
  namespace: string,
  family: HighContrastPrimitiveFamilyName,
): Readonly<Record<SurfaceSemanticTokenName, `var(--${string})`>> {
  const entries: [SurfaceSemanticTokenName, `var(--${string})`][] = [];

  for (const level of SURFACE_LEVELS) {
    entries.push([`surface-${level}`, cssVar(namespace, `${family}-surface-${level}`)]);
    for (const state of SURFACE_STATES) {
      entries.push([
        `surface-${level}-${state}`,
        cssVar(namespace, `${family}-surface-${level}-${state}`),
      ]);
    }
  }

  return Object.fromEntries(entries) as Record<SurfaceSemanticTokenName, `var(--${string})`>;
}

function createHighContrastPrimarySemantics(
  namespace: string,
  family: HighContrastPrimitiveFamilyName,
): Readonly<Record<PrimarySemanticTokenName, `var(--${string})`>> {
  return {
    "primary-action-bg": cssVar(namespace, `${family}-primary-action-bg`),
    "primary-action-bg-hover": cssVar(namespace, `${family}-primary-action-bg-hover`),
    "primary-action-bg-pressed": cssVar(namespace, `${family}-primary-action-bg-pressed`),
    "primary-action-text": cssVar(namespace, `${family}-primary-action-text`),
    "primary-link": cssVar(namespace, `${family}-primary-link`),
    "primary-link-hover": cssVar(namespace, `${family}-primary-link-hover`),
    "primary-focus-ring": cssVar(namespace, `${family}-primary-focus-ring`),
    "primary-soft-bg": cssVar(namespace, `${family}-primary-soft-bg`),
    "primary-soft-bg-hover": cssVar(namespace, `${family}-primary-soft-bg-hover`),
    "primary-soft-border": cssVar(namespace, `${family}-primary-soft-border`),
    "primary-soft-text": cssVar(namespace, `${family}-primary-soft-text`),
  };
}

function createHighContrastStatusSemantics(
  namespace: string,
  family: HighContrastPrimitiveFamilyName,
): Readonly<Record<StatusSemanticTokenName, `var(--${string})`>> {
  const entries: [StatusSemanticTokenName, `var(--${string})`][] = [];

  for (const intent of STATUS_INTENTS) {
    entries.push([`${intent}-soft-bg`, cssVar(namespace, `${family}-${intent}-soft-bg`)]);
    entries.push([`${intent}-soft-bg-hover`, cssVar(namespace, `${family}-${intent}-soft-bg-hover`)]);
    entries.push([`${intent}-soft-border`, cssVar(namespace, `${family}-${intent}-soft-border`)]);
    entries.push([`${intent}-soft-text`, cssVar(namespace, `${family}-${intent}-soft-text`)]);
    entries.push([`${intent}-solid-bg`, cssVar(namespace, `${family}-${intent}-solid-bg`)]);
    entries.push([`${intent}-solid-bg-hover`, cssVar(namespace, `${family}-${intent}-solid-bg-hover`)]);
    entries.push([`${intent}-solid-bg-pressed`, cssVar(namespace, `${family}-${intent}-solid-bg-pressed`)]);
    entries.push([`${intent}-solid-text`, cssVar(namespace, `${family}-${intent}-solid-text`)]);
  }

  return Object.fromEntries(entries) as Record<StatusSemanticTokenName, `var(--${string})`>;
}

function createHighContrastCustomColorRoleSemantics(
  namespace: string,
  family: HighContrastPrimitiveFamilyName,
  customRoles: ColorEngineOutput["customRoles"],
): Readonly<Partial<Record<CustomColorRoleSemanticTokenName, `var(--${string})`>>> {
  const entries: [CustomColorRoleSemanticTokenName, `var(--${string})`][] = [];

  for (const role of Object.values(customRoles)) {
    entries.push([role.cssAliases["soft-bg"], cssVar(namespace, `${family}-role-soft-bg`)]);
    entries.push([role.cssAliases["soft-bg-hover"], cssVar(namespace, `${family}-role-soft-bg-hover`)]);
    entries.push([role.cssAliases["soft-border"], cssVar(namespace, `${family}-role-soft-border`)]);
    entries.push([role.cssAliases["soft-text"], cssVar(namespace, `${family}-role-soft-text`)]);
    entries.push([role.cssAliases["solid-bg"], cssVar(namespace, `${family}-role-solid-bg`)]);
    entries.push([role.cssAliases["solid-bg-hover"], cssVar(namespace, `${family}-role-solid-bg-hover`)]);
    entries.push([role.cssAliases["solid-bg-pressed"], cssVar(namespace, `${family}-role-solid-bg-pressed`)]);
    entries.push([role.cssAliases["solid-text"], cssVar(namespace, `${family}-role-solid-text`)]);
  }

  return Object.fromEntries(entries) as Partial<Record<CustomColorRoleSemanticTokenName, `var(--${string})`>>;
}

function resolveSoftTextToken(options: {
  readonly primitives: PrimitiveSurfaceOutput;
  readonly softBackgrounds: readonly string[];
  readonly sameHueToken: string;
  readonly strategy: TextTreatmentStrategyName;
  readonly theme: SurfaceGenerationTheme;
}): string {
  if (options.strategy === "same-hue") {
    return options.sameHueToken;
  }

  const neutralToken = options.theme === "light" ? "text-dark-primary" : "text-light-primary";

  if (options.strategy === "neutral") {
    return neutralToken;
  }

  const candidates = options.theme === "light"
    ? [options.sameHueToken, neutralToken, "text-dark-secondary"] as const
    : [options.sameHueToken, neutralToken, "text-light-secondary"] as const;
  const backgrounds = options.softBackgrounds.map((name) => findPrimitiveToken(options.primitives, name));
  const scores = candidates.map((name, index) => {
    const token = findPrimitiveToken(options.primitives, name);
    const contrasts = backgrounds.map((background) =>
      Math.abs(calculateApcaLcFromOklch(token.oklch, background.oklch)),
    );

    return {
      name,
      index,
      minContrast: Math.min(...contrasts),
      totalContrast: contrasts.reduce((total, contrast) => total + contrast, 0),
    };
  });

  return [...scores]
    .sort((a, b) =>
      (b.minContrast - a.minContrast) ||
      (b.totalContrast - a.totalContrast) ||
      (a.index - b.index),
    )[0]?.name ?? options.sameHueToken;
}

function resolveStatusSolidTextToken(options: {
  readonly primitives: PrimitiveSurfaceOutput;
  readonly solidFamily: `${StatusIntent}-${"light" | "dark"}-solid`;
  readonly theme: SurfaceGenerationTheme;
}): string {
  return resolveSolidForegroundToken({
    primitives: options.primitives,
    backgrounds: getStatusSolidBackgroundTokenNames(options.solidFamily, options.theme),
    preferredToken: options.theme === "light" ? "text-light-strong" : "text-dark-strong",
    threshold: CONTRAST_ASSERTION_THRESHOLDS["status-solid"],
    theme: options.theme,
  });
}

function resolveSolidForegroundToken(options: {
  readonly primitives: PrimitiveSurfaceOutput;
  readonly backgrounds: readonly string[];
  readonly preferredToken: string;
  readonly threshold: number;
  readonly theme: SurfaceGenerationTheme;
}): string {
  const candidates = options.theme === "light"
    ? [options.preferredToken, "text-light-primary", "text-dark-strong", "text-dark-primary"] as const
    : [options.preferredToken, "text-dark-primary", "text-light-strong", "text-light-primary"] as const;
  const backgrounds = options.backgrounds.map((name) => findPrimitiveToken(options.primitives, name));
  const scores = candidates.map((name, index) => {
    const token = findPrimitiveToken(options.primitives, name);
    const contrasts = backgrounds.map((background) =>
      Math.abs(calculateApcaLcFromOklch(token.oklch, background.oklch)),
    );

    return {
      name,
      index,
      minContrast: Math.min(...contrasts),
      totalContrast: contrasts.reduce((total, contrast) => total + contrast, 0),
    };
  });
  const preferredScore = scores.find((score) => score.name === options.preferredToken);

  if (preferredScore && preferredScore.minContrast >= options.threshold) {
    return options.preferredToken;
  }

  return [...scores]
    .sort((a, b) =>
      (b.minContrast - a.minContrast) ||
      (b.totalContrast - a.totalContrast) ||
      (a.index - b.index),
    )[0]?.name ?? options.preferredToken;
}

function getStatusSolidBackgroundTokenNames(
  solidFamily: `${StatusIntent}-${"light" | "dark"}-solid`,
  theme: SurfaceGenerationTheme,
): readonly string[] {
  return getSolidBackgroundTokenNames(solidFamily, theme);
}

function getSolidBackgroundTokenNames(
  solidFamily: string,
  theme: SurfaceGenerationTheme,
): readonly string[] {
  return theme === "light"
    ? [`${solidFamily}-2`, `${solidFamily}-3`, `${solidFamily}-4`]
    : [`${solidFamily}-2`, `${solidFamily}-1`, `${solidFamily}-3`];
}

function findPrimitiveToken(
  primitives: PrimitiveSurfaceOutput,
  name: string,
): ColorToken {
  const token = Object.values(primitives)
    .flatMap((tokens) => [...tokens])
    .find((candidate) => candidate.name === name);

  if (!token) {
    throw new Error(`Could not resolve primitive token ${name}.`);
  }

  return token;
}

function createCssOutput(
  namespace: string,
  primitives: PrimitiveSurfaceOutput,
  semantics: ColorEngineOutput["semantics"],
  surfacePresets: Readonly<Record<SurfaceGenerationTheme, SurfacePreset>>,
): ColorEngineCssOutput {
  const primitiveCss = createPrimitiveCss(namespace, primitives, surfacePresets);
  const themeCss = {
    light: createThemeCss(namespace, "light", semantics.light),
    dark: createThemeCss(namespace, "dark", semantics.dark),
    "high-contrast": createThemeCss(namespace, "high-contrast", semantics["high-contrast"]),
    "high-contrast-dark": createThemeCss(
      namespace,
      "high-contrast-dark",
      semantics["high-contrast-dark"],
    ),
  } as const satisfies Readonly<Record<SurfaceTheme, string>>;
  const files = [
    {
      fileName: "primitives.css",
      kind: "primitives",
      css: primitiveCss,
    },
    {
      fileName: "theme-light.css",
      kind: "theme",
      theme: "light",
      css: themeCss.light,
    },
    {
      fileName: "theme-dark.css",
      kind: "theme",
      theme: "dark",
      css: themeCss.dark,
    },
    {
      fileName: "theme-high-contrast.css",
      kind: "theme",
      theme: "high-contrast",
      css: themeCss["high-contrast"],
    },
    {
      fileName: "theme-high-contrast-dark.css",
      kind: "theme",
      theme: "high-contrast-dark",
      css: themeCss["high-contrast-dark"],
    },
  ] as const satisfies readonly ColorEngineCssFile[];

  return {
    primitives: primitiveCss,
    themes: themeCss,
    files,
    all: files.map((file) => file.css).join("\n\n"),
  };
}

function getUtf8ByteLength(value: string): number {
  let byteLength = 0;

  for (const byte of iterateUtf8Bytes(value)) {
    void byte;
    byteLength += 1;
  }

  return byteLength;
}

function createStableCssContentHash(value: string): ColorEngineCssArtifactHash {
  let hash = 0x811c9dc5;

  for (const byte of iterateUtf8Bytes(value)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `fnv1a32-${hash.toString(16).padStart(8, "0")}`;
}

function* iterateUtf8Bytes(value: string): Generator<number> {
  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.codePointAt(index) ?? 0;

    if (codePoint > 0xffff) {
      index += 1;
    }

    if (codePoint <= 0x7f) {
      yield codePoint;
    } else if (codePoint <= 0x7ff) {
      yield 0xc0 | (codePoint >> 6);
      yield 0x80 | (codePoint & 0x3f);
    } else if (codePoint <= 0xffff) {
      yield 0xe0 | (codePoint >> 12);
      yield 0x80 | ((codePoint >> 6) & 0x3f);
      yield 0x80 | (codePoint & 0x3f);
    } else {
      yield 0xf0 | (codePoint >> 18);
      yield 0x80 | ((codePoint >> 12) & 0x3f);
      yield 0x80 | ((codePoint >> 6) & 0x3f);
      yield 0x80 | (codePoint & 0x3f);
    }
  }
}

function createPrimitiveCss(
  namespace: string,
  primitives: PrimitiveSurfaceOutput,
  surfacePresets: Readonly<Record<SurfaceGenerationTheme, SurfacePreset>>,
): string {
  const declarations: [string, string][] = [];

  for (const tokens of Object.values(primitives)) {
    for (const token of tokens) {
      declarations.push([`--${namespace}-${token.name}`, token.value]);
      if (shouldCreateStateValues(token.name)) {
        for (const state of SURFACE_STATES) {
          declarations.push([
            `--${namespace}-${token.name}-${state}`,
            token.name.startsWith("hc-light-") || token.name.startsWith("hc-dark-")
              ? createHighContrastStateValue(token.oklch, state, token.name.startsWith("hc-light-") ? "light" : "dark")
              : createStateValue(
                  token.oklch,
                  state,
                  getPrimitiveTokenTheme(token.name),
                  surfacePresets[getPrimitiveTokenTheme(token.name)],
                ),
          ]);
        }
      }
    }
  }

  return createCssRule(":root", declarations);
}

function shouldCreateStateValues(tokenName: string): boolean {
  return !tokenName.endsWith("-seed") &&
    !tokenName.startsWith("text-") &&
    !tokenName.startsWith("hc-light-text-") &&
    !tokenName.startsWith("hc-dark-text-");
}

function getPrimitiveTokenTheme(tokenName: string): SurfaceGenerationTheme {
  if (tokenName.startsWith("role-")) {
    const match = /^role-[a-z][a-z0-9-]*-(light|dark)-(?:soft|solid)-\d+$/.exec(tokenName);
    if (match?.[1] === "light" || match?.[1] === "dark") {
      return match[1];
    }
  }

  if (tokenName.startsWith("hc-light-")) {
    return "light";
  }

  if (tokenName.startsWith("hc-dark-")) {
    return "dark";
  }

  return tokenName.includes("-light-") ? "light" : "dark";
}

function createHighContrastStateValue(
  base: OklchValue,
  state: SurfaceState,
  theme: SurfaceGenerationTheme,
): `oklch(${string})` {
  const multiplier = state === "hover" ? 1 : state === "selected" ? 1.8 : 2.6;
  const isLightSurface = theme === "light";
  const direction = isLightSurface ? -1 : 1;
  const delta = isLightSurface ? 0.025 : 0.04;
  const oklch = {
    l: roundChannel(clampNumber(base.l + direction * delta * multiplier, 0.01, 0.995)),
    c: base.c,
    h: base.h,
  };

  return formatOklch(oklch);
}

function createThemeCss(
  namespace: string,
  theme: SurfaceTheme,
  semantics: ColorEngineThemeSemantics,
): string {
  return createCssRule(
    `[data-theme-v2="${theme}"]`,
    Object.entries(semantics)
      .flatMap(([name, value]) => value === undefined ? [] : [[`--${namespace}-${name}`, value] as const]),
  );
}

function createStateValue(
  base: OklchValue,
  state: SurfaceState,
  theme: SurfaceGenerationTheme,
  preset: SurfacePreset,
): `oklch(${string})` {
  const multiplier = state === "hover" ? 1 : state === "selected" ? 1.65 : 2.2;
  const isLightSurface = theme === "light";
  const direction = isLightSurface ? -1 : 1;
  const delta = isLightSurface ? preset.lightStateDelta : preset.darkStateDelta;
  const oklch = {
    l: roundChannel(clampNumber(base.l + direction * delta * multiplier, 0.02, 0.998)),
    c: roundChannel(clampNumber(base.c * (state === "hover" ? 0.98 : state === "selected" ? 0.96 : 0.94), 0, 0.08)),
    h: base.h,
  };

  return formatOklch(oklch);
}

function createCssRule(selector: string, declarations: readonly (readonly [string, string])[]): string {
  return `${selector} {\n${declarations.map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}`;
}

function cssVar(namespace: string, name: string): `var(--${string})` {
  return `var(--${namespace}-${name})`;
}

function hexToOklch(hex: string, field: string): OklchValue {
  const value = normalizeHex(hex, field);
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;

  return linearSrgbToOklch({
    r: encodedToLinear(r),
    g: encodedToLinear(g),
    b: encodedToLinear(b),
  });
}

function normalizeHex(hex: string, field: string): string {
  const value = hex.slice(1);

  if (/^[0-9a-f]{3}$/i.test(value)) {
    return value.split("").map((channel) => `${channel}${channel}`).join("");
  }

  if (/^[0-9a-f]{6}$/i.test(value)) {
    return value;
  }

  throw new ColorEngineValidationError({
    code: "INVALID_SEED",
    field,
    value: hex,
    message: "Hex seeds must be #rgb or #rrggbb.",
  });
}

function linearSrgbToOklch(color: { readonly r: number; readonly g: number; readonly b: number }): OklchValue {
  const l = Math.cbrt(0.4122214708 * color.r + 0.5363325363 * color.g + 0.0514459929 * color.b);
  const m = Math.cbrt(0.2119034982 * color.r + 0.6806995451 * color.g + 0.1073969566 * color.b);
  const s = Math.cbrt(0.0883024619 * color.r + 0.2817188376 * color.g + 0.6309787005 * color.b);
  const oklabL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b = -0.031135701 * l + 0.7827717662 * m - 0.7518163563 * s;

  return {
    l: roundChannel(oklabL),
    c: roundChannel(Math.hypot(a, b)),
    h: roundChannel(normalizeHue((Math.atan2(b, a) * 180) / Math.PI)),
  };
}

function encodedToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function formatOklch(color: OklchValue): `oklch(${string})` {
  return `oklch(${formatNumber(color.l)} ${formatNumber(color.c)} ${formatNumber(color.h)})`;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(6)).toString();
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundChannel(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
