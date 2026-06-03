import type {
  LinearDisplayP3Color,
  LinearSrgbColor,
  OklchValue,
  SrgbColor,
} from "./index.js";

export type RgbGamut = "srgb" | "display-p3";

export interface GamutMappingResult {
  readonly gamut: RgbGamut;
  readonly original: OklchValue;
  readonly mapped: OklchValue;
  readonly wasMapped: boolean;
  readonly chromaReduction: number;
}

const GAMUT_EPSILON = 0.0001;
const CHROMA_REDUCTION_STEP = 0.001;

export function oklchToLinearSrgb(color: OklchValue): LinearSrgbColor {
  return xyzToLinearSrgb(oklabToXyz(oklchToOklab(color)));
}

export function oklchToLinearDisplayP3(color: OklchValue): LinearDisplayP3Color {
  return xyzToLinearDisplayP3(oklabToXyz(oklchToOklab(color)));
}

export function isInSrgbGamut(color: OklchValue): boolean {
  return isRgbInGamut(oklchToLinearSrgb(color));
}

export function isInDisplayP3Gamut(color: OklchValue): boolean {
  return isRgbInGamut(oklchToLinearDisplayP3(color));
}

export function reduceChromaToGamut(
  color: OklchValue,
  gamut: RgbGamut,
): GamutMappingResult {
  if (isInGamut(color, gamut)) {
    return {
      gamut,
      original: color,
      mapped: color,
      wasMapped: false,
      chromaReduction: 0,
    };
  }

  for (
    let chroma = Math.max(0, color.c - CHROMA_REDUCTION_STEP);
    chroma > 0;
    chroma = Math.max(0, chroma - CHROMA_REDUCTION_STEP)
  ) {
    const mapped = { ...color, c: roundChroma(chroma) };

    if (isInGamut(mapped, gamut)) {
      return {
        gamut,
        original: color,
        mapped,
        wasMapped: true,
        chromaReduction: color.c - mapped.c,
      };
    }
  }

  const mapped = { ...color, c: 0 };

  return {
    gamut,
    original: color,
    mapped,
    wasMapped: true,
    chromaReduction: color.c,
  };
}

export function isRgbInGamut(rgb: LinearSrgbColor | LinearDisplayP3Color): boolean {
  return (
    rgb.r >= -GAMUT_EPSILON &&
    rgb.r <= 1 + GAMUT_EPSILON &&
    rgb.g >= -GAMUT_EPSILON &&
    rgb.g <= 1 + GAMUT_EPSILON &&
    rgb.b >= -GAMUT_EPSILON &&
    rgb.b <= 1 + GAMUT_EPSILON
  );
}

export function clampRgbToGamut(rgb: SrgbColor): SrgbColor {
  return {
    r: clamp01(rgb.r),
    g: clamp01(rgb.g),
    b: clamp01(rgb.b),
  };
}

function isInGamut(color: OklchValue, gamut: RgbGamut): boolean {
  return gamut === "srgb" ? isInSrgbGamut(color) : isInDisplayP3Gamut(color);
}

function oklchToOklab(color: OklchValue): { readonly l: number; readonly a: number; readonly b: number } {
  const hueRadians = (color.h * Math.PI) / 180;

  return {
    l: color.l,
    a: color.c * Math.cos(hueRadians),
    b: color.c * Math.sin(hueRadians),
  };
}

function oklabToXyz(oklab: {
  readonly l: number;
  readonly a: number;
  readonly b: number;
}): { readonly x: number; readonly y: number; readonly z: number } {
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

  return {
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
}

function xyzToLinearSrgb(xyz: {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}): LinearSrgbColor {
  return {
    r: 3.2409699419045226 * xyz.x - 1.537383177570094 * xyz.y - 0.4986107602930034 * xyz.z,
    g:
      -0.9692436362808796 * xyz.x +
      1.8759675015077202 * xyz.y +
      0.04155505740717559 * xyz.z,
    b: 0.05563007969699366 * xyz.x - 0.20397695888897652 * xyz.y + 1.0569715142428786 * xyz.z,
  };
}

function xyzToLinearDisplayP3(xyz: {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}): LinearDisplayP3Color {
  return {
    r: 2.493496911941425 * xyz.x - 0.9313836179191239 * xyz.y - 0.40271078445071684 * xyz.z,
    g:
      -0.8294889695615747 * xyz.x +
      1.7626640603183463 * xyz.y +
      0.023624685841943577 * xyz.z,
    b:
      0.03584583024378447 * xyz.x -
      0.07617238926804182 * xyz.y +
      0.9568845240076872 * xyz.z,
  };
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function roundChroma(value: number): number {
  return Math.round(value * 1000) / 1000;
}
