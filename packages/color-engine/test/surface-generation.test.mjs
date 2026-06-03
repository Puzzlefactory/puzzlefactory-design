import assert from "node:assert/strict";
import test from "node:test";
import {
  ColorEngineValidationError,
  SURFACE_PRESET_NAMES,
  createColorEngineTheme,
  parseColorSeed,
} from "../dist/index.js";

test("createColorEngineTheme renders neutral, surface, and primary usage families", () => {
  const output = createColorEngineTheme();

  assert.deepEqual(Object.keys(output.primitives).sort(), [
    "neutral-dark",
    "neutral-light",
    "primary-dark-soft",
    "primary-dark-solid",
    "primary-light-soft",
    "primary-light-solid",
    "surface-dark",
    "surface-light",
  ]);
  assert.equal(output.primitives["surface-light"].length, 4);
  assert.equal(output.primitives["surface-dark"].length, 4);
  assert.equal(output.primitives["primary-light-soft"].length, 4);
  assert.equal(output.primitives["primary-dark-solid"].length, 4);
  assert.equal(output.semantics.light["surface-1"], "var(--ds-surface-light-1)");
  assert.equal(output.semantics.dark["surface-1"], "var(--ds-surface-dark-1)");
  assert.equal(output.semantics.light["primary-action-bg"], "var(--ds-primary-light-solid-2)");
  assert.equal(output.semantics.dark["primary-action-bg"], "var(--ds-primary-dark-solid-2)");
  assert.match(output.css, /\[data-theme-v2="light"\]/);
  assert.match(output.css, /--ds-surface-1-hover: var\(--ds-surface-light-1-hover\);/);
  assert.match(output.css, /--ds-primary-action-bg: var\(--ds-primary-light-solid-2\);/);
});

test("surface and primary seeds control usage families independently", () => {
  const output = createColorEngineTheme({
    neutralSeed: "oklch(0.8 0.02 160)",
    surfaceLightSeed: "oklch(0.93 0.018 120)",
    surfaceDarkSeed: "oklch(0.11 0.02 220)",
    primarySeed: "oklch(0.52 0.14 145)",
  });

  assert.equal(output.primitives["surface-light"][0]?.oklch.h, 120);
  assert.equal(output.primitives["surface-dark"][0]?.oklch.h, 220);
  assert.equal(output.primitives["neutral-light"][0]?.oklch.h, 160);
  assert.equal(output.primitives["primary-light-solid"][0]?.oklch.h, 145);
  assert.equal(output.primitives["primary-dark-soft"][0]?.oklch.h, 145);
  assert.equal(output.seeds.primary.h, 145);
});

test("presets change surface separation", () => {
  const quiet = createColorEngineTheme({ preset: "quiet" });
  const separated = createColorEngineTheme({ preset: "high-separation" });
  const quietDelta = rampSpan(quiet, "surface-light");
  const separatedDelta = rampSpan(separated, "surface-light");

  assert.equal(SURFACE_PRESET_NAMES.includes("standard"), true);
  assert.ok(separatedDelta > quietDelta);
});

test("preset light and dark spans increase in calibrated order", () => {
  const spans = SURFACE_PRESET_NAMES.map((preset) => {
    const output = createColorEngineTheme({ preset });

    return {
      preset,
      light: rampSpan(output, "surface-light"),
      dark: rampSpan(output, "surface-dark"),
    };
  });

  for (let index = 1; index < spans.length; index += 1) {
    assert.ok(spans[index].light > spans[index - 1].light, `${spans[index].preset} light span should increase`);
    assert.ok(spans[index].dark > spans[index - 1].dark, `${spans[index].preset} dark span should increase`);
  }

  for (const span of spans) {
    assert.ok(span.dark > span.light, `${span.preset} should give dark surfaces more separation than light surfaces`);
  }
});

test("surface states move toward interactive feedback without reversing theme direction", () => {
  const output = createColorEngineTheme({ preset: "standard" });
  const css = output.css;
  const lightBase = output.primitives["surface-light"][1]?.oklch.l ?? 0;
  const darkBase = output.primitives["surface-dark"][1]?.oklch.l ?? 0;
  const lightHover = extractCssLightness(css, "--ds-surface-light-2-hover");
  const lightSelected = extractCssLightness(css, "--ds-surface-light-2-selected");
  const lightPressed = extractCssLightness(css, "--ds-surface-light-2-pressed");
  const darkHover = extractCssLightness(css, "--ds-surface-dark-2-hover");
  const darkSelected = extractCssLightness(css, "--ds-surface-dark-2-selected");
  const darkPressed = extractCssLightness(css, "--ds-surface-dark-2-pressed");

  assert.ok(lightHover < lightBase);
  assert.ok(lightSelected < lightHover);
  assert.ok(lightPressed < lightSelected);
  assert.ok(darkHover > darkBase);
  assert.ok(darkSelected > darkHover);
  assert.ok(darkPressed > darkSelected);
});

test("primary usage ramps separate soft containers from solid actions", () => {
  const output = createColorEngineTheme({ primarySeed: "oklch(0.5 0.16 150)" });
  const lightSoft = output.primitives["primary-light-soft"];
  const lightSolid = output.primitives["primary-light-solid"];
  const darkSoft = output.primitives["primary-dark-soft"];
  const darkSolid = output.primitives["primary-dark-solid"];

  assert.ok((lightSoft[0]?.oklch.l ?? 0) > (lightSolid[0]?.oklch.l ?? 1));
  assert.ok((lightSoft[0]?.oklch.c ?? 1) < (lightSolid[0]?.oklch.c ?? 0));
  assert.ok((darkSolid[1]?.oklch.l ?? 0) > (darkSoft[1]?.oklch.l ?? 1));
  assert.ok((darkSolid[1]?.oklch.c ?? 0) > (darkSoft[1]?.oklch.c ?? 1));
  assert.equal(output.semantics.light["primary-action-text"], "var(--ds-surface-light-1)");
  assert.equal(output.semantics.dark["primary-action-text"], "var(--ds-surface-dark-1)");
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
    () => createColorEngineTheme({ primarySeed: "rebeccapurple" }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED" &&
      error.field === "primarySeed",
  );
});

function rampSpan(output, family) {
  const ramp = output.primitives[family];

  return (ramp[3]?.oklch.l ?? 0) - (ramp[0]?.oklch.l ?? 0);
}

function extractCssLightness(css, propertyName) {
  const match = new RegExp(`${propertyName}: oklch\\(([^\\s]+) `).exec(css);

  assert.ok(match, `${propertyName} should be present in generated CSS`);

  return Number(match[1]);
}
