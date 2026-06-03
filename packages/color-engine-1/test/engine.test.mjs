import assert from "node:assert/strict";
import test from "node:test";
import {
  SEMANTIC_TOKEN_NAMES,
  ColorEngineValidationError,
  createColorEngineTheme,
} from "../dist/index.js";

test("createColorEngineTheme returns a complete engine output", () => {
  const output = createColorEngineTheme({
    seed: "#3366ff",
    harmony: "complementary",
  });

  assert.equal(Object.keys(output.primitives.srgb).length, 168);
  assert.equal(Object.keys(output.primitives.p3).length, 0);
  assert.equal(Object.keys(output.semantic.light).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(Object.keys(output.semantic.dark).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(Object.keys(output.semantic.highContrast).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(Object.keys(output.semantic.highContrastDark).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(output.assertions.length, 96);
  assert.equal(output.semantic.light["surface-base"], "var(--ds-neutral-l-2)");
  assert.equal(output.semantic.light["surface-raised"], "var(--ds-neutral-l-1)");
  assert.equal(output.semantic.dark["surface-base"], "var(--ds-neutral-d-12)");
  assert.equal(output.metadata.inputSeed, "#3366ff");
  assert.equal(output.metadata.seedAdjusted, false);
  assert.deepEqual(
    output.metadata.harmonyHues.map((hue) => Number(hue.toFixed(6))),
    [265.283559, 85.283559],
  );
  assert.equal(output.metadata.gamutMappedCount, 0);
});

test("createColorEngineTheme applies custom namespace and semantic overrides", () => {
  const output = createColorEngineTheme({
    seed: "#3366ff",
    harmony: "triadic",
    namespace: " pf ",
    overrides: {
      semanticMapping: {
        "surface-base": "neutral-l-3",
      },
    },
  });
  const assertion = output.assertions.find(
    (result) =>
      result.theme === "light" &&
      result.tokenA === "text-primary" &&
      result.tokenB === "surface-base",
  );

  assert.equal(output.semantic.light["surface-base"], "var(--pf-neutral-l-3)");
  assert.equal(output.semantic.highContrastDark["surface-base"], "var(--pf-neutral-l-3)");
  assert.equal(assertion?.source, "override");
});

test("createColorEngineTheme propagates seed and status warnings", () => {
  const output = createColorEngineTheme({
    seed: "oklch(0.9 0.1 280)",
    harmony: "triadic",
  });

  assert.deepEqual(
    output.warnings.map((warning) => warning.code),
    ["SEED_LIGHTNESS_CLAMPED", "SEED_LIGHTNESS_EDGE", "STATUS_CONTRAST_LIMIT"],
  );
  assert.equal(output.metadata.seedAdjusted, true);
  assert.equal(output.metadata.normalizedSeed.l, 0.9);
  assert.equal(output.metadata.adjustedSeed.l, 0.75);

  const statusWarning = output.warnings.find(
    (warning) => warning.code === "STATUS_CONTRAST_LIMIT",
  );
  assert.deepEqual(statusWarning?.affectedTokens, ["neutral-d-12", "status-warning-l-9"]);
  assert.deepEqual(statusWarning?.data?.themes, ["dark"]);
});

test("createColorEngineTheme uses gamut-mapped adjusted seed in metadata", () => {
  const output = createColorEngineTheme({
    seed: "oklch(0.75 0.5 280)",
    harmony: "complementary",
  });

  assert.deepEqual(output.metadata.normalizedSeed, { l: 0.75, c: 0.5, h: 280 });
  assert.deepEqual(output.metadata.adjustedSeed, { l: 0.75, c: 0.13, h: 280 });
  assert.equal(output.metadata.seedAdjusted, true);
});

test("createColorEngineTheme throws validation errors before output", () => {
  assert.throws(
    () =>
      createColorEngineTheme({
        seed: "rebeccapurple",
        harmony: "complementary",
      }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED_FORMAT" &&
      error.field === "seed",
  );
});

test("createColorEngineTheme rejects semantic overrides absent from generated inventory", () => {
  assert.throws(
    () =>
      createColorEngineTheme({
        seed: "#3366ff",
        harmony: "monochromatic",
        overrides: {
          semanticMapping: {
            "surface-base": "palette-b-l-1",
          },
        },
      }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_OVERRIDE_REFERENCE" &&
      error.field === "overrides.semanticMapping.surface-base",
  );
});
