export type ColorSeed = `#${string}` | `oklch(${string})`;

export type SurfacePresetName =
  | "quiet"
  | "standard"
  | "layered"
  | "high-separation";

export type SurfaceTheme = "light" | "dark";

export type SurfaceLevel = 1 | 2 | 3 | 4;

export type SurfaceState = "hover" | "selected" | "pressed";

export type PrimaryUsageFamilyName =
  | "primary-light-soft"
  | "primary-light-solid"
  | "primary-dark-soft"
  | "primary-dark-solid";

export type PrimitiveFamilyName =
  | "neutral-light"
  | "neutral-dark"
  | "surface-light"
  | "surface-dark"
  | PrimaryUsageFamilyName;

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

export type SemanticTokenName = SurfaceSemanticTokenName | PrimarySemanticTokenName;

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
  readonly "primary-light-soft": readonly ColorToken[];
  readonly "primary-light-solid": readonly ColorToken[];
  readonly "primary-dark-soft": readonly ColorToken[];
  readonly "primary-dark-solid": readonly ColorToken[];
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
  };
  readonly primitives: PrimitiveSurfaceOutput;
  readonly semantics: Readonly<Record<SurfaceTheme, Readonly<Record<SemanticTokenName, `var(--${string})`>>>>;
  readonly css: string;
}

export type ValidationErrorCode =
  | "INVALID_SEED"
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

const DEFAULT_INPUT = {
  neutralSeed: "oklch(0.86 0.012 255)",
  surfaceLightSeed: "oklch(0.94 0.01 255)",
  surfaceDarkSeed: "oklch(0.12 0.012 255)",
  primarySeed: "#0f6f3d",
  preset: "standard",
  namespace: "ds",
} as const satisfies Required<ColorEngineInput>;

const SURFACE_LEVELS = [1, 2, 3, 4] as const satisfies readonly SurfaceLevel[];
const SURFACE_STATES = ["hover", "selected", "pressed"] as const satisfies readonly SurfaceState[];

export function createColorEngineTheme(input: ColorEngineInput = {}): ColorEngineOutput {
  const resolvedInput = resolveInput(input);
  const preset = SURFACE_PRESETS[resolvedInput.preset];
  const neutralSeed = parseColorSeed(resolvedInput.neutralSeed, "neutralSeed");
  const surfaceLightSeed = parseColorSeed(resolvedInput.surfaceLightSeed, "surfaceLightSeed");
  const surfaceDarkSeed = parseColorSeed(resolvedInput.surfaceDarkSeed, "surfaceDarkSeed");
  const primarySeed = parseColorSeed(resolvedInput.primarySeed, "primarySeed");
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
  const primary = createPrimaryUsageFamilies(primarySeed);
  const primitives: PrimitiveSurfaceOutput = {
    "neutral-light": neutralLight,
    "neutral-dark": neutralDark,
    "surface-light": surfaceLight,
    "surface-dark": surfaceDark,
    ...primary,
  };
  const semantics = createSemantics(resolvedInput.namespace);

  return {
    namespace: resolvedInput.namespace,
    preset,
    input: resolvedInput,
    seeds: {
      neutral: neutralSeed,
      surfaceLight: surfaceLightSeed,
      surfaceDark: surfaceDarkSeed,
      primary: primarySeed,
    },
    primitives,
    semantics,
    css: createCss(resolvedInput.namespace, primitives, semantics, preset),
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

  return {
    neutralSeed: input.neutralSeed ?? DEFAULT_INPUT.neutralSeed,
    surfaceLightSeed: input.surfaceLightSeed ?? DEFAULT_INPUT.surfaceLightSeed,
    surfaceDarkSeed: input.surfaceDarkSeed ?? DEFAULT_INPUT.surfaceDarkSeed,
    primarySeed: input.primarySeed ?? DEFAULT_INPUT.primarySeed,
    preset,
    namespace,
  };
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

function createPrimaryUsageFamilies(
  seed: OklchValue,
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
      lightness: [
        lightSolidBase + 0.055,
        lightSolidBase,
        lightSolidBase - 0.045,
        lightSolidBase - 0.085,
      ],
      chroma: [chroma * 0.88, chroma, chroma * 1.03, chroma * 1.05],
      description: "primary light solid",
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
      lightness: [
        darkSolidBase + 0.045,
        darkSolidBase,
        darkSolidBase - 0.055,
        darkSolidBase - 0.105,
      ],
      chroma: [chroma * 0.75, chroma * 0.82, chroma * 0.9, chroma],
      description: "primary dark solid",
    }),
  };
}

function createUsageRamp(options: {
  readonly family: PrimaryUsageFamilyName;
  readonly hue: number;
  readonly lightness: readonly [number, number, number, number];
  readonly chroma: readonly [number, number, number, number];
  readonly description: string;
}): readonly ColorToken[] {
  return options.lightness.map((lightness, index) => {
    const level = (index + 1) as SurfaceLevel;
    const chroma = options.chroma[index] ?? options.chroma[3];
    const oklch = {
      l: roundChannel(clampNumber(lightness, 0.02, 0.998)),
      c: roundChannel(clampNumber(chroma, 0, 0.22)),
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
      ...createSurfaceSemantics(namespace, "surface-light"),
      ...createPrimarySemantics(namespace, "light"),
    },
    dark: {
      ...createSurfaceSemantics(namespace, "surface-dark"),
      ...createPrimarySemantics(namespace, "dark"),
    },
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

function createCss(
  namespace: string,
  primitives: PrimitiveSurfaceOutput,
  semantics: ColorEngineOutput["semantics"],
  preset: SurfacePreset,
): string {
  return [
    createPrimitiveCss(namespace, primitives, preset),
    createThemeCss(namespace, "light", semantics.light),
    createThemeCss(namespace, "dark", semantics.dark),
  ].join("\n\n");
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
      for (const state of SURFACE_STATES) {
        declarations.push([
          `--${namespace}-${token.name}-${state}`,
          createStateValue(token.oklch, state, token.name.includes("-light-"), preset),
        ]);
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
