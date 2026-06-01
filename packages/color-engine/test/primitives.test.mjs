import assert from "node:assert/strict";
import test from "node:test";
import {
  assembleNeutralPrimitiveTokens,
  assemblePalettePrimitiveTokens,
  assemblePrimitiveTokens,
  assembleStatusPrimitiveTokens,
  normalizeSeed,
} from "../dist/index.js";

const seed = normalizeSeed("#3366ff");

test("assemblePrimitiveTokens creates complementary primitive inventory", () => {
  const inventory = assemblePrimitiveTokens({
    seed,
    harmony: "complementary",
    mood: "vibrant",
  });

  assert.equal(inventory.tokens.length, 168);
  assert.equal(inventory.byName.size, 168);
  assert.equal(inventory.byName.get("palette-a-l-1")?.name, "palette-a-l-1");
  assert.equal(inventory.byName.has("palette-b-d-12"), true);
  assert.equal(inventory.byName.has("palette-c-l-1"), false);
  assert.equal(inventory.byName.has("neutral-l-1"), true);
  assert.equal(inventory.byName.has("status-danger-d-12"), true);
  assert.equal(inventory.tokens.every((token) => PRIMITIVE_NAME_PATTERN.test(token.name)), true);
});

test("assemblePrimitiveTokens creates unique inventories for every harmony strategy", () => {
  const expectedCounts = new Map([
    ["complementary", 168],
    ["analogous", 192],
    ["triadic", 192],
    ["split-complementary", 192],
    ["monochromatic", 192],
  ]);

  for (const [harmony, expectedCount] of expectedCounts) {
    const inventory = assemblePrimitiveTokens({
      seed,
      harmony,
      mood: "vibrant",
    });

    assert.equal(inventory.tokens.length, expectedCount, harmony);
    assert.equal(inventory.byName.size, expectedCount, harmony);
    assert.equal(unique(inventory.tokens.map((token) => token.name)).length, expectedCount, harmony);
  }
});

test("assemblePrimitiveTokens creates monochromatic variants without palette-b or palette-c", () => {
  const inventory = assemblePrimitiveTokens({
    seed,
    harmony: "monochromatic",
    mood: "muted",
  });
  const paletteSlots = unique(inventory.tokens.filter((token) => token.slot.startsWith("palette")).map((token) => token.slot));

  assert.equal(inventory.tokens.length, 192);
  assert.deepEqual(paletteSlots, ["palette-a", "palette-a-mid", "palette-a-subtle"]);
  assert.equal(inventory.byName.has("palette-b-l-1"), false);
  assert.equal(inventory.byName.has("palette-c-d-12"), false);
});

test("assemblePalettePrimitiveTokens uses harmony descriptors and split ramps", () => {
  const tokens = assemblePalettePrimitiveTokens({
    seed,
    harmony: "analogous",
    mood: "neutral",
  });

  assert.equal(tokens.length, 72);
  assert.deepEqual(unique(tokens.map((token) => token.slot)), ["palette-a", "palette-b", "palette-c"]);
  assert.deepEqual(tokens.slice(0, 3).map((token) => token.name), [
    "palette-a-l-1",
    "palette-a-l-2",
    "palette-a-l-3",
  ]);
  assert.deepEqual(tokens.slice(21, 24).map((token) => token.name), [
    "palette-a-d-10",
    "palette-a-d-11",
    "palette-a-d-12",
  ]);
});

test("assembleNeutralPrimitiveTokens uses seed hue and fixed chroma values", () => {
  const tokens = assembleNeutralPrimitiveTokens(seed);
  const light = tokens.find((token) => token.name === "neutral-l-6");
  const dark = tokens.find((token) => token.name === "neutral-d-6");

  assert.equal(tokens.length, 24);
  assert.equal(light?.oklch.c, 0.015);
  assert.equal(dark?.oklch.c, 0.012);
  assertApproximatelyNumber(light?.oklch.h, seed.h);
  assertApproximatelyNumber(dark?.oklch.h, seed.h);
});

test("assembleStatusPrimitiveTokens uses anchored and overridden status hues", () => {
  const defaults = assembleStatusPrimitiveTokens({});
  const overridden = assembleStatusPrimitiveTokens({
    statusHues: {
      warning: 60,
    },
    darkHueShift: {
      "status-info": 8,
    },
  });

  assert.equal(defaults.length, 96);
  assert.equal(defaults.find((token) => token.name === "status-danger-l-6")?.oklch.h, 29);
  assert.equal(defaults.find((token) => token.name === "status-warning-l-6")?.oklch.h, 65);
  assert.equal(defaults.find((token) => token.name === "status-success-l-6")?.oklch.h, 145);
  assert.equal(defaults.find((token) => token.name === "status-info-l-6")?.oklch.h, 245);
  assert.equal(overridden.find((token) => token.name === "status-warning-l-6")?.oklch.h, 60);
  assert.equal(overridden.find((token) => token.name === "status-info-d-12")?.oklch.h, 253);
});

test("primitive tokens include OKLCH and Display P3 value strings", () => {
  const inventory = assemblePrimitiveTokens({
    seed,
    harmony: "triadic",
  });
  const token = inventory.byName.get("palette-a-l-6");

  assert.match(token?.srgb ?? "", /^oklch\([0-9.]+ [0-9.]+ [0-9.]+\)$/);
  assert.match(token?.p3 ?? "", /^color\(display-p3 [0-9.]+ [0-9.]+ [0-9.]+\)$/);
});

function unique(values) {
  return [...new Set(values)];
}

function assertApproximatelyNumber(actual, expected, epsilon = 0.000001) {
  assert.equal(Math.abs(actual - expected) <= epsilon, true);
}

const PRIMITIVE_NAME_PATTERN =
  /^(?:palette-a|palette-b|palette-c|palette-a-mid|palette-a-subtle|neutral|status-danger|status-warning|status-success|status-info)-[ld]-(?:[1-9]|1[0-2])$/;
