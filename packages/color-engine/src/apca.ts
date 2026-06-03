import type { OklchValue } from "./index.js";

export interface SrgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

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

function oklchToLinearSrgb(color: OklchValue): SrgbColor {
  const hueRadians = (color.h * Math.PI) / 180;
  const oklab = {
    l: color.l,
    a: color.c * Math.cos(hueRadians),
    b: color.c * Math.sin(hueRadians),
  };
  const lmsPrime = {
    l: oklab.l + 0.3963377773761749 * oklab.a + 0.2158037573099136 * oklab.b,
    m: oklab.l - 0.1055613458156586 * oklab.a - 0.0638541728258133 * oklab.b,
    s: oklab.l - 0.0894841775298119 * oklab.a - 1.2914855480194092 * oklab.b,
  };
  const lms = {
    l: lmsPrime.l ** 3,
    m: lmsPrime.m ** 3,
    s: lmsPrime.s ** 3,
  };
  const xyz = {
    x:
      1.2268798733741557 * lms.l -
      0.5578149965554813 * lms.m +
      0.28139105017721583 * lms.s,
    y:
      -0.04057576262431372 * lms.l +
      1.1122868293970594 * lms.m -
      0.07171106666151701 * lms.s,
    z:
      -0.07637294974672142 * lms.l -
      0.4214933239627914 * lms.m +
      1.5869240244272418 * lms.s,
  };

  return {
    r: 3.2409699419045226 * xyz.x - 1.537383177570094 * xyz.y - 0.4986107602930034 * xyz.z,
    g:
      -0.9692436362808796 * xyz.x +
      1.8759675015077202 * xyz.y +
      0.04155505740717559 * xyz.z,
    b: 0.05563007969699366 * xyz.x - 0.20397695888897652 * xyz.y + 1.0569715142428786 * xyz.z,
  };
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
