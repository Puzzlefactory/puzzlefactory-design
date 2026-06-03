import { createContrastAssertionReport } from "./assertions.js";
import type { ContrastAssertionReport as ContrastAssertionReportType } from "./assertions.js";

export {
  CONTRAST_ASSERTION_THRESHOLDS,
  createContrastAssertionReport,
} from "./assertions.js";
export type {
  ContrastAssertionPair,
  ContrastAssertionReport,
  ContrastAssertionRole,
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

export type SurfacePresetName =
  | "quiet"
  | "standard"
  | "layered"
  | "high-separation";

export type SurfaceTheme = "light" | "dark";

export type SurfaceLevel = 1 | 2 | 3 | 4;

export type SurfaceState = "hover" | "selected" | "pressed";

export type ChromeLevel = "subtle" | "default" | "strong";

export type SeedPolicy = "balanced" | "anchored";

export type PrimaryUsageFamilyName =
  | "primary-light-soft"
  | "primary-light-solid"
  | "primary-dark-soft"
  | "primary-dark-solid";

export type StatusIntent = "danger" | "warning" | "success" | "info";

export type StatusUsageFamilyName =
  `${StatusIntent}-${"light" | "dark"}-${"soft" | "solid"}`;

export type SeedPrimitiveFamilyName =
  | "primary-seed"
  | `${StatusIntent}-seed`;

export type UsageFamilyName = PrimaryUsageFamilyName | StatusUsageFamilyName;

export type PrimitiveFamilyName =
  | "neutral-light"
  | "neutral-dark"
  | "surface-light"
  | "surface-dark"
  | "chrome-light"
  | "chrome-dark"
  | UsageFamilyName
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

export interface ColorEngineInput {
  readonly neutralSeed?: ColorSeed | string;
  readonly surfaceLightSeed?: ColorSeed | string;
  readonly surfaceDarkSeed?: ColorSeed | string;
  readonly primarySeed?: ColorSeed | string;
  readonly primarySeedPolicy?: SeedPolicy;
  readonly dangerSeed?: ColorSeed | string;
  readonly dangerSeedPolicy?: SeedPolicy;
  readonly warningSeed?: ColorSeed | string;
  readonly warningSeedPolicy?: SeedPolicy;
  readonly successSeed?: ColorSeed | string;
  readonly successSeedPolicy?: SeedPolicy;
  readonly infoSeed?: ColorSeed | string;
  readonly infoSeedPolicy?: SeedPolicy;
  readonly preset?: SurfacePresetName;
  readonly namespace?: string;
}

export interface ColorToken {
  readonly name: string;
  readonly value: `oklch(${string})`;
  readonly oklch: OklchValue;
  readonly description: string;
}

export interface PrimitiveSurfaceOutput {
  readonly "neutral-light": readonly ColorToken[];
  readonly "neutral-dark": readonly ColorToken[];
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

export interface ColorEngineOutput {
  readonly namespace: string;
  readonly preset: SurfacePreset;
  readonly input: Required<ColorEngineInput>;
  readonly seeds: {
    readonly neutral: OklchValue;
    readonly surfaceLight: OklchValue;
    readonly surfaceDark: OklchValue;
    readonly primary: OklchValue;
    readonly status: Readonly<Record<StatusIntent, OklchValue>>;
  };
  readonly seedPolicies: {
    readonly primary: SeedPolicy;
    readonly status: Readonly<Record<StatusIntent, SeedPolicy>>;
  };
  readonly primitives: PrimitiveSurfaceOutput;
  readonly semantics: Readonly<Record<SurfaceTheme, Readonly<Record<SemanticTokenName, `var(--${string})`>>>>;
  readonly assertions: ContrastAssertionReportType;
  readonly cssOutput: ColorEngineCssOutput;
  readonly css: string;
}

export interface ColorEngineCssOutput {
  readonly primitives: string;
  readonly themes: Readonly<Record<SurfaceTheme, string>>;
  readonly all: string;
}

export type ValidationErrorCode =
  | "INVALID_SEED"
  | "INVALID_SEED_POLICY"
  | "INVALID_PRESET"
  | "INVALID_NAMESPACE";

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

export const SURFACE_LEVELS = [1, 2, 3, 4] as const satisfies readonly SurfaceLevel[];

export const SURFACE_STATES = ["hover", "selected", "pressed"] as const satisfies readonly SurfaceState[];

export const CHROME_LEVELS = ["subtle", "default", "strong"] as const satisfies readonly ChromeLevel[];

export const STATUS_INTENTS = ["danger", "warning", "success", "info"] as const satisfies readonly StatusIntent[];

export const SEED_POLICY_NAMES = ["balanced", "anchored"] as const satisfies readonly SeedPolicy[];

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

const DEFAULT_INPUT = {
  neutralSeed: "oklch(0.86 0.012 255)",
  surfaceLightSeed: "oklch(0.94 0.01 255)",
  surfaceDarkSeed: "oklch(0.12 0.012 255)",
  primarySeed: "#0f6f3d",
  primarySeedPolicy: "balanced",
  dangerSeed: "#c62828",
  dangerSeedPolicy: "balanced",
  warningSeed: "#b26a00",
  warningSeedPolicy: "balanced",
  successSeed: "#16823a",
  successSeedPolicy: "balanced",
  infoSeed: "#0b6ea8",
  infoSeedPolicy: "balanced",
  preset: "standard",
  namespace: "ds",
} as const satisfies Required<ColorEngineInput>;

export function createColorEngineTheme(input: ColorEngineInput = {}): ColorEngineOutput {
  const resolvedInput = resolveInput(input);
  const preset = SURFACE_PRESETS[resolvedInput.preset];
  const neutralSeed = parseColorSeed(resolvedInput.neutralSeed, "neutralSeed");
  const surfaceLightSeed = parseColorSeed(resolvedInput.surfaceLightSeed, "surfaceLightSeed");
  const surfaceDarkSeed = parseColorSeed(resolvedInput.surfaceDarkSeed, "surfaceDarkSeed");
  const primarySeed = parseColorSeed(resolvedInput.primarySeed, "primarySeed");
  const statusSeeds = {
    danger: parseColorSeed(resolvedInput.dangerSeed, "dangerSeed"),
    warning: parseColorSeed(resolvedInput.warningSeed, "warningSeed"),
    success: parseColorSeed(resolvedInput.successSeed, "successSeed"),
    info: parseColorSeed(resolvedInput.infoSeed, "infoSeed"),
  } as const satisfies Readonly<Record<StatusIntent, OklchValue>>;
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
    delta: preset.lightStepDelta,
    direction: 1,
    maxLightness: 0.995,
    chromaScale: preset.chromaScale * 0.75,
  });
  const neutralDark = createLevelRamp({
    family: "neutral-dark",
    seed: toneSeed(surfaceDarkSeed, neutralSeed, 0.8),
    delta: preset.darkStepDelta,
    direction: 1,
    maxLightness: 0.28,
    chromaScale: preset.chromaScale * 0.8,
  });
  const surfaceLight = createLevelRamp({
    family: "surface-light",
    seed: surfaceLightSeed,
    delta: preset.lightStepDelta,
    direction: 1,
    maxLightness: 0.998,
    chromaScale: preset.chromaScale,
  });
  const surfaceDark = createLevelRamp({
    family: "surface-dark",
    seed: surfaceDarkSeed,
    delta: preset.darkStepDelta,
    direction: 1,
    maxLightness: 0.32,
    chromaScale: preset.chromaScale,
  });
  const chromeLight = createChromeRamp({
    family: "chrome-light",
    surfaceSeed: surfaceLightSeed,
    neutralSeed,
    theme: "light",
    preset,
  });
  const chromeDark = createChromeRamp({
    family: "chrome-dark",
    surfaceSeed: surfaceDarkSeed,
    neutralSeed,
    theme: "dark",
    preset,
  });
  const primary = createPrimaryUsageFamilies(primarySeed, seedPolicies.primary);
  const status = createStatusUsageFamilies(statusSeeds, seedPolicies.status);
  const primitives: PrimitiveSurfaceOutput = {
    "neutral-light": neutralLight,
    "neutral-dark": neutralDark,
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
  };
  const semantics = createSemantics(resolvedInput.namespace);
  const assertions = createContrastAssertionReport({
    namespace: resolvedInput.namespace,
    primitives,
    semantics,
  });
  const cssOutput = createCssOutput(resolvedInput.namespace, primitives, semantics, preset);

  return {
    namespace: resolvedInput.namespace,
    preset,
    input: resolvedInput,
    seeds: {
      neutral: neutralSeed,
      surfaceLight: surfaceLightSeed,
      surfaceDark: surfaceDarkSeed,
      primary: primarySeed,
      status: statusSeeds,
    },
    seedPolicies,
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

function resolveInput(input: ColorEngineInput): Required<ColorEngineInput> {
  const preset = input.preset ?? DEFAULT_INPUT.preset;
  const namespace = input.namespace ?? DEFAULT_INPUT.namespace;

  if (!SURFACE_PRESET_NAMES.includes(preset)) {
    throw new ColorEngineValidationError({
      code: "INVALID_PRESET",
      field: "preset",
      value: preset,
      message: "Preset must be quiet, standard, layered, or high-separation.",
    });
  }

  if (!/^[a-z][a-z0-9-]*$/i.test(namespace)) {
    throw new ColorEngineValidationError({
      code: "INVALID_NAMESPACE",
      field: "namespace",
      value: namespace,
      message: "Namespace must start with a letter and contain only letters, numbers, or hyphens.",
    });
  }

  const primarySeedPolicy = resolveSeedPolicy(input.primarySeedPolicy, "primarySeedPolicy");
  const dangerSeedPolicy = resolveSeedPolicy(input.dangerSeedPolicy, "dangerSeedPolicy");
  const warningSeedPolicy = resolveSeedPolicy(input.warningSeedPolicy, "warningSeedPolicy");
  const successSeedPolicy = resolveSeedPolicy(input.successSeedPolicy, "successSeedPolicy");
  const infoSeedPolicy = resolveSeedPolicy(input.infoSeedPolicy, "infoSeedPolicy");

  return {
    neutralSeed: input.neutralSeed ?? DEFAULT_INPUT.neutralSeed,
    surfaceLightSeed: input.surfaceLightSeed ?? DEFAULT_INPUT.surfaceLightSeed,
    surfaceDarkSeed: input.surfaceDarkSeed ?? DEFAULT_INPUT.surfaceDarkSeed,
    primarySeed: input.primarySeed ?? DEFAULT_INPUT.primarySeed,
    primarySeedPolicy,
    dangerSeed: input.dangerSeed ?? DEFAULT_INPUT.dangerSeed,
    dangerSeedPolicy,
    warningSeed: input.warningSeed ?? DEFAULT_INPUT.warningSeed,
    warningSeedPolicy,
    successSeed: input.successSeed ?? DEFAULT_INPUT.successSeed,
    successSeedPolicy,
    infoSeed: input.infoSeed ?? DEFAULT_INPUT.infoSeed,
    infoSeedPolicy,
    preset,
    namespace,
  };
}

function resolveSeedPolicy(policy: SeedPolicy | undefined, field: string): SeedPolicy {
  const resolved = policy ?? DEFAULT_INPUT.primarySeedPolicy;

  if (SEED_POLICY_NAMES.includes(resolved)) {
    return resolved;
  }

  throw new ColorEngineValidationError({
    code: "INVALID_SEED_POLICY",
    field,
    value: policy,
    message: "Seed policy must be balanced or anchored.",
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
  readonly theme: SurfaceTheme;
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

function createPrimaryUsageFamilies(
  seed: OklchValue,
  policy: SeedPolicy,
): Pick<
  PrimitiveSurfaceOutput,
  "primary-light-soft" | "primary-light-solid" | "primary-dark-soft" | "primary-dark-solid"
> {
  const chroma = clampNumber(seed.c, 0.055, 0.18);
  const hue = normalizeHue(seed.h);
  const lightSolidBase = clampNumber(seed.l, 0.42, 0.62);
  const darkSolidBase = clampNumber(seed.l + 0.2, 0.66, 0.78);

  return {
    "primary-light-soft": createUsageRamp({
      family: "primary-light-soft",
      hue,
      lightness: [0.968, 0.942, 0.912, 0.878],
      chroma: [chroma * 0.16, chroma * 0.23, chroma * 0.31, chroma * 0.42],
      description: "primary light soft",
    }),
    "primary-light-solid": createUsageRamp({
      family: "primary-light-solid",
      hue,
      lightness: createSolidLightness(seed, lightSolidBase, "light", policy),
      chroma: createSolidChroma(seed, chroma, "light", policy),
      description: "primary light solid",
      ...anchoredUsageBounds(policy),
    }),
    "primary-dark-soft": createUsageRamp({
      family: "primary-dark-soft",
      hue,
      lightness: [0.18, 0.218, 0.258, 0.302],
      chroma: [chroma * 0.28, chroma * 0.34, chroma * 0.41, chroma * 0.48],
      description: "primary dark soft",
    }),
    "primary-dark-solid": createUsageRamp({
      family: "primary-dark-solid",
      hue,
      lightness: createSolidLightness(seed, darkSolidBase, "dark", policy),
      chroma: createSolidChroma(seed, chroma, "dark", policy),
      description: "primary dark solid",
      ...anchoredUsageBounds(policy),
    }),
  };
}

function createStatusUsageFamilies(
  seeds: Readonly<Record<StatusIntent, OklchValue>>,
  policies: Readonly<Record<StatusIntent, SeedPolicy>>,
): Pick<
  PrimitiveSurfaceOutput,
  | StatusUsageFamilyName
> {
  return {
    ...createStatusIntentFamilies("danger", seeds.danger, policies.danger),
    ...createStatusIntentFamilies("warning", seeds.warning, policies.warning),
    ...createStatusIntentFamilies("success", seeds.success, policies.success),
    ...createStatusIntentFamilies("info", seeds.info, policies.info),
  };
}

function createStatusIntentFamilies(
  intent: StatusIntent,
  seed: OklchValue,
  policy: SeedPolicy,
): Record<StatusUsageFamilyName, readonly ColorToken[]> {
  const hue = normalizeHue(seed.h);
  const isWarning = intent === "warning";
  const chroma = clampNumber(seed.c, isWarning ? 0.045 : 0.06, isWarning ? 0.145 : 0.18);
  const lightSolidBase = clampNumber(seed.l + (isWarning ? 0.02 : 0), isWarning ? 0.5 : 0.42, isWarning ? 0.68 : 0.6);
  const darkSolidBase = clampNumber(seed.l + (isWarning ? 0.22 : 0.2), isWarning ? 0.7 : 0.66, isWarning ? 0.82 : 0.78);
  const lightSoftChroma: readonly [number, number, number, number] = isWarning
    ? [chroma * 0.12, chroma * 0.17, chroma * 0.24, chroma * 0.34]
    : [chroma * 0.15, chroma * 0.22, chroma * 0.3, chroma * 0.42];
  const darkSoftChroma: readonly [number, number, number, number] = isWarning
    ? [chroma * 0.18, chroma * 0.24, chroma * 0.31, chroma * 0.4]
    : [chroma * 0.26, chroma * 0.33, chroma * 0.41, chroma * 0.5];

  return {
    [`${intent}-light-soft`]: createUsageRamp({
      family: `${intent}-light-soft`,
      hue,
      lightness: isWarning ? [0.972, 0.952, 0.928, 0.898] : [0.968, 0.944, 0.916, 0.882],
      chroma: lightSoftChroma,
      description: `${intent} light soft`,
    }),
    [`${intent}-light-solid`]: createUsageRamp({
      family: `${intent}-light-solid`,
      hue,
      lightness: createSolidLightness(seed, lightSolidBase, "light", policy),
      chroma: createSolidChroma(seed, chroma, "light", policy, 0.86),
      description: `${intent} light solid`,
      ...anchoredUsageBounds(policy),
    }),
    [`${intent}-dark-soft`]: createUsageRamp({
      family: `${intent}-dark-soft`,
      hue,
      lightness: isWarning ? [0.17, 0.21, 0.252, 0.296] : [0.16, 0.2, 0.242, 0.288],
      chroma: darkSoftChroma,
      description: `${intent} dark soft`,
    }),
    [`${intent}-dark-solid`]: createUsageRamp({
      family: `${intent}-dark-solid`,
      hue,
      lightness: createSolidLightness(seed, darkSolidBase, "dark", policy),
      chroma: createSolidChroma(seed, chroma, "dark", policy, 0.72),
      description: `${intent} dark solid`,
      ...anchoredUsageBounds(policy),
    }),
  } as Record<StatusUsageFamilyName, readonly ColorToken[]>;
}

function createSolidLightness(
  seed: OklchValue,
  balancedBase: number,
  theme: SurfaceTheme,
  policy: SeedPolicy,
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

  if (theme === "light") {
    return [
      balancedBase + 0.055,
      balancedBase,
      balancedBase - 0.045,
      balancedBase - 0.085,
    ];
  }

  return [
    balancedBase + 0.045,
    balancedBase,
    balancedBase - 0.055,
    balancedBase - 0.105,
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
  theme: SurfaceTheme,
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
  readonly family: UsageFamilyName;
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
): ColorEngineOutput["semantics"] {
  return {
    light: {
      ...createNeutralSemantics(namespace, "light"),
      ...createSurfaceSemantics(namespace, "surface-light"),
      ...createPrimarySemantics(namespace, "light"),
      ...createStatusSemantics(namespace, "light"),
    },
    dark: {
      ...createNeutralSemantics(namespace, "dark"),
      ...createSurfaceSemantics(namespace, "surface-dark"),
      ...createPrimarySemantics(namespace, "dark"),
      ...createStatusSemantics(namespace, "dark"),
    },
  };
}

function createNeutralSemantics(
  namespace: string,
  theme: SurfaceTheme,
): Readonly<Record<NeutralSemanticTokenName, `var(--${string})`>> {
  if (theme === "light") {
    return {
      "text-primary": cssVar(namespace, "neutral-dark-1"),
      "text-secondary": cssVar(namespace, "neutral-dark-3"),
      "text-muted": cssVar(namespace, "neutral-dark-4"),
      "border-subtle": cssVar(namespace, "chrome-light-subtle"),
      "border-default": cssVar(namespace, "chrome-light-default"),
      "border-strong": cssVar(namespace, "chrome-light-strong"),
      "control-border": cssVar(namespace, "chrome-light-default"),
      "control-bg": cssVar(namespace, "surface-light-1"),
      "control-bg-hover": cssVar(namespace, "surface-light-2-hover"),
      "control-text": cssVar(namespace, "neutral-dark-1"),
    };
  }

  return {
    "text-primary": cssVar(namespace, "neutral-light-4"),
    "text-secondary": cssVar(namespace, "neutral-light-2"),
    "text-muted": cssVar(namespace, "neutral-light-1"),
    "border-subtle": cssVar(namespace, "chrome-dark-subtle"),
    "border-default": cssVar(namespace, "chrome-dark-default"),
    "border-strong": cssVar(namespace, "chrome-dark-strong"),
    "control-border": cssVar(namespace, "chrome-dark-default"),
    "control-bg": cssVar(namespace, "surface-dark-2"),
    "control-bg-hover": cssVar(namespace, "surface-dark-3-hover"),
    "control-text": cssVar(namespace, "neutral-light-4"),
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
  theme: SurfaceTheme,
): Readonly<Record<PrimarySemanticTokenName, `var(--${string})`>> {
  if (theme === "light") {
    return {
      "primary-action-bg": cssVar(namespace, "primary-light-solid-2"),
      "primary-action-bg-hover": cssVar(namespace, "primary-light-solid-3"),
      "primary-action-bg-pressed": cssVar(namespace, "primary-light-solid-4"),
      "primary-action-text": cssVar(namespace, "surface-light-1"),
      "primary-link": cssVar(namespace, "primary-light-solid-2"),
      "primary-link-hover": cssVar(namespace, "primary-light-solid-3"),
      "primary-focus-ring": cssVar(namespace, "primary-light-solid-1"),
      "primary-soft-bg": cssVar(namespace, "primary-light-soft-1"),
      "primary-soft-bg-hover": cssVar(namespace, "primary-light-soft-2"),
      "primary-soft-border": cssVar(namespace, "primary-light-soft-4"),
      "primary-soft-text": cssVar(namespace, "primary-light-solid-4"),
    };
  }

  return {
    "primary-action-bg": cssVar(namespace, "primary-dark-solid-2"),
    "primary-action-bg-hover": cssVar(namespace, "primary-dark-solid-1"),
    "primary-action-bg-pressed": cssVar(namespace, "primary-dark-solid-3"),
    "primary-action-text": cssVar(namespace, "surface-dark-1"),
    "primary-link": cssVar(namespace, "primary-dark-solid-2"),
    "primary-link-hover": cssVar(namespace, "primary-dark-solid-1"),
    "primary-focus-ring": cssVar(namespace, "primary-dark-solid-1"),
    "primary-soft-bg": cssVar(namespace, "primary-dark-soft-1"),
    "primary-soft-bg-hover": cssVar(namespace, "primary-dark-soft-2"),
    "primary-soft-border": cssVar(namespace, "primary-dark-soft-4"),
    "primary-soft-text": cssVar(namespace, "primary-dark-solid-1"),
  };
}

function createStatusSemantics(
  namespace: string,
  theme: SurfaceTheme,
): Readonly<Record<StatusSemanticTokenName, `var(--${string})`>> {
  const entries: [StatusSemanticTokenName, `var(--${string})`][] = [];
  const themePrefix = theme === "light" ? "light" : "dark";

  for (const intent of STATUS_INTENTS) {
    const softFamily = `${intent}-${themePrefix}-soft`;
    const solidFamily = `${intent}-${themePrefix}-solid`;

    entries.push([`${intent}-soft-bg`, cssVar(namespace, `${softFamily}-1`)]);
    entries.push([`${intent}-soft-bg-hover`, cssVar(namespace, `${softFamily}-2`)]);
    entries.push([`${intent}-soft-border`, cssVar(namespace, `${softFamily}-4`)]);
    entries.push([`${intent}-soft-text`, cssVar(namespace, `${solidFamily}-${theme === "light" ? 4 : 1}`)]);
    entries.push([`${intent}-solid-bg`, cssVar(namespace, `${solidFamily}-2`)]);
    entries.push([`${intent}-solid-bg-hover`, cssVar(namespace, `${solidFamily}-${theme === "light" ? 3 : 1}`)]);
    entries.push([`${intent}-solid-bg-pressed`, cssVar(namespace, `${solidFamily}-${theme === "light" ? 4 : 3}`)]);
    entries.push([`${intent}-solid-text`, cssVar(namespace, theme === "light" ? "surface-light-1" : "surface-dark-1")]);
  }

  return Object.fromEntries(entries) as Record<StatusSemanticTokenName, `var(--${string})`>;
}

function createCssOutput(
  namespace: string,
  primitives: PrimitiveSurfaceOutput,
  semantics: ColorEngineOutput["semantics"],
  preset: SurfacePreset,
): ColorEngineCssOutput {
  const primitiveCss = createPrimitiveCss(namespace, primitives, preset);
  const themeCss = {
    light: createThemeCss(namespace, "light", semantics.light),
    dark: createThemeCss(namespace, "dark", semantics.dark),
  } as const satisfies Readonly<Record<SurfaceTheme, string>>;

  return {
    primitives: primitiveCss,
    themes: themeCss,
    all: [primitiveCss, themeCss.light, themeCss.dark].join("\n\n"),
  };
}

function createPrimitiveCss(
  namespace: string,
  primitives: PrimitiveSurfaceOutput,
  preset: SurfacePreset,
): string {
  const declarations: [string, string][] = [];

  for (const tokens of Object.values(primitives)) {
    for (const token of tokens) {
      declarations.push([`--${namespace}-${token.name}`, token.value]);
      if (!token.name.endsWith("-seed")) {
        for (const state of SURFACE_STATES) {
          declarations.push([
            `--${namespace}-${token.name}-${state}`,
            createStateValue(token.oklch, state, token.name.includes("-light-"), preset),
          ]);
        }
      }
    }
  }

  return createCssRule(":root", declarations);
}

function createThemeCss(
  namespace: string,
  theme: SurfaceTheme,
  semantics: Readonly<Record<SemanticTokenName, `var(--${string})`>>,
): string {
  return createCssRule(
    `[data-theme-v2="${theme}"]`,
    Object.entries(semantics).map(([name, value]) => [`--${namespace}-${name}`, value]),
  );
}

function createStateValue(
  base: OklchValue,
  state: SurfaceState,
  isLightSurface: boolean,
  preset: SurfacePreset,
): `oklch(${string})` {
  const multiplier = state === "hover" ? 1 : state === "selected" ? 1.65 : 2.2;
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
