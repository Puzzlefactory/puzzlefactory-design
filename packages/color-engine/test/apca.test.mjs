import assert from "node:assert/strict";
import test from "node:test";
import {
  APCA_ALGORITHM_VERSION,
  calculateApcaLc,
  calculateApcaLcFromOklch,
  calculateApcaLcFromY,
  parseColorSeed,
  srgbToApcaY,
} from "../dist/index.js";

test("APCA implementation declares the reference algorithm version", () => {
  assert.equal(APCA_ALGORITHM_VERSION, "0.0.98G-4g");
});

test("calculateApcaLc matches APCA/W3 published sRGB fixtures", () => {
  assertApproximatelyNumber(
    calculateApcaLc(parseHexSeed("#888"), parseHexSeed("#fff")),
    63.056469930209424,
  );
  assertApproximatelyNumber(
    calculateApcaLc(parseHexSeed("#fff"), parseHexSeed("#888")),
    -68.54146436644962,
  );
  assertApproximatelyNumber(
    calculateApcaLc(parseHexSeed("#000"), parseHexSeed("#aaa")),
    58.146262578561334,
  );
  assertApproximatelyNumber(
    calculateApcaLc(parseHexSeed("#aaa"), parseHexSeed("#000")),
    -56.24113336839742,
  );
  assertApproximatelyNumber(
    calculateApcaLc(parseHexSeed("#123"), parseHexSeed("#def")),
    91.66830811481631,
  );
  assertApproximatelyNumber(
    calculateApcaLc(parseHexSeed("#def"), parseHexSeed("#123")),
    -93.06770049484275,
  );
  assertApproximatelyNumber(
    calculateApcaLc(parseHexSeed("#123"), parseHexSeed("#444")),
    8.32326136957393,
  );
  assertApproximatelyNumber(
    calculateApcaLc(parseHexSeed("#444"), parseHexSeed("#123")),
    -7.526878460278154,
  );
});

test("calculateApcaLc preserves signed polarity", () => {
  const darkText = calculateApcaLc(parseHexSeed("#000"), parseHexSeed("#fff"));
  const lightText = calculateApcaLc(parseHexSeed("#fff"), parseHexSeed("#000"));

  assert.equal(darkText > 0, true);
  assert.equal(lightText < 0, true);
  assert.notEqual(Math.sign(darkText), Math.sign(lightText));
});

test("calculateApcaLcFromY clips near-zero contrast", () => {
  assert.equal(calculateApcaLcFromY(0.5, 0.5), 0);
  assert.equal(calculateApcaLcFromY(0.5, 0.5004), 0);
});

test("calculateApcaLcFromY returns zero for invalid luminance inputs", () => {
  assert.equal(calculateApcaLcFromY(Number.NaN, 1), 0);
  assert.equal(calculateApcaLcFromY(0.5, -0.1), 0);
  assert.equal(calculateApcaLcFromY(0.5, 1.2), 0);
});

test("srgbToApcaY uses APCA simple 2.4 transfer", () => {
  assert.equal(srgbToApcaY(parseHexSeed("#000")), 0);
  assertApproximatelyNumber(srgbToApcaY(parseHexSeed("#fff")), 1.0000001);
  assertApproximatelyNumber(srgbToApcaY(parseHexSeed("#888")), 0.22120604475311154);
});

test("calculateApcaLcFromOklch integrates with parsed seeds", () => {
  assertApproximatelyNumber(
    calculateApcaLcFromOklch(parseColorSeed("#000"), parseColorSeed("#fff")),
    calculateApcaLc(parseHexSeed("#000"), parseHexSeed("#fff")),
    0.3,
  );

  assertApproximatelyNumber(
    calculateApcaLcFromOklch(parseColorSeed("#3366ff"), parseColorSeed("#fff")),
    calculateApcaLc(parseHexSeed("#3366ff"), parseHexSeed("#fff")),
    0.3,
  );
});

function parseHexSeed(hex) {
  const normalized = normalizeHex(hex);

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    g: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    b: Number.parseInt(normalized.slice(4, 6), 16) / 255,
  };
}

function normalizeHex(hex) {
  const value = hex.slice(1);

  if (/^[0-9a-f]{3}$/i.test(value)) {
    return value.split("").map((channel) => `${channel}${channel}`).join("");
  }

  if (/^[0-9a-f]{6}$/i.test(value)) {
    return value;
  }

  throw new Error(`Invalid fixture hex: ${hex}`);
}

function assertApproximatelyNumber(actual, expected, epsilon = 0.000001) {
  assert.equal(Math.abs(actual - expected) <= epsilon, true);
}
