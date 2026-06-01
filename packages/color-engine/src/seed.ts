import type { EngineWarning, OklchValue, WarningCode } from "./index.js";
import { ColorEngineValidationError } from "./errors.js";

export type SeedFormat = "hex" | "rgb" | "hsl" | "oklch";

export interface ParsedSeedFormat {
  readonly format: SeedFormat;
  readonly value: string;
}

export interface OklchSeedValidationResult {
  readonly normalizedSeed: OklchValue;
  readonly adjustedSeed: OklchValue;
  readonly seedAdjusted: boolean;
  readonly warnings: readonly EngineWarning[];
}

const NUMBER_PATTERN = "[+-]?(?:\\d*\\.\\d+|\\d+\\.?\\d*)";
const OKLCH_PATTERN = new RegExp(
  `^oklch\\(\\s*(${NUMBER_PATTERN})\\s+(${NUMBER_PATTERN})\\s+(${NUMBER_PATTERN})(?:deg)?\\s*\\)$`,
  "i",
);

export function detectSeedFormat(seed: string): ParsedSeedFormat {
  const value = seed.trim();

  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    return { format: "hex", value };
  }

  const rgbMatch = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(
    value,
  );
  if (rgbMatch && rgbMatch.slice(1).every((channel) => isByte(Number(channel)))) {
    return { format: "rgb", value };
  }

  const hslMatch =
    /^hsl\(\s*([+-]?(?:\d*\.?\d+))\s*,\s*([+-]?(?:\d*\.?\d+))%\s*,\s*([+-]?(?:\d*\.?\d+))%\s*\)$/i.exec(
      value,
    );
  if (
    hslMatch &&
    isHueDegrees(Number(hslMatch[1])) &&
    isPercent(Number(hslMatch[2])) &&
    isPercent(Number(hslMatch[3]))
  ) {
    return { format: "hsl", value };
  }

  if (OKLCH_PATTERN.test(value)) {
    return { format: "oklch", value };
  }

  throw new ColorEngineValidationError({
    code: "INVALID_SEED_FORMAT",
    field: "seed",
    value: seed,
    message:
      "Seed must be #rgb, #rrggbb, rgb(r, g, b), hsl(h, s%, l%), or oklch(L C H).",
  });
}

export function parseOklchSeed(seed: string): OklchValue {
  const value = seed.trim();
  const match = OKLCH_PATTERN.exec(value);

  if (!match) {
    throw new ColorEngineValidationError({
      code: "INVALID_SEED_FORMAT",
      field: "seed",
      value: seed,
      message: "Seed is not a valid oklch(L C H) value.",
    });
  }

  const [, l, c, h] = match;
  const parsed = {
    l: Number(l),
    c: Number(c),
    h: normalizeHue(Number(h)),
  };

  if (!isFiniteNumber(parsed.l) || !isFiniteNumber(parsed.c) || !isFiniteNumber(parsed.h)) {
    throw new ColorEngineValidationError({
      code: "INVALID_SEED_FORMAT",
      field: "seed",
      value: seed,
      message: "OKLCH seed channels must be finite numbers.",
    });
  }

  return parsed;
}

export function validateOklchSeed(seed: OklchValue): OklchSeedValidationResult {
  if (seed.c < 0.04) {
    throw new ColorEngineValidationError({
      code: "ACHROMATIC_SEED",
      field: "seed",
      value: seed,
      message: "Seed chroma must be at least 0.04.",
    });
  }

  const adjustedL = clamp(seed.l, 0.25, 0.75);
  const adjustedSeed = { ...seed, l: adjustedL };
  const seedAdjusted = adjustedL !== seed.l;
  const warnings: EngineWarning[] = [];

  if (seedAdjusted) {
    warnings.push(createSeedWarning("SEED_LIGHTNESS_CLAMPED", seed));
  }

  if ((seed.l >= 0.08 && seed.l < 0.25) || (seed.l > 0.75 && seed.l <= 0.92)) {
    warnings.push(createSeedWarning("SEED_LIGHTNESS_EDGE", seed));
  }

  return {
    normalizedSeed: seed,
    adjustedSeed,
    seedAdjusted,
    warnings,
  };
}

function createSeedWarning(code: WarningCode, seed: OklchValue): EngineWarning {
  return {
    code,
    message:
      code === "SEED_LIGHTNESS_CLAMPED"
        ? "Seed lightness was clamped into the supported range."
        : "Seed lightness is near the supported edge range.",
    data: {
      originalL: seed.l,
    },
  };
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function isByte(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}

function isHueDegrees(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 360;
}

function isPercent(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}
