import assert from "node:assert/strict";
import test from "node:test";
import {
  ColorEngineValidationError,
  SURFACE_PRESET_NAMES,
  createColorEngineTheme,
  parseColorSeed,
} from "../dist/index.js";

test("createColorEngineTheme renders neutral and surface families only", () => {
  const output = createColorEngineTheme();

  assert.deepEqual(Object.keys(output.primitives).sort(), [
    "neutral-dark",
    "neutral-light",
    "surface-dark",
    "surface-light",
  ]);
  assert.equal(output.primitives["surface-light"].length, 4);
  assert.equal(output.primitives["surface-dark"].length, 4);
  assert.equal(output.semantics.light["surface-1"], "var(--ds-surface-light-1)");
  assert.equal(output.semantics.dark["surface-1"], "var(--ds-surface-dark-1)");
  assert.match(output.css, /\[data-theme-v2="light"\]/);
  assert.match(output.css, /--ds-surface-1-hover: var\(--ds-surface-light-1-hover\);/);
});

test("surface seeds control light and dark surface families independently", () => {
  const output = createColorEngineTheme({
    neutralSeed: "oklch(0.8 0.02 160)",
    surfaceLightSeed: "oklch(0.93 0.018 120)",
    surfaceDarkSeed: "oklch(0.11 0.02 220)",
  });

  assert.equal(output.primitives["surface-light"][0]?.oklch.h, 120);
  assert.equal(output.primitives["surface-dark"][0]?.oklch.h, 220);
  assert.equal(output.primitives["neutral-light"][0]?.oklch.h, 160);
});

test("presets change surface separation", () => {
  const quiet = createColorEngineTheme({ preset: "quiet" });
  const separated = createColorEngineTheme({ preset: "high-separation" });
  const quietDelta =
    (quiet.primitives["surface-light"][3]?.oklch.l ?? 0) -
    (quiet.primitives["surface-light"][0]?.oklch.l ?? 0);
  const separatedDelta =
    (separated.primitives["surface-light"][3]?.oklch.l ?? 0) -
    (separated.primitives["surface-light"][0]?.oklch.l ?? 0);

  assert.equal(SURFACE_PRESET_NAMES.includes("standard"), true);
  assert.ok(separatedDelta > quietDelta);
});

test("parseColorSeed accepts hex and oklch seeds", () => {
  assert.equal(parseColorSeed("#fff").l > 0.99, true);
  assert.deepEqual(parseColorSeed("oklch(0.5 0.1 380)"), {
    l: 0.5,
    c: 0.1,
    h: 20,
  });
});

test("createColorEngineTheme rejects invalid seeds", () => {
  assert.throws(
    () => createColorEngineTheme({ neutralSeed: "rebeccapurple" }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED" &&
      error.field === "neutralSeed",
  );
});
