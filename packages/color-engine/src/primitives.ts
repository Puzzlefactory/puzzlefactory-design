import type {
  HarmonyStrategy,
  Mood,
  OklchValue,
  PaletteSlot,
  PrimitiveColorToken,
  PrimitiveTokenName,
  RampTone,
  StatusHueAnchors,
  StatusName,
  StatusSlot,
  Step,
  TaperConfig,
} from "./index.js";
import {
  clampRgbToGamut,
  oklchToLinearDisplayP3,
  reduceChromaToGamut,
} from "./gamut.js";
import { deriveHarmony } from "./harmony.js";
import {
  darkRampLightness,
  generateRamp,
  lightRampLightness,
  type GenerateRampOptions,
  type RampStep,
} from "./ramp.js";

export interface AssemblePrimitiveTokensOptions {
  readonly seed: OklchValue;
  readonly harmony: HarmonyStrategy;
  readonly mood?: Mood;
  readonly statusHues?: Partial<StatusHueAnchors>;
  readonly darkHueShift?: Partial<Record<PaletteSlot, number>>;
  readonly taperParams?: Partial<TaperConfig>;
}

export interface PrimitiveTokenInventory {
  readonly tokens: readonly PrimitiveColorToken[];
  readonly byName: ReadonlyMap<PrimitiveTokenName, PrimitiveColorToken>;
  readonly gamutMappings: readonly PrimitiveTokenGamutMapping[];
}

export interface PrimitiveTokenGamutMapping {
  readonly name: PrimitiveTokenName;
  readonly slot: PaletteSlot;
  readonly chromaReduction: number;
}

interface PrimitiveTokenBuild {
  readonly token: PrimitiveColorToken;
  readonly gamutMapping?: PrimitiveTokenGamutMapping;
}

export const DEFAULT_STATUS_HUES: StatusHueAnchors = {
  danger: 29,
  warning: 65,
  success: 145,
  info: 245,
};

const STATUS_SLOT_BY_NAME: Readonly<Record<StatusName, StatusSlot>> = {
  danger: "status-danger",
  warning: "status-warning",
  success: "status-success",
  info: "status-info",
};

export function assemblePrimitiveTokens(
  options: AssemblePrimitiveTokensOptions,
): PrimitiveTokenInventory {
  const builds = [
    ...assemblePalettePrimitiveTokenBuilds(options),
    ...assembleNeutralPrimitiveTokenBuilds(options.seed),
    ...assembleStatusPrimitiveTokenBuilds(options),
  ];
  const tokens = builds.map((build) => build.token);

  return {
    tokens,
    byName: new Map(tokens.map((token) => [token.name, token])),
    gamutMappings: builds.flatMap((build) =>
      build.gamutMapping === undefined ? [] : [build.gamutMapping],
    ),
  };
}

export function assemblePalettePrimitiveTokens(
  options: AssemblePrimitiveTokensOptions,
): readonly PrimitiveColorToken[] {
  return assemblePalettePrimitiveTokenBuilds(options).map((build) => build.token);
}

function assemblePalettePrimitiveTokenBuilds(
  options: AssemblePrimitiveTokensOptions,
): readonly PrimitiveTokenBuild[] {
  const harmonyOptions = {
    hue: options.seed.h,
    strategy: options.harmony,
    ...(options.mood === undefined ? {} : { mood: options.mood }),
  };

  return deriveHarmony(harmonyOptions).flatMap((descriptor) => {
    const ramp = generateRamp({
      hue: descriptor.hue,
      chromaScale: descriptor.chromaScale,
      ...rampOptionOverrides(options.darkHueShift?.[descriptor.slot], options.taperParams),
    });

    return rampToPrimitiveTokenBuilds(descriptor.slot, ramp.light, ramp.dark);
  });
}

export function assembleNeutralPrimitiveTokens(seed: OklchValue): readonly PrimitiveColorToken[] {
  return assembleNeutralPrimitiveTokenBuilds(seed).map((build) => build.token);
}

function assembleNeutralPrimitiveTokenBuilds(seed: OklchValue): readonly PrimitiveTokenBuild[] {
  const light = RAMP_STEPS.map((step) =>
    createFixedChromaRampStep("l", step, {
      l: lightRampLightness(step),
      c: 0.015,
      h: seed.h,
    }),
  );
  const dark = RAMP_STEPS.map((step) =>
    createFixedChromaRampStep("d", step, {
      l: darkRampLightness(step),
      c: 0.012,
      h: seed.h,
    }),
  );

  return rampToPrimitiveTokenBuilds("neutral", light, dark);
}

export function assembleStatusPrimitiveTokens(
  options: Pick<AssemblePrimitiveTokensOptions, "statusHues" | "darkHueShift" | "taperParams">,
): readonly PrimitiveColorToken[] {
  return assembleStatusPrimitiveTokenBuilds(options).map((build) => build.token);
}

function assembleStatusPrimitiveTokenBuilds(
  options: Pick<AssemblePrimitiveTokensOptions, "statusHues" | "darkHueShift" | "taperParams">,
): readonly PrimitiveTokenBuild[] {
  const statusHues = {
    ...DEFAULT_STATUS_HUES,
    ...options.statusHues,
  };

  return STATUS_NAMES.flatMap((statusName) => {
    const slot = STATUS_SLOT_BY_NAME[statusName];
    const ramp = generateRamp({
      hue: statusHues[statusName],
      chromaScale: 1,
      ...rampOptionOverrides(options.darkHueShift?.[slot], options.taperParams),
    });

    return rampToPrimitiveTokenBuilds(slot, ramp.light, ramp.dark);
  });
}

function rampOptionOverrides(
  darkHueShift: number | undefined,
  taperParams: Partial<TaperConfig> | undefined,
): Pick<GenerateRampOptions, "darkHueShift" | "taperParams"> {
  return {
    ...(darkHueShift === undefined ? {} : { darkHueShift }),
    ...(taperParams === undefined ? {} : { taperParams }),
  };
}

function createFixedChromaRampStep(
  tone: RampTone,
  step: Step,
  color: OklchValue,
): RampStep {
  const mapped = reduceChromaToGamut(color, "srgb");

  return {
    step,
    tone,
    oklch: mapped.mapped,
    targetChroma: color.c,
    gamutMapped: mapped.wasMapped,
    chromaReduction: mapped.chromaReduction,
  };
}

function rampToPrimitiveTokenBuilds(
  slot: PaletteSlot,
  light: readonly RampStep[],
  dark: readonly RampStep[],
): readonly PrimitiveTokenBuild[] {
  return [
    ...light.map((step) => rampStepToPrimitiveTokenBuild(slot, step)),
    ...dark.map((step) => rampStepToPrimitiveTokenBuild(slot, step)),
  ];
}

function rampStepToPrimitiveTokenBuild(
  slot: PaletteSlot,
  step: RampStep,
): PrimitiveTokenBuild {
  const originalTarget = {
    l: step.oklch.l,
    c: step.targetChroma,
    h: step.oklch.h,
  };

  const token: PrimitiveColorToken = {
    name: `${slot}-${step.tone}-${step.step}` as PrimitiveTokenName,
    slot,
    tone: step.tone,
    step: step.step,
    oklch: step.oklch,
    srgb: formatOklch(step.oklch),
    p3: formatDisplayP3(reduceChromaToGamut(originalTarget, "display-p3").mapped),
  };

  return {
    token,
    ...(step.gamutMapped
      ? {
          gamutMapping: {
            name: token.name,
            slot,
            chromaReduction: step.chromaReduction,
          },
        }
      : {}),
  };
}

function formatOklch(color: OklchValue): `oklch(${string})` {
  return `oklch(${formatNumber(color.l)} ${formatNumber(color.c)} ${formatNumber(color.h)})`;
}

function formatDisplayP3(color: OklchValue): `color(display-p3 ${string})` {
  const rgb = clampRgbToGamut(oklchToLinearDisplayP3(color));

  return `color(display-p3 ${formatNumber(rgb.r)} ${formatNumber(rgb.g)} ${formatNumber(rgb.b)})`;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(6)).toString();
}

const RAMP_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const STATUS_NAMES = ["danger", "warning", "success", "info"] as const;
