import assert from "node:assert/strict";
import test from "node:test";
import {
  ColorEngineValidationError,
  detectSeedFormat,
  normalizeSeed,
  parseHexSeed,
  parseHslSeed,
  parseOklchSeed,
  parseRgbSeed,
  validateEngineInput,
  validateOklchSeed,
  validateTaperConfig,
} from "../dist/index.js";

test("detectSeedFormat recognizes supported seed syntax", () => {
  assert.equal(detectSeedFormat("#abc").format, "hex");
  assert.equal(detectSeedFormat("#aabbcc").format, "hex");
  assert.equal(detectSeedFormat("rgb(12, 34, 255)").format, "rgb");
  assert.equal(detectSeedFormat("rgb(12.5 34 255)").format, "rgb");
  assert.equal(detectSeedFormat("hsl(220, 60%, 40%)").format, "hsl");
  assert.equal(detectSeedFormat("hsl(220deg 60% 40%)").format, "hsl");
  assert.equal(detectSeedFormat("hsl(0.5turn 60% 40%)").format, "hsl");
  assert.equal(detectSeedFormat("hsl(480, 60%, 40%)").format, "hsl");
  assert.equal(detectSeedFormat("oklch(0.55 0.12 245)").format, "oklch");
});

test("detectSeedFormat rejects unsupported seed syntax", () => {
  assertValidationError(
    () => detectSeedFormat("rebeccapurple"),
    "INVALID_SEED_FORMAT",
    "seed",
  );

  assertValidationError(
    () => detectSeedFormat("rgb(999, 0, 0)"),
    "INVALID_SEED_FORMAT",
    "seed",
  );

  assertValidationError(
    () => detectSeedFormat("hsl(220, 150%, 40%)"),
    "INVALID_SEED_FORMAT",
    "seed",
  );
});

test("seed channel parsers normalize accepted sRGB syntax", () => {
  assert.deepEqual(parseHexSeed("#0f8"), {
    r: 0,
    g: 1,
    b: 0.5333333333333333,
  });
  assert.deepEqual(parseHexSeed("#008000"), {
    r: 0,
    g: 128 / 255,
    b: 0,
  });
  assert.deepEqual(parseRgbSeed("rgb(0, 128, 0)"), {
    r: 0,
    g: 128 / 255,
    b: 0,
  });
  assert.deepEqual(parseRgbSeed("rgb(0 128.5 0)"), {
    r: 0,
    g: 128.5 / 255,
    b: 0,
  });
  assertApproximatelyRgb(parseHslSeed("hsl(120, 100%, 25.0980392157%)"), {
    r: 0,
    g: 128 / 255,
    b: 0,
  });
  assertApproximatelyRgb(parseHslSeed("hsl(0.3333333333turn 100% 25.0980392157%)"), {
    r: 0,
    g: 128 / 255,
    b: 0,
  });
});

test("normalizeSeed converts accepted sRGB seed formats to OKLCH", () => {
  const green = {
    l: 0.51975,
    c: 0.17686,
    h: 142.4953,
  };

  assertApproximatelyOklch(normalizeSeed("#008000"), green);
  assertApproximatelyOklch(normalizeSeed("rgb(0, 128, 0)"), green);
  assertApproximatelyOklch(normalizeSeed("rgb(0 128 0)"), green);
  assertApproximatelyOklch(normalizeSeed("hsl(120, 100%, 25.0980392157%)"), green);
  assertApproximatelyOklch(normalizeSeed("hsl(120deg 100% 25.0980392157%)"), green);
  assertApproximatelyOklch(normalizeSeed("hsl(480, 100%, 25.0980392157%)"), green);
});

test("parseOklchSeed parses and normalizes hue", () => {
  assert.deepEqual(parseOklchSeed("oklch(0.55 0.12 -30deg)"), {
    l: 0.55,
    c: 0.12,
    h: 330,
  });
});

test("validateOklchSeed rejects achromatic seeds before warnings", () => {
  assertValidationError(
    () => validateOklchSeed({ l: 0.1, c: 0.02, h: 30 }),
    "ACHROMATIC_SEED",
    "seed",
  );
});

test("validateOklchSeed clamps lightness and emits edge warning", () => {
  const result = validateOklchSeed({ l: 0.15, c: 0.08, h: 30 });

  assert.deepEqual(result.adjustedSeed, { l: 0.25, c: 0.08, h: 30 });
  assert.equal(result.seedAdjusted, true);
  assert.deepEqual(
    result.warnings.map((warning) => warning.code),
    ["SEED_LIGHTNESS_CLAMPED", "SEED_LIGHTNESS_EDGE"],
  );
});

test("validateEngineInput reports seed errors before harmony errors", () => {
  assertValidationError(
    () => validateEngineInput({ seed: "", harmony: "bad" }),
    "INVALID_SEED_FORMAT",
    "seed",
  );

  assertValidationError(
    () => validateEngineInput({ seed: "rebeccapurple", harmony: "bad" }),
    "INVALID_SEED_FORMAT",
    "seed",
  );
});

test("validateEngineInput reports achromatic OKLCH before harmony errors", () => {
  assertValidationError(
    () => validateEngineInput({ seed: "oklch(0.55 0.02 30)", harmony: "bad" }),
    "ACHROMATIC_SEED",
    "seed",
  );
});

test("validateEngineInput reports achromatic normalized seeds before harmony errors", () => {
  assertValidationError(
    () => validateEngineInput({ seed: "#000000", harmony: "bad" }),
    "ACHROMATIC_SEED",
    "seed",
  );
});

test("validateEngineInput reports invalid harmony after valid seed", () => {
  assertValidationError(
    () => validateEngineInput({ seed: "oklch(0.55 0.12 30)", harmony: "bad" }),
    "INVALID_HARMONY",
    "harmony",
  );
});

test("validateEngineInput validates optional mood", () => {
  assertValidationError(
    () =>
      validateEngineInput({
        seed: "oklch(0.55 0.12 30)",
        harmony: "complementary",
        mood: "loud",
      }),
    "INVALID_HARMONY",
    "mood",
  );
});

test("validateEngineInput returns parsed OKLCH seed validation result", () => {
  const result = validateEngineInput({
    seed: "oklch(0.55 0.12 30)",
    harmony: "complementary",
  });

  assert.equal(result.seedFormat.format, "oklch");
  assert.deepEqual(result.oklchSeed?.normalizedSeed, {
    l: 0.55,
    c: 0.12,
    h: 30,
  });
});

test("validateEngineInput returns normalized OKLCH for accepted sRGB seed formats", () => {
  const result = validateEngineInput({
    seed: "#008000",
    harmony: "analogous",
  });

  assert.equal(result.seedFormat.format, "hex");
  assertApproximatelyOklch(result.oklchSeed.normalizedSeed, {
    l: 0.51975,
    c: 0.17686,
    h: 142.4953,
  });
});

test("validateEngineInput validates override status hue shape", () => {
  assertValidationError(
    () =>
      validateEngineInput({
        seed: "oklch(0.55 0.12 30)",
        harmony: "triadic",
        overrides: {
          statusHues: {
            danger: 360,
          },
        },
      }),
    "INVALID_OVERRIDE_REFERENCE",
    "overrides.statusHues.danger",
  );
});

test("validateEngineInput validates dark hue shift palette slots", () => {
  assertValidationError(
    () =>
      validateEngineInput({
        seed: "oklch(0.55 0.12 30)",
        harmony: "triadic",
        overrides: {
          darkHueShift: {
            "not-a-slot": 8,
          },
        },
      }),
    "INVALID_OVERRIDE_REFERENCE",
    "overrides.darkHueShift.not-a-slot",
  );
});

test("validateTaperConfig enforces start before end for provided pairs", () => {
  assertValidationError(
    () =>
      validateTaperConfig({
        lightUpperFadeStart: 0.92,
        lightUpperFadeEnd: 0.7,
      }),
    "INVALID_TAPER_CONFIG",
    "overrides.taperParams.lightUpperFadeStart",
  );
});

test("validateTaperConfig allows single-field partial overrides", () => {
  assert.doesNotThrow(() =>
    validateTaperConfig({
      lightUpperFadeStart: 0.72,
    }),
  );
});

test("validateEngineInput validates semantic mapping shape", () => {
  assertValidationError(
    () =>
      validateEngineInput({
        seed: "oklch(0.55 0.12 30)",
        harmony: "monochromatic",
        overrides: {
          semanticMapping: {
            "surface-base": "not-a-primitive",
          },
        },
      }),
    "INVALID_OVERRIDE_REFERENCE",
    "overrides.semanticMapping.surface-base",
  );
});

function assertValidationError(fn, code, field) {
  assert.throws(
    fn,
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.name === "ValidationError" &&
      error.code === code &&
      error.field === field,
  );
}

function assertApproximatelyRgb(actual, expected, epsilon = 0.0000001) {
  assert.equal(Math.abs(actual.r - expected.r) <= epsilon, true);
  assert.equal(Math.abs(actual.g - expected.g) <= epsilon, true);
  assert.equal(Math.abs(actual.b - expected.b) <= epsilon, true);
}

function assertApproximatelyOklch(actual, expected, epsilon = 0.0001) {
  assert.equal(Math.abs(actual.l - expected.l) <= epsilon, true);
  assert.equal(Math.abs(actual.c - expected.c) <= epsilon, true);
  assert.equal(Math.abs(actual.h - expected.h) <= epsilon, true);
}
