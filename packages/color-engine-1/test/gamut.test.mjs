import assert from "node:assert/strict";
import test from "node:test";
import {
  clampRgbToGamut,
  isInDisplayP3Gamut,
  isInSrgbGamut,
  isRgbInGamut,
  normalizeSeed,
  oklchToLinearDisplayP3,
  oklchToLinearSrgb,
  reduceChromaToGamut,
} from "../dist/index.js";

test("oklchToLinearSrgb converts normalized sRGB seeds back to linear sRGB", () => {
  const green = normalizeSeed("#008000");

  assertApproximatelyRgb(oklchToLinearSrgb(green), {
    r: 0,
    g: 0.2158605,
    b: 0,
  });
});

test("oklchToLinearDisplayP3 converts in-gamut sRGB colors into linear Display P3", () => {
  const green = normalizeSeed("#008000");

  assertApproximatelyRgb(oklchToLinearDisplayP3(green), {
    r: 0.0383234,
    g: 0.2086952,
    b: 0.0156277,
  });
});

test("gamut checks use the spec epsilon for near-boundary channels", () => {
  assert.equal(isRgbInGamut({ r: -0.0001, g: 0.5, b: 1.0001 }), true);
  assert.equal(isRgbInGamut({ r: -0.0002, g: 0.5, b: 1 }), false);
  assert.deepEqual(clampRgbToGamut({ r: -0.0001, g: 0.5, b: 1.0001 }), {
    r: 0,
    g: 0.5,
    b: 1,
  });
});

test("gamut checks identify sRGB and Display P3 cases", () => {
  const inSrgb = normalizeSeed("#008000");
  const p3Only = { l: 0.65, c: 0.25, h: 30 };
  const outsideBoth = { l: 0.65, c: 0.3, h: 30 };

  assert.equal(isInSrgbGamut(inSrgb), true);
  assert.equal(isInDisplayP3Gamut(inSrgb), true);
  assert.equal(isInSrgbGamut(p3Only), false);
  assert.equal(isInDisplayP3Gamut(p3Only), true);
  assert.equal(isInSrgbGamut(outsideBoth), false);
  assert.equal(isInDisplayP3Gamut(outsideBoth), false);
});

test("reduceChromaToGamut preserves in-gamut colors", () => {
  const color = normalizeSeed("#008000");
  const result = reduceChromaToGamut(color, "srgb");

  assert.equal(result.gamut, "srgb");
  assert.equal(result.wasMapped, false);
  assert.equal(result.chromaReduction, 0);
  assert.deepEqual(result.mapped, color);
});

test("reduceChromaToGamut reduces chroma at constant lightness and hue", () => {
  const original = { l: 0.65, c: 0.3, h: 30 };
  const srgb = reduceChromaToGamut(original, "srgb");
  const p3 = reduceChromaToGamut(original, "display-p3");

  assert.equal(srgb.wasMapped, true);
  assert.equal(p3.wasMapped, true);
  assert.equal(srgb.mapped.l, original.l);
  assert.equal(srgb.mapped.h, original.h);
  assert.equal(p3.mapped.l, original.l);
  assert.equal(p3.mapped.h, original.h);
  assert.equal(isInSrgbGamut(srgb.mapped), true);
  assert.equal(isInDisplayP3Gamut(p3.mapped), true);
  assert.equal(p3.mapped.c > srgb.mapped.c, true);
  assertApproximatelyNumber(srgb.mapped.c, 0.236);
  assertApproximatelyNumber(p3.mapped.c, 0.291);
});

function assertApproximatelyRgb(actual, expected, epsilon = 0.000001) {
  assert.equal(Math.abs(actual.r - expected.r) <= epsilon, true);
  assert.equal(Math.abs(actual.g - expected.g) <= epsilon, true);
  assert.equal(Math.abs(actual.b - expected.b) <= epsilon, true);
}

function assertApproximatelyNumber(actual, expected, epsilon = 0.000001) {
  assert.equal(Math.abs(actual - expected) <= epsilon, true);
}
