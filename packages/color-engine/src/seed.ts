import type { EngineWarning, OklchValue, SrgbColor, WarningCode } from "./index.js";
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

interface LinearSrgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

interface XyzD65Color {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface OklabValue {
  readonly l: number;
  readonly a: number;
  readonly b: number;
}

const NUMBER_PATTERN = "[+-]?(?:\\d*\\.\\d+|\\d+\\.?\\d*)";
const OKLCH_PATTERN = new RegExp(
  `^oklch\\(\\s*(${NUMBER_PATTERN})\\s+(${NUMBER_PATTERN})\\s+(${NUMBER_PATTERN})(?:deg)?\\s*\\)$`,
  "i",
);
const RGB_COMMA_PATTERN = new RegExp(
  `^rgb\\(\\s*(${NUMBER_PATTERN})\\s*,\\s*(${NUMBER_PATTERN})\\s*,\\s*(${NUMBER_PATTERN})\\s*\\)$`,
  "i",
);
const RGB_SPACE_PATTERN = new RegExp(
  `^rgb\\(\\s*(${NUMBER_PATTERN})\\s+(${NUMBER_PATTERN})\\s+(${NUMBER_PATTERN})\\s*\\)$`,
  "i",
);
const HUE_PATTERN = `(${NUMBER_PATTERN})(deg|rad|grad|turn)?`;
const HSL_COMMA_PATTERN = new RegExp(
  `^hsl\\(\\s*${HUE_PATTERN}\\s*,\\s*(${NUMBER_PATTERN})%\\s*,\\s*(${NUMBER_PATTERN})%\\s*\\)$`,
  "i",
);
const HSL_SPACE_PATTERN = new RegExp(
  `^hsl\\(\\s*${HUE_PATTERN}\\s+(${NUMBER_PATTERN})%\\s+(${NUMBER_PATTERN})%\\s*\\)$`,
  "i",
);
const OKLAB_CHROMA_EPSILON = 0.000004;

export function detectSeedFormat(seed: string): ParsedSeedFormat {
  const value = seed.trim();

  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    return { format: "hex", value };
  }

  if (parseRgbChannels(value)) {
    return { format: "rgb", value };
  }

  if (parseHslChannels(value)) {
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

export function normalizeSeed(seed: string): OklchValue {
  return normalizeParsedSeed(detectSeedFormat(seed));
}

export function normalizeParsedSeed(seed: ParsedSeedFormat): OklchValue {
  switch (seed.format) {
    case "hex":
      return srgbToOklch(parseHexSeed(seed.value));
    case "rgb":
      return srgbToOklch(parseRgbSeed(seed.value));
    case "hsl":
      return srgbToOklch(parseHslSeed(seed.value));
    case "oklch":
      return parseOklchSeed(seed.value);
  }
}

export function parseHexSeed(seed: string): SrgbColor {
  const value = seed.trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);

  if (!match) {
    throw invalidSeedFormat(seed);
  }

  const hex = match[1] ?? "";
  const channels =
    hex.length === 3
      ? [...hex].map((channel) => Number.parseInt(`${channel}${channel}`, 16))
      : [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((channel) =>
          Number.parseInt(channel, 16),
        );
  const [r, g, b] = channels as [number, number, number];

  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
  };
}

export function parseRgbSeed(seed: string): SrgbColor {
  const channels = parseRgbChannels(seed.trim());

  if (!channels) {
    throw invalidSeedFormat(seed);
  }

  const [r, g, b] = channels as [number, number, number];

  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
  };
}

export function parseHslSeed(seed: string): SrgbColor {
  const channels = parseHslChannels(seed.trim());

  if (!channels) {
    throw invalidSeedFormat(seed);
  }

  const { hue, saturation, lightness } = channels;
  const sat = saturation / 100;
  const light = lightness / 100;
  const f = (n: number): number => {
    const k = (n + normalizeHue(hue) / 30) % 12;
    const a = sat * Math.min(light, 1 - light);

    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };

  return {
    r: f(0),
    g: f(8),
    b: f(4),
  };
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

export function srgbToOklch(srgb: SrgbColor): OklchValue {
  const linear = {
    r: linearizeSrgbChannel(srgb.r),
    g: linearizeSrgbChannel(srgb.g),
    b: linearizeSrgbChannel(srgb.b),
  };

  const xyz = linearSrgbToXyz(linear);
  const oklab = xyzToOklab(xyz);
  const c = Math.sqrt(oklab.a ** 2 + oklab.b ** 2);
  const h =
    c <= OKLAB_CHROMA_EPSILON
      ? 0
      : normalizeHue((Math.atan2(oklab.b, oklab.a) * 180) / Math.PI);

  return {
    l: oklab.l,
    c,
    h,
  };
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

function invalidSeedFormat(seed: string): ColorEngineValidationError {
  return new ColorEngineValidationError({
    code: "INVALID_SEED_FORMAT",
    field: "seed",
    value: seed,
    message:
      "Seed must be #rgb, #rrggbb, rgb(r, g, b), hsl(h, s%, l%), or oklch(L C H).",
  });
}

function parseRgbChannels(seed: string): readonly [number, number, number] | undefined {
  const match = RGB_COMMA_PATTERN.exec(seed) ?? RGB_SPACE_PATTERN.exec(seed);

  if (!match) {
    return undefined;
  }

  const channels = match.slice(1).map(Number);

  if (!channels.every(isRgbChannel)) {
    return undefined;
  }

  return channels as [number, number, number];
}

function parseHslChannels(
  seed: string,
): { readonly hue: number; readonly saturation: number; readonly lightness: number } | undefined {
  const match = HSL_COMMA_PATTERN.exec(seed) ?? HSL_SPACE_PATTERN.exec(seed);

  if (!match) {
    return undefined;
  }

  const hue = parseHue(Number(match[1]), match[2]);
  const saturation = Number(match[3]);
  const lightness = Number(match[4]);

  if (!isHueDegrees(hue) || !isPercent(saturation) || !isPercent(lightness)) {
    return undefined;
  }

  return {
    hue,
    saturation,
    lightness,
  };
}

function parseHue(value: number, unit: string | undefined): number {
  switch (unit?.toLowerCase()) {
    case undefined:
    case "deg":
      return value;
    case "rad":
      return (value * 180) / Math.PI;
    case "grad":
      return value * 0.9;
    case "turn":
      return value * 360;
    default:
      return Number.NaN;
  }
}

function linearizeSrgbChannel(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);

  if (abs <= 0.04045) {
    return value / 12.92;
  }

  return sign * ((abs + 0.055) / 1.055) ** 2.4;
}

function linearSrgbToXyz(rgb: LinearSrgbColor): XyzD65Color {
  return {
    x:
      (506752 / 1228815) * rgb.r +
      (87881 / 245763) * rgb.g +
      (12673 / 70218) * rgb.b,
    y:
      (87098 / 409605) * rgb.r +
      (175762 / 245763) * rgb.g +
      (12673 / 175545) * rgb.b,
    z:
      (7918 / 409605) * rgb.r +
      (87881 / 737289) * rgb.g +
      (1001167 / 1053270) * rgb.b,
  };
}

function xyzToOklab(xyz: XyzD65Color): OklabValue {
  const lms = {
    l: 0.819022437996703 * xyz.x + 0.3619062600528904 * xyz.y - 0.1288737815209879 * xyz.z,
    m: 0.0329836539323885 * xyz.x + 0.9292868615863434 * xyz.y + 0.0361446663506424 * xyz.z,
    s: 0.0481771893596242 * xyz.x + 0.2642395317527308 * xyz.y + 0.6335478284694309 * xyz.z,
  };
  const lmsPrime = {
    l: Math.cbrt(lms.l),
    m: Math.cbrt(lms.m),
    s: Math.cbrt(lms.s),
  };

  return {
    l:
      0.210454268309314 * lmsPrime.l +
      0.7936177747023054 * lmsPrime.m -
      0.0040720430116193 * lmsPrime.s,
    a:
      1.9779985324311684 * lmsPrime.l -
      2.4285922420485799 * lmsPrime.m +
      0.450593709617411 * lmsPrime.s,
    b:
      0.0259040424655478 * lmsPrime.l +
      0.7827717124575296 * lmsPrime.m -
      0.8086757549230774 * lmsPrime.s,
  };
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function isRgbChannel(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 255;
}

function isHueDegrees(value: number): boolean {
  return Number.isFinite(value);
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
