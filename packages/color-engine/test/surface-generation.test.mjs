import assert from "node:assert/strict";
import test from "node:test";
import {
  ColorEngineValidationError,
  NEUTRAL_SEMANTIC_TOKEN_NAMES,
  PRIMARY_SEMANTIC_TOKEN_NAMES,
  SEMANTIC_TOKEN_NAMES,
  SURFACE_PRESET_NAMES,
  SURFACE_SEMANTIC_TOKEN_NAMES,
  STATUS_SEMANTIC_TOKEN_NAMES,
  createColorEngineTheme,
  parseColorSeed,
} from "../dist/index.js";

const statusIntents = ["danger", "warning", "success", "info"];

test("createColorEngineTheme renders neutral, surface, primary, and status usage families", () => {
  const output = createColorEngineTheme();

  assert.deepEqual(Object.keys(output.primitives).sort(), [
    "danger-dark-soft",
    "danger-dark-solid",
    "danger-light-soft",
    "danger-light-solid",
    "info-dark-soft",
    "info-dark-solid",
    "info-light-soft",
    "info-light-solid",
    "neutral-dark",
    "neutral-light",
    "primary-dark-soft",
    "primary-dark-solid",
    "primary-light-soft",
    "primary-light-solid",
    "success-dark-soft",
    "success-dark-solid",
    "success-light-soft",
    "success-light-solid",
    "surface-dark",
    "surface-light",
    "warning-dark-soft",
    "warning-dark-solid",
    "warning-light-soft",
    "warning-light-solid",
  ]);
  assert.equal(output.primitives["surface-light"].length, 4);
  assert.equal(output.primitives["surface-dark"].length, 4);
  assert.equal(output.primitives["primary-light-soft"].length, 4);
  assert.equal(output.primitives["primary-dark-solid"].length, 4);
  assert.equal(output.primitives["danger-light-soft"].length, 4);
  assert.equal(output.primitives["warning-dark-solid"].length, 4);
  assert.equal(NEUTRAL_SEMANTIC_TOKEN_NAMES.length, 8);
  assert.equal(SURFACE_SEMANTIC_TOKEN_NAMES.length, 16);
  assert.equal(PRIMARY_SEMANTIC_TOKEN_NAMES.length, 11);
  assert.equal(STATUS_SEMANTIC_TOKEN_NAMES.length, 32);
  assert.equal(SEMANTIC_TOKEN_NAMES.length, 67);
  assert.equal(Object.keys(output.semantics.light).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(Object.keys(output.semantics.dark).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(output.semantics.light["text-primary"], "var(--ds-neutral-dark-1)");
  assert.equal(output.semantics.dark["text-primary"], "var(--ds-neutral-light-4)");
  assert.equal(output.semantics.light["border-subtle"], "var(--ds-surface-light-1-hover)");
  assert.equal(output.semantics.dark["control-bg"], "var(--ds-surface-dark-2)");
  assert.equal(output.semantics.light["surface-1"], "var(--ds-surface-light-1)");
  assert.equal(output.semantics.dark["surface-1"], "var(--ds-surface-dark-1)");
  assert.equal(output.semantics.light["primary-action-bg"], "var(--ds-primary-light-solid-2)");
  assert.equal(output.semantics.dark["primary-action-bg"], "var(--ds-primary-dark-solid-2)");
  assert.equal(output.semantics.light["danger-soft-bg"], "var(--ds-danger-light-soft-1)");
  assert.equal(output.semantics.dark["warning-solid-bg"], "var(--ds-warning-dark-solid-2)");
  assert.match(output.cssOutput.primitives, /^:root \{/);
  assert.match(output.cssOutput.themes.light, /^\[data-theme-v2="light"\] \{/);
  assert.match(output.cssOutput.themes.dark, /^\[data-theme-v2="dark"\] \{/);
  assert.equal(output.css, output.cssOutput.all);
  assert.match(output.css, /\[data-theme-v2="light"\]/);
  assert.match(output.css, /--ds-text-primary: var\(--ds-neutral-dark-1\);/);
  assert.match(output.css, /--ds-surface-1-hover: var\(--ds-surface-light-1-hover\);/);
  assert.match(output.css, /--ds-primary-action-bg: var\(--ds-primary-light-solid-2\);/);
  assert.match(output.css, /--ds-success-soft-border: var\(--ds-success-light-soft-4\);/);
});

test("surface, primary, and status seeds control usage families independently", () => {
  const output = createColorEngineTheme({
    neutralSeed: "oklch(0.8 0.02 160)",
    surfaceLightSeed: "oklch(0.93 0.018 120)",
    surfaceDarkSeed: "oklch(0.11 0.02 220)",
    primarySeed: "oklch(0.52 0.14 145)",
    dangerSeed: "oklch(0.54 0.14 30)",
    warningSeed: "oklch(0.62 0.1 76)",
    successSeed: "oklch(0.52 0.12 154)",
    infoSeed: "oklch(0.55 0.11 240)",
  });

  assert.equal(output.primitives["surface-light"][0]?.oklch.h, 120);
  assert.equal(output.primitives["surface-dark"][0]?.oklch.h, 220);
  assert.equal(output.primitives["neutral-light"][0]?.oklch.h, 160);
  assert.equal(output.primitives["primary-light-solid"][0]?.oklch.h, 145);
  assert.equal(output.primitives["primary-dark-soft"][0]?.oklch.h, 145);
  assert.equal(output.seeds.primary.h, 145);
  assert.equal(output.primitives["danger-light-solid"][0]?.oklch.h, 30);
  assert.equal(output.primitives["warning-dark-soft"][0]?.oklch.h, 76);
  assert.equal(output.primitives["success-light-soft"][0]?.oklch.h, 154);
  assert.equal(output.primitives["info-dark-solid"][0]?.oklch.h, 240);
  assert.equal(output.seeds.status.warning.h, 76);
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

test("status usage ramps separate soft containers from solid emphasis for every intent", () => {
  const output = createColorEngineTheme({
    dangerSeed: "oklch(0.54 0.16 30)",
    warningSeed: "oklch(0.62 0.12 76)",
    successSeed: "oklch(0.52 0.13 154)",
    infoSeed: "oklch(0.55 0.12 240)",
  });

  for (const intent of statusIntents) {
    const lightSoft = output.primitives[`${intent}-light-soft`];
    const lightSolid = output.primitives[`${intent}-light-solid`];
    const darkSoft = output.primitives[`${intent}-dark-soft`];
    const darkSolid = output.primitives[`${intent}-dark-solid`];

    assert.ok((lightSoft[0]?.oklch.l ?? 0) > (lightSolid[0]?.oklch.l ?? 1), `${intent} light soft should be lighter than solid`);
    assert.ok((lightSoft[0]?.oklch.c ?? 1) < (lightSolid[0]?.oklch.c ?? 0), `${intent} light soft should be lower chroma than solid`);
    assert.ok((darkSolid[1]?.oklch.l ?? 0) > (darkSoft[1]?.oklch.l ?? 1), `${intent} dark solid should be brighter than soft`);
    assert.ok((darkSolid[1]?.oklch.c ?? 0) > (darkSoft[1]?.oklch.c ?? 1), `${intent} dark solid should be higher chroma than soft`);
    assert.equal(output.semantics.light[`${intent}-solid-text`], "var(--ds-surface-light-1)");
    assert.equal(output.semantics.dark[`${intent}-solid-text`], "var(--ds-surface-dark-1)");
  }
});

test("warning status uses softer chroma than danger at matching solid seed chroma", () => {
  const output = createColorEngineTheme({
    dangerSeed: "oklch(0.55 0.16 30)",
    warningSeed: "oklch(0.55 0.16 76)",
  });
  const dangerSolid = output.primitives["danger-light-solid"][1]?.oklch.c ?? 0;
  const warningSolid = output.primitives["warning-light-solid"][1]?.oklch.c ?? 0;
  const warningLight = output.primitives["warning-light-solid"][1]?.oklch.l ?? 0;

  assert.ok(warningSolid < dangerSolid);
  assert.ok(warningLight > 0.5);
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
    () => createColorEngineTheme({ warningSeed: "rebeccapurple" }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED" &&
      error.field === "warningSeed",
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
