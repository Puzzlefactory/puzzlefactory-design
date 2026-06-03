import assert from "node:assert/strict";
import test from "node:test";
import {
  ColorEngineValidationError,
  applyDarkHueShift,
  darkRampLightness,
  generateRamp,
  isInSrgbGamut,
  lightRampLightness,
  moodScale,
  resolveTaperConfig,
  smoothstep,
} from "../dist/index.js";

test("smoothstep follows the specified clamped cubic curve", () => {
  assert.equal(smoothstep(0.55, 0.68, 0.55), 0);
  assertApproximatelyNumber(smoothstep(0.55, 0.68, 0.615), 0.5);
  assert.equal(smoothstep(0.55, 0.68, 0.68), 1);
  assert.equal(smoothstep(0.55, 0.68, 0.4), 0);
  assert.equal(smoothstep(0.55, 0.68, 0.8), 1);
});

test("ramp lightness functions preserve specified endpoints", () => {
  assert.equal(lightRampLightness(1), 0.92);
  assert.equal(lightRampLightness(12), 0.55);
  assert.equal(darkRampLightness(1), 0.55);
  assert.equal(darkRampLightness(12), 0.08);
});

test("moodScale returns specified scale factors", () => {
  assert.equal(moodScale("vibrant"), 1);
  assert.equal(moodScale("muted"), 0.5);
  assert.equal(moodScale("neutral"), 0.1);
});

test("resolveTaperConfig merges overrides and rejects invalid pairs", () => {
  assert.equal(resolveTaperConfig({ lightUpperFadeStart: 0.72 }).lightUpperFadeStart, 0.72);

  assert.throws(
    () =>
      resolveTaperConfig({
        lightUpperFadeStart: 0.92,
        lightUpperFadeEnd: 0.7,
      }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_TAPER_CONFIG" &&
      error.field === "taperParams.lightUpperFadeStart",
  );

  assert.throws(
    () =>
      resolveTaperConfig({
        lightUpperFadeStart: Number.NaN,
      }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_TAPER_CONFIG" &&
      error.field === "taperParams.lightUpperFadeStart",
  );

  assert.throws(
    () =>
      generateRamp({
        hue: 240,
        taperParams: {
          darkLowerFadeEnd: Infinity,
        },
      }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_TAPER_CONFIG" &&
      error.field === "taperParams.darkLowerFadeStart",
  );
});

test("applyDarkHueShift rotates only dark low-lightness steps", () => {
  assert.equal(applyDarkHueShift(240, 0.3, 12), 240);
  assertApproximatelyNumber(applyDarkHueShift(240, 0.19, 12), 246);
  assert.equal(applyDarkHueShift(240, 0.08, 12), 252);
});

test("generateRamp creates light and dark ramps with gamut-mapped OKLCH steps", () => {
  const ramp = generateRamp({ hue: 240, mood: "vibrant", darkHueShift: 12 });

  assert.equal(ramp.light.length, 12);
  assert.equal(ramp.dark.length, 12);
  assert.equal(ramp.light[0]?.step, 1);
  assert.equal(ramp.light[11]?.step, 12);
  assert.equal(ramp.dark[0]?.step, 1);
  assert.equal(ramp.dark[11]?.step, 12);
  assert.deepEqual(ramp.light[0]?.oklch, { l: 0.92, c: 0, h: 240 });
  assert.deepEqual(ramp.light[11]?.oklch, { l: 0.55, c: 0, h: 240 });
  assert.deepEqual(ramp.dark[0]?.oklch, { l: 0.55, c: 0, h: 240 });
  assert.deepEqual(ramp.dark[11]?.oklch, { l: 0.08, c: 0, h: 252 });
  assert.equal(ramp.light.every((step) => isInSrgbGamut(step.oklch)), true);
  assert.equal(ramp.dark.every((step) => isInSrgbGamut(step.oklch)), true);
});

test("generateRamp applies mood scaling before taper", () => {
  const vibrant = generateRamp({ hue: 240, mood: "vibrant" });
  const muted = generateRamp({ hue: 240, mood: "muted" });
  const neutral = generateRamp({ hue: 240, mood: "neutral" });

  assertApproximatelyNumber(muted.light[5].targetChroma, vibrant.light[5].targetChroma * 0.5);
  assertApproximatelyNumber(neutral.light[5].targetChroma, vibrant.light[5].targetChroma * 0.1);
});

test("generateRamp accepts explicit chroma scale for monochromatic variants later", () => {
  const full = generateRamp({ hue: 240, chromaScale: 1 });
  const subtle = generateRamp({ hue: 240, chromaScale: 0.2 });

  assertApproximatelyNumber(subtle.light[5].targetChroma, full.light[5].targetChroma * 0.2);
});

function assertApproximatelyNumber(actual, expected, epsilon = 0.000001) {
  assert.equal(Math.abs(actual - expected) <= epsilon, true);
}
