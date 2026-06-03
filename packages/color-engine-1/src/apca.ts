import type { OklchValue, SrgbColor } from "./index.js";
import { oklchToLinearSrgb } from "./gamut.js";

export interface ApcaConstants {
  readonly mainTRC: number;
  readonly sRco: number;
  readonly sGco: number;
  readonly sBco: number;
  readonly normBG: number;
  readonly normTXT: number;
  readonly revTXT: number;
  readonly revBG: number;
  readonly blkThrs: number;
  readonly blkClmp: number;
  readonly scaleBoW: number;
  readonly scaleWoB: number;
  readonly loBoWoffset: number;
  readonly loWoBoffset: number;
  readonly deltaYmin: number;
  readonly loClip: number;
}

export const APCA_ALGORITHM_VERSION = "0.0.98G-4g";

// APCA/W3 0.0.98G-4g constants for web sRGB, as published by Myndex/apca-w3 0.1.9.
export const APCA_CONSTANTS: ApcaConstants = {
  mainTRC: 2.4,
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,
  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  deltaYmin: 0.0005,
  loClip: 0.1,
};

export function calculateApcaLc(
  foreground: SrgbColor,
  background: SrgbColor,
): number {
  return calculateApcaLcFromY(srgbToApcaY(foreground), srgbToApcaY(background));
}

export function calculateApcaLcFromOklch(
  foreground: OklchValue,
  background: OklchValue,
): number {
  return calculateApcaLc(
    linearSrgbToEncodedSrgb(oklchToLinearSrgb(foreground)),
    linearSrgbToEncodedSrgb(oklchToLinearSrgb(background)),
  );
}

export function calculateApcaLcFromY(
  foregroundY: number,
  backgroundY: number,
): number {
  const constants = APCA_CONSTANTS;

  if (
    !Number.isFinite(foregroundY) ||
    !Number.isFinite(backgroundY) ||
    Math.min(foregroundY, backgroundY) < 0 ||
    Math.max(foregroundY, backgroundY) > 1.1
  ) {
    return 0;
  }

  const textY = softClampNearBlack(foregroundY);
  const bgY = softClampNearBlack(backgroundY);

  if (Math.abs(bgY - textY) < constants.deltaYmin) {
    return 0;
  }

  if (bgY > textY) {
    const contrast =
      (bgY ** constants.normBG - textY ** constants.normTXT) * constants.scaleBoW;

    return contrast < constants.loClip ? 0 : (contrast - constants.loBoWoffset) * 100;
  }

  const contrast =
    (bgY ** constants.revBG - textY ** constants.revTXT) * constants.scaleWoB;

  return contrast > -constants.loClip ? 0 : (contrast + constants.loWoBoffset) * 100;
}

export function srgbToApcaY(color: SrgbColor): number {
  const constants = APCA_CONSTANTS;

  return (
    constants.sRco * encodedChannelToApcaLinear(color.r) +
    constants.sGco * encodedChannelToApcaLinear(color.g) +
    constants.sBco * encodedChannelToApcaLinear(color.b)
  );
}

function softClampNearBlack(y: number): number {
  const constants = APCA_CONSTANTS;

  return y > constants.blkThrs ? y : y + (constants.blkThrs - y) ** constants.blkClmp;
}

function encodedChannelToApcaLinear(channel: number): number {
  return clamp01(channel) ** APCA_CONSTANTS.mainTRC;
}

function linearSrgbToEncodedSrgb(color: SrgbColor): SrgbColor {
  return {
    r: linearChannelToEncodedChannel(color.r),
    g: linearChannelToEncodedChannel(color.g),
    b: linearChannelToEncodedChannel(color.b),
  };
}

function linearChannelToEncodedChannel(channel: number): number {
  const clamped = clamp01(channel);

  return clamped <= 0.0031308
    ? clamped * 12.92
    : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
