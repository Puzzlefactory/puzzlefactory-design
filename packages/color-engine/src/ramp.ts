import type { Mood, OklchValue, RampTone, Step, TaperConfig } from "./index.js";
import { ColorEngineValidationError } from "./errors.js";
import { reduceChromaToGamut } from "./gamut.js";

export interface RampStep {
  readonly step: Step;
  readonly tone: RampTone;
  readonly oklch: OklchValue;
  readonly targetChroma: number;
  readonly gamutMapped: boolean;
  readonly chromaReduction: number;
}

export interface ColorRamp {
  readonly light: readonly RampStep[];
  readonly dark: readonly RampStep[];
}

export interface GenerateRampOptions {
  readonly hue: number;
  readonly mood?: Mood;
  readonly taperParams?: Partial<TaperConfig>;
  readonly darkHueShift?: number;
  readonly chromaScale?: number;
}

export const DEFAULT_TAPER_CONFIG: TaperConfig = {
  lightUpperFadeStart: 0.7,
  lightUpperFadeEnd: 0.92,
  lightLowerFadeStart: 0.55,
  lightLowerFadeEnd: 0.68,
  darkUpperFadeStart: 0.42,
  darkUpperFadeEnd: 0.55,
  darkLowerFadeStart: 0.08,
  darkLowerFadeEnd: 0.25,
};

export function generateRamp(options: GenerateRampOptions): ColorRamp {
  const taper = resolveTaperConfig(options.taperParams);
  const scale = options.chromaScale ?? moodScale(options.mood ?? "vibrant");

  return {
    light: generateToneRamp("l", options.hue, scale, taper, 0),
    dark: generateToneRamp("d", options.hue, scale, taper, options.darkHueShift ?? 0),
  };
}

export function resolveTaperConfig(overrides: Partial<TaperConfig> = {}): TaperConfig {
  const taper = {
    ...DEFAULT_TAPER_CONFIG,
    ...overrides,
  };

  validateTaperPair(taper, "lightUpperFadeStart", "lightUpperFadeEnd");
  validateTaperPair(taper, "lightLowerFadeStart", "lightLowerFadeEnd");
  validateTaperPair(taper, "darkUpperFadeStart", "darkUpperFadeEnd");
  validateTaperPair(taper, "darkLowerFadeStart", "darkLowerFadeEnd");

  return taper;
}

export function moodScale(mood: Mood): number {
  switch (mood) {
    case "vibrant":
      return 1;
    case "muted":
      return 0.5;
    case "neutral":
      return 0.1;
  }
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);

  return t * t * (3 - 2 * t);
}

export function lightRampLightness(step: Step): number {
  return interpolateRampEndpoint(0.92, 0.55, step);
}

export function darkRampLightness(step: Step): number {
  return interpolateRampEndpoint(0.55, 0.08, step);
}

export function applyDarkHueShift(hue: number, lightness: number, shift: number): number {
  if (lightness >= 0.3 || shift === 0) {
    return normalizeHue(hue);
  }

  const t = clamp((0.3 - lightness) / (0.3 - 0.08), 0, 1);

  return normalizeHue(hue + shift * t);
}

function generateToneRamp(
  tone: RampTone,
  hue: number,
  scale: number,
  taper: TaperConfig,
  darkHueShift: number,
): readonly RampStep[] {
  return RAMP_STEPS.map((step) => {
    const lightness = tone === "l" ? lightRampLightness(step) : darkRampLightness(step);
    const shiftedHue = tone === "d" ? applyDarkHueShift(hue, lightness, darkHueShift) : normalizeHue(hue);
    const maxChroma = maxSrgbChroma(lightness, shiftedHue);
    const taperedChroma =
      maxChroma * scale * chromaTaper(tone, lightness, taper);
    const mapped = reduceChromaToGamut(
      {
        l: lightness,
        c: taperedChroma,
        h: shiftedHue,
      },
      "srgb",
    );

    return {
      step,
      tone,
      oklch: mapped.mapped,
      targetChroma: taperedChroma,
      gamutMapped: mapped.wasMapped,
      chromaReduction: mapped.chromaReduction,
    };
  });
}

function validateTaperPair(
  taper: TaperConfig,
  startKey: keyof TaperConfig,
  endKey: keyof TaperConfig,
): void {
  if (!Number.isFinite(taper[startKey]) || !Number.isFinite(taper[endKey])) {
    throw new ColorEngineValidationError({
      code: "INVALID_TAPER_CONFIG",
      field: `taperParams.${String(startKey)}`,
      value: taper,
      message: `${String(startKey)} and ${String(endKey)} must be finite numbers.`,
    });
  }

  if (taper[startKey] >= taper[endKey]) {
    throw new ColorEngineValidationError({
      code: "INVALID_TAPER_CONFIG",
      field: `taperParams.${String(startKey)}`,
      value: taper,
      message: `${String(startKey)} must be less than ${String(endKey)}.`,
    });
  }
}

function interpolateRampEndpoint(start: number, end: number, step: Step): number {
  return roundChannel(start + ((end - start) * (step - 1)) / 11);
}

function chromaTaper(tone: RampTone, lightness: number, taper: TaperConfig): number {
  if (tone === "l") {
    return (
      (1 - smoothstep(taper.lightUpperFadeStart, taper.lightUpperFadeEnd, lightness)) *
      smoothstep(taper.lightLowerFadeStart, taper.lightLowerFadeEnd, lightness)
    );
  }

  return (
    smoothstep(taper.darkLowerFadeStart, taper.darkLowerFadeEnd, lightness) *
    (1 - smoothstep(taper.darkUpperFadeStart, taper.darkUpperFadeEnd, lightness))
  );
}

function maxSrgbChroma(lightness: number, hue: number): number {
  const gamutBoundary = reduceChromaToGamut({ l: lightness, c: 0.5, h: hue }, "srgb");

  return gamutBoundary.mapped.c;
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundChannel(value: number): number {
  return Math.round(value * 1_000_000_000_000) / 1_000_000_000_000;
}

const RAMP_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
