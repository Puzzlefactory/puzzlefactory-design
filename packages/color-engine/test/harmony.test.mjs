import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveHarmony,
  generateRamp,
  isHarmonyPaletteSlot,
} from "../dist/index.js";

test("deriveHarmony creates complementary descriptors", () => {
  assert.deepEqual(deriveHarmony({ hue: 280, strategy: "complementary" }), [
    { slot: "palette-a", hue: 280, chromaScale: 1 },
    { slot: "palette-b", hue: 100, chromaScale: 1 },
  ]);
});

test("deriveHarmony creates analogous descriptors in slot order", () => {
  assert.deepEqual(deriveHarmony({ hue: 10, strategy: "analogous", mood: "muted" }), [
    { slot: "palette-a", hue: 10, chromaScale: 0.5 },
    { slot: "palette-b", hue: 340, chromaScale: 0.5 },
    { slot: "palette-c", hue: 40, chromaScale: 0.5 },
  ]);
});

test("deriveHarmony creates triadic descriptors", () => {
  assert.deepEqual(deriveHarmony({ hue: 145, strategy: "triadic", mood: "neutral" }), [
    { slot: "palette-a", hue: 145, chromaScale: 0.1 },
    { slot: "palette-b", hue: 265, chromaScale: 0.1 },
    { slot: "palette-c", hue: 25, chromaScale: 0.1 },
  ]);
});

test("deriveHarmony creates split-complementary descriptors", () => {
  assert.deepEqual(deriveHarmony({ hue: 245, strategy: "split-complementary" }), [
    { slot: "palette-a", hue: 245, chromaScale: 1 },
    { slot: "palette-b", hue: 35, chromaScale: 1 },
    { slot: "palette-c", hue: 95, chromaScale: 1 },
  ]);
});

test("deriveHarmony creates monochromatic variant descriptors only", () => {
  assert.deepEqual(deriveHarmony({ hue: -30, strategy: "monochromatic", mood: "muted" }), [
    { slot: "palette-a", hue: 330, chromaScale: 1 },
    { slot: "palette-a-mid", hue: 330, chromaScale: 0.5 },
    { slot: "palette-a-subtle", hue: 330, chromaScale: 0.2 },
  ]);
});

test("harmony descriptor chroma scale feeds ramp generation", () => {
  const [full, mid, subtle] = deriveHarmony({ hue: 240, strategy: "monochromatic" });
  const fullRamp = generateRamp({ hue: full.hue, chromaScale: full.chromaScale });
  const midRamp = generateRamp({ hue: mid.hue, chromaScale: mid.chromaScale });
  const subtleRamp = generateRamp({ hue: subtle.hue, chromaScale: subtle.chromaScale });

  assertApproximatelyNumber(midRamp.light[5].targetChroma, fullRamp.light[5].targetChroma * 0.5);
  assertApproximatelyNumber(subtleRamp.light[5].targetChroma, fullRamp.light[5].targetChroma * 0.2);
});

test("isHarmonyPaletteSlot excludes non-harmony palette slots", () => {
  assert.equal(isHarmonyPaletteSlot("palette-a"), true);
  assert.equal(isHarmonyPaletteSlot("palette-a-subtle"), true);
  assert.equal(isHarmonyPaletteSlot("neutral"), false);
  assert.equal(isHarmonyPaletteSlot("status-danger"), false);
});

function assertApproximatelyNumber(actual, expected, epsilon = 0.000001) {
  assert.equal(Math.abs(actual - expected) <= epsilon, true);
}
