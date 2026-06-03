import assert from "node:assert/strict";
import test from "node:test";
import {
  APCA_ALGORITHM_VERSION,
  calculateApcaLc,
  calculateApcaLcFromOklch,
  calculateApcaLcFromY,
  normalizeSeed,
  parseHexSeed,
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

test("calculateApcaLcFromOklch integrates with normalized seeds", () => {
  assertApproximatelyNumber(
    calculateApcaLcFromOklch(normalizeSeed("#000"), normalizeSeed("#fff")),
    calculateApcaLc(parseHexSeed("#000"), parseHexSeed("#fff")),
  );

  assertApproximatelyNumber(
    calculateApcaLcFromOklch(normalizeSeed("#3366ff"), normalizeSeed("#fff")),
    calculateApcaLc(parseHexSeed("#3366ff"), parseHexSeed("#fff")),
  );
});

function assertApproximatelyNumber(actual, expected, epsilon = 0.000001) {
  assert.equal(Math.abs(actual - expected) <= epsilon, true);
}
