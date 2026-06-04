import assert from "node:assert/strict";
import test from "node:test";
import {
  CHROME_LEVELS,
  COLOR_ENGINE_CSS_LOAD_ORDER,
  COLOR_ENGINE_THEME_PRESET_NAMES,
  COLOR_ENGINE_THEME_PRESETS,
  ColorEngineValidationError,
  NEUTRAL_SEMANTIC_TOKEN_NAMES,
  PRIMARY_SEMANTIC_TOKEN_NAMES,
  SEED_POLICY_NAMES,
  SEMANTIC_TOKEN_NAMES,
  SURFACE_PRESET_NAMES,
  SURFACE_SEMANTIC_TOKEN_NAMES,
  STATUS_SEMANTIC_TOKEN_NAMES,
  TEXT_LEVELS,
  TEXT_TREATMENT_STRATEGY_NAMES,
  createColorEngineTheme,
  parseColorSeed,
} from "../dist/index.js";

const statusIntents = ["danger", "warning", "success", "info"];

test("createColorEngineTheme renders neutral, surface, primary, and status usage families", () => {
  const output = createColorEngineTheme();

  assert.deepEqual(Object.keys(output.primitives).sort(), [
    "chrome-dark",
    "chrome-light",
    "danger-dark-soft",
    "danger-dark-solid",
    "danger-light-soft",
    "danger-light-solid",
    "danger-seed",
    "info-dark-soft",
    "info-dark-solid",
    "info-light-soft",
    "info-light-solid",
    "info-seed",
    "neutral-dark",
    "neutral-light",
    "primary-dark-soft",
    "primary-dark-solid",
    "primary-light-soft",
    "primary-light-solid",
    "primary-seed",
    "success-dark-soft",
    "success-dark-solid",
    "success-light-soft",
    "success-light-solid",
    "success-seed",
    "surface-dark",
    "surface-light",
    "text-dark",
    "text-light",
    "warning-dark-soft",
    "warning-dark-solid",
    "warning-light-soft",
    "warning-light-solid",
    "warning-seed",
  ]);
  assert.deepEqual(SEED_POLICY_NAMES, ["balanced", "anchored"]);
  assert.deepEqual(TEXT_TREATMENT_STRATEGY_NAMES, ["same-hue", "neutral", "adaptive"]);
  assert.deepEqual(TEXT_LEVELS, ["strong", "primary", "secondary", "muted", "disabled"]);
  assert.deepEqual(CHROME_LEVELS, ["subtle", "default", "strong"]);
  assert.equal(output.preset.name, "standard");
  assert.equal(output.surfacePresets.light.name, "standard");
  assert.equal(output.surfacePresets.dark.name, "standard");
  assert.equal(output.input.preset, "standard");
  assert.equal(output.input.lightSurfacePreset, "standard");
  assert.equal(output.input.darkSurfacePreset, "standard");
  assert.equal(output.seedPolicies.primary, "balanced");
  assert.equal(output.seedPolicies.status.danger, "balanced");
  assert.equal(output.textTreatment.name, "same-hue");
  assert.equal(output.primitives["surface-light"].length, 4);
  assert.equal(output.primitives["surface-dark"].length, 4);
  assert.equal(output.primitives["chrome-light"].length, 3);
  assert.equal(output.primitives["chrome-dark"].length, 3);
  assert.equal(output.primitives["text-dark"].length, 5);
  assert.equal(output.primitives["text-light"].length, 5);
  assert.equal(output.primitives["text-dark"][0]?.name, "text-dark-strong");
  assert.equal(output.primitives["text-light"][0]?.name, "text-light-strong");
  assert.ok((output.primitives["text-dark"][0]?.oklch.l ?? 1) < 0.05);
  assert.ok((output.primitives["text-light"][0]?.oklch.l ?? 0) > 0.99);
  assert.equal(output.primitives["primary-seed"].length, 1);
  assert.equal(output.primitives["primary-light-soft"].length, 4);
  assert.equal(output.primitives["primary-dark-solid"].length, 4);
  assert.equal(output.primitives["warning-seed"].length, 1);
  assert.equal(output.primitives["danger-light-soft"].length, 4);
  assert.equal(output.primitives["warning-dark-solid"].length, 4);
  assert.equal(NEUTRAL_SEMANTIC_TOKEN_NAMES.length, 10);
  assert.equal(SURFACE_SEMANTIC_TOKEN_NAMES.length, 16);
  assert.equal(PRIMARY_SEMANTIC_TOKEN_NAMES.length, 11);
  assert.equal(STATUS_SEMANTIC_TOKEN_NAMES.length, 32);
  assert.equal(SEMANTIC_TOKEN_NAMES.length, 69);
  assert.equal(Object.keys(output.semantics.light).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(Object.keys(output.semantics.dark).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(output.semantics.light["text-primary"], "var(--ds-text-dark-primary)");
  assert.equal(output.semantics.dark["text-primary"], "var(--ds-text-light-primary)");
  assert.equal(output.semantics.light["border-subtle"], "var(--ds-chrome-light-subtle)");
  assert.equal(output.semantics.light["border-default"], "var(--ds-chrome-light-default)");
  assert.equal(output.semantics.light["border-strong"], "var(--ds-chrome-light-strong)");
  assert.equal(output.semantics.light["control-border"], "var(--ds-chrome-light-default)");
  assert.equal(output.semantics.dark["control-bg"], "var(--ds-surface-dark-2)");
  assert.equal(output.semantics.light["surface-1"], "var(--ds-surface-light-1)");
  assert.equal(output.semantics.dark["surface-1"], "var(--ds-surface-dark-1)");
  assert.equal(output.semantics.light["primary-action-bg"], "var(--ds-primary-light-solid-2)");
  assert.equal(output.semantics.dark["primary-action-bg"], "var(--ds-primary-dark-solid-2)");
  assert.equal(output.semantics.light["primary-soft-text"], "var(--ds-primary-light-solid-4)");
  assert.equal(output.semantics.dark["primary-soft-text"], "var(--ds-primary-dark-solid-1)");
  assert.equal(output.semantics.light["danger-soft-bg"], "var(--ds-danger-light-soft-1)");
  assert.equal(output.semantics.light["danger-soft-text"], "var(--ds-danger-light-solid-4)");
  assert.equal(output.semantics.dark["warning-solid-bg"], "var(--ds-warning-dark-solid-2)");
  assert.match(output.cssOutput.primitives, /^:root \{/);
  assert.match(output.cssOutput.themes.light, /^\[data-theme-v2="light"\] \{/);
  assert.match(output.cssOutput.themes.dark, /^\[data-theme-v2="dark"\] \{/);
  assert.deepEqual(
    output.cssOutput.files.map((file) => file.fileName),
    [...COLOR_ENGINE_CSS_LOAD_ORDER],
  );
  assert.deepEqual(
    output.cssOutput.files.map((file) => file.kind),
    ["primitives", "theme", "theme"],
  );
  assert.deepEqual(
    output.cssOutput.files.map((file) => file.theme ?? null),
    [null, "light", "dark"],
  );
  assert.equal(output.cssOutput.files[0].css, output.cssOutput.primitives);
  assert.equal(output.cssOutput.files[1].css, output.cssOutput.themes.light);
  assert.equal(output.cssOutput.files[2].css, output.cssOutput.themes.dark);
  assert.equal(output.cssOutput.all, output.cssOutput.files.map((file) => file.css).join("\n\n"));
  assert.equal(output.css, output.cssOutput.all);
  assert.match(output.css, /\[data-theme-v2="light"\]/);
  assert.doesNotMatch(output.css, /\[data-theme-v2="high-contrast/);
  assert.match(output.css, /--ds-chrome-light-default: oklch\(/);
  assert.match(output.css, /--ds-border-default: var\(--ds-chrome-light-default\);/);
  assert.match(output.css, /--ds-primary-seed: oklch\(/);
  assert.doesNotMatch(output.css, /--ds-primary-seed-hover:/);
  assert.match(output.css, /--ds-text-dark-strong: oklch\(/);
  assert.match(output.css, /--ds-text-light-strong: oklch\(/);
  assert.doesNotMatch(output.css, /--ds-text-dark-strong-hover:/);
  assert.match(output.css, /--ds-text-primary: var\(--ds-text-dark-primary\);/);
  assert.match(output.css, /--ds-surface-1-hover: var\(--ds-surface-light-1-hover\);/);
  assert.match(output.css, /--ds-primary-action-bg: var\(--ds-primary-light-solid-2\);/);
  assert.match(output.css, /--ds-success-soft-border: var\(--ds-success-light-soft-4\);/);
});

test("chrome ramps separate structural borders from surface states", () => {
  const quiet = createColorEngineTheme({ preset: "quiet" });
  const separated = createColorEngineTheme({ preset: "high-separation" });
  const quietLight = quiet.primitives["chrome-light"];
  const quietDark = quiet.primitives["chrome-dark"];
  const separatedLight = separated.primitives["chrome-light"];

  assert.ok((quietLight[0]?.oklch.l ?? 0) > (quietLight[1]?.oklch.l ?? 1));
  assert.ok((quietLight[1]?.oklch.l ?? 0) > (quietLight[2]?.oklch.l ?? 1));
  assert.ok((quietDark[0]?.oklch.l ?? 1) < (quietDark[1]?.oklch.l ?? 0));
  assert.ok((quietDark[1]?.oklch.l ?? 1) < (quietDark[2]?.oklch.l ?? 0));
  assert.ok(chromeSpan(separated, "chrome-light") > chromeSpan(quiet, "chrome-light"));
  assert.equal(quiet.semantics.light["border-default"], "var(--ds-chrome-light-default)");
  assert.equal(quiet.semantics.dark["border-default"], "var(--ds-chrome-dark-default)");
});

test("anchored seed policy preserves exact parsed seeds as solid rest steps", () => {
  const primarySeed = "oklch(0.51 0.123 144)";
  const dangerSeed = "oklch(0.57 0.155 28)";
  const warningSeed = "oklch(0.72 0.18 88)";
  const infoSeed = "oklch(0.5 0.31 250)";
  const output = createColorEngineTheme({
    primarySeed,
    primarySeedPolicy: "anchored",
    dangerSeed,
    dangerSeedPolicy: "anchored",
    warningSeed,
    warningSeedPolicy: "anchored",
    infoSeed,
    infoSeedPolicy: "anchored",
  });

  assert.deepEqual(output.primitives["primary-seed"][0]?.oklch, parseColorSeed(primarySeed));
  assert.deepEqual(output.primitives["danger-seed"][0]?.oklch, parseColorSeed(dangerSeed));
  assert.deepEqual(output.primitives["warning-seed"][0]?.oklch, parseColorSeed(warningSeed));
  assert.deepEqual(output.primitives["info-seed"][0]?.oklch, parseColorSeed(infoSeed));
  assert.deepEqual(output.primitives["primary-light-solid"][1]?.oklch, parseColorSeed(primarySeed));
  assert.deepEqual(output.primitives["primary-dark-solid"][1]?.oklch, parseColorSeed(primarySeed));
  assert.deepEqual(output.primitives["danger-light-solid"][1]?.oklch, parseColorSeed(dangerSeed));
  assert.deepEqual(output.primitives["warning-dark-solid"][1]?.oklch, parseColorSeed(warningSeed));
  assert.deepEqual(output.primitives["info-light-solid"][1]?.oklch, parseColorSeed(infoSeed));
  assert.equal(output.semantics.light["primary-action-bg"], "var(--ds-primary-light-solid-2)");
  assert.equal(output.semantics.light["warning-solid-bg"], "var(--ds-warning-light-solid-2)");
  assert.equal(output.seedPolicies.primary, "anchored");
  assert.equal(output.seedPolicies.status.warning, "anchored");
});

test("omitted dark seeds fall back to the matching light/default seed", () => {
  const input = {
    primarySeed: "oklch(0.52 0.14 145)",
    warningSeed: "oklch(0.62 0.1 76)",
  };
  const fallback = createColorEngineTheme(input);
  const explicit = createColorEngineTheme({
    ...input,
    primaryDarkSeed: input.primarySeed,
    warningDarkSeed: input.warningSeed,
  });

  assert.deepEqual(fallback.seeds.primaryDark, parseColorSeed(input.primarySeed));
  assert.deepEqual(fallback.seeds.statusDark.warning, parseColorSeed(input.warningSeed));
  assert.deepEqual(fallback.primitives["primary-dark-soft"], explicit.primitives["primary-dark-soft"]);
  assert.deepEqual(fallback.primitives["primary-dark-solid"], explicit.primitives["primary-dark-solid"]);
  assert.deepEqual(fallback.primitives["warning-dark-soft"], explicit.primitives["warning-dark-soft"]);
  assert.deepEqual(fallback.primitives["warning-dark-solid"], explicit.primitives["warning-dark-solid"]);
});

test("dark seeds override dark usage families without changing light output", () => {
  const statusLightSeeds = {
    danger: "oklch(0.54 0.14 30)",
    warning: "oklch(0.62 0.1 76)",
    success: "oklch(0.52 0.12 154)",
    info: "oklch(0.55 0.11 240)",
  };
  const statusDarkSeeds = {
    danger: "oklch(0.68 0.12 24)",
    warning: "oklch(0.74 0.12 92)",
    success: "oklch(0.69 0.11 142)",
    info: "oklch(0.7 0.1 220)",
  };
  const base = createColorEngineTheme({
    primarySeed: "oklch(0.52 0.14 145)",
    dangerSeed: statusLightSeeds.danger,
    warningSeed: statusLightSeeds.warning,
    successSeed: statusLightSeeds.success,
    infoSeed: statusLightSeeds.info,
  });
  const overridden = createColorEngineTheme({
    primarySeed: "oklch(0.52 0.14 145)",
    primaryDarkSeed: "oklch(0.68 0.12 250)",
    dangerSeed: statusLightSeeds.danger,
    dangerDarkSeed: statusDarkSeeds.danger,
    warningSeed: statusLightSeeds.warning,
    warningDarkSeed: statusDarkSeeds.warning,
    successSeed: statusLightSeeds.success,
    successDarkSeed: statusDarkSeeds.success,
    infoSeed: statusLightSeeds.info,
    infoDarkSeed: statusDarkSeeds.info,
  });

  assert.deepEqual(overridden.primitives["primary-light-soft"], base.primitives["primary-light-soft"]);
  assert.deepEqual(overridden.primitives["primary-light-solid"], base.primitives["primary-light-solid"]);
  assert.notDeepEqual(overridden.primitives["primary-dark-solid"], base.primitives["primary-dark-solid"]);
  assert.equal(overridden.primitives["primary-dark-soft"][0]?.oklch.h, 250);
  assert.equal(overridden.seeds.primary.h, 145);
  assert.equal(overridden.seeds.primaryDark.h, 250);

  for (const intent of statusIntents) {
    const lightSeed = parseColorSeed(statusLightSeeds[intent]);
    const darkSeed = parseColorSeed(statusDarkSeeds[intent]);

    assert.deepEqual(overridden.primitives[`${intent}-light-soft`], base.primitives[`${intent}-light-soft`], intent);
    assert.deepEqual(overridden.primitives[`${intent}-light-solid`], base.primitives[`${intent}-light-solid`], intent);
    assert.notDeepEqual(overridden.primitives[`${intent}-dark-soft`], base.primitives[`${intent}-dark-soft`], intent);
    assert.notDeepEqual(overridden.primitives[`${intent}-dark-solid`], base.primitives[`${intent}-dark-solid`], intent);
    assert.equal(overridden.primitives[`${intent}-dark-solid`][0]?.oklch.h, darkSeed.h, intent);
    assert.equal(overridden.seeds.status[intent].h, lightSeed.h, intent);
    assert.equal(overridden.seeds.statusDark[intent].h, darkSeed.h, intent);
  }
});

test("anchored policy preserves theme-specific seeds as solid rest steps", () => {
  const primarySeed = "oklch(0.51 0.123 144)";
  const primaryDarkSeed = "oklch(0.68 0.11 248)";
  const warningSeed = "oklch(0.72 0.18 88)";
  const warningDarkSeed = "oklch(0.76 0.12 96)";
  const output = createColorEngineTheme({
    primarySeed,
    primaryDarkSeed,
    primarySeedPolicy: "anchored",
    warningSeed,
    warningDarkSeed,
    warningSeedPolicy: "anchored",
  });

  assert.deepEqual(output.primitives["primary-light-solid"][1]?.oklch, parseColorSeed(primarySeed));
  assert.deepEqual(output.primitives["primary-dark-solid"][1]?.oklch, parseColorSeed(primaryDarkSeed));
  assert.deepEqual(output.primitives["warning-light-solid"][1]?.oklch, parseColorSeed(warningSeed));
  assert.deepEqual(output.primitives["warning-dark-solid"][1]?.oklch, parseColorSeed(warningDarkSeed));
});

test("balanced seed policy keeps previous status recipe behavior", () => {
  const seed = "oklch(0.72 0.18 88)";
  const balanced = createColorEngineTheme({ warningSeed: seed });
  const explicitBalanced = createColorEngineTheme({
    warningSeed: seed,
    warningSeedPolicy: "balanced",
  });
  const anchored = createColorEngineTheme({
    warningSeed: seed,
    warningSeedPolicy: "anchored",
  });

  assert.deepEqual(explicitBalanced.primitives["warning-light-solid"], balanced.primitives["warning-light-solid"]);
  assert.notDeepEqual(anchored.primitives["warning-light-solid"][1]?.oklch, balanced.primitives["warning-light-solid"][1]?.oklch);
  assert.deepEqual(anchored.primitives["warning-light-solid"][1]?.oklch, parseColorSeed(seed));
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

test("theme-specific surface presets fall back to the shared preset", () => {
  const fallback = createColorEngineTheme({ preset: "layered" });
  const explicit = createColorEngineTheme({
    preset: "layered",
    lightSurfacePreset: "layered",
    darkSurfacePreset: "layered",
  });

  assert.equal(fallback.preset.name, "layered");
  assert.equal(fallback.surfacePresets.light.name, "layered");
  assert.equal(fallback.surfacePresets.dark.name, "layered");
  assert.equal(fallback.input.lightSurfacePreset, "layered");
  assert.equal(fallback.input.darkSurfacePreset, "layered");
  assert.deepEqual(fallback.primitives["surface-light"], explicit.primitives["surface-light"]);
  assert.deepEqual(fallback.primitives["surface-dark"], explicit.primitives["surface-dark"]);
  assert.deepEqual(fallback.primitives["chrome-light"], explicit.primitives["chrome-light"]);
  assert.deepEqual(fallback.primitives["chrome-dark"], explicit.primitives["chrome-dark"]);
  assert.equal(
    extractCssLightness(fallback.css, "--ds-surface-light-2-hover"),
    extractCssLightness(explicit.css, "--ds-surface-light-2-hover"),
  );
  assert.equal(
    extractCssLightness(fallback.css, "--ds-surface-dark-2-hover"),
    extractCssLightness(explicit.css, "--ds-surface-dark-2-hover"),
  );
});

test("theme-specific surface presets isolate light and dark surface output", () => {
  const shared = createColorEngineTheme({ preset: "standard" });
  const quiet = createColorEngineTheme({ preset: "quiet" });
  const highSeparation = createColorEngineTheme({ preset: "high-separation" });
  const split = createColorEngineTheme({
    preset: "standard",
    lightSurfacePreset: "quiet",
    darkSurfacePreset: "high-separation",
  });

  assert.equal(split.preset.name, "standard");
  assert.equal(split.surfacePresets.light.name, "quiet");
  assert.equal(split.surfacePresets.dark.name, "high-separation");
  assert.equal(split.input.lightSurfacePreset, "quiet");
  assert.equal(split.input.darkSurfacePreset, "high-separation");
  assert.notDeepEqual(split.primitives["surface-light"], shared.primitives["surface-light"]);
  assert.notDeepEqual(split.primitives["surface-dark"], shared.primitives["surface-dark"]);
  assert.notDeepEqual(split.primitives["chrome-light"], shared.primitives["chrome-light"]);
  assert.notDeepEqual(split.primitives["chrome-dark"], shared.primitives["chrome-dark"]);
  assert.ok(rampSpan(split, "surface-light") < rampSpan(shared, "surface-light"));
  assert.ok(rampSpan(split, "surface-dark") > rampSpan(shared, "surface-dark"));
  assert.deepEqual(split.primitives["surface-light"], quiet.primitives["surface-light"]);
  assert.deepEqual(split.primitives["surface-dark"], highSeparation.primitives["surface-dark"]);
  assert.deepEqual(split.primitives["chrome-light"], quiet.primitives["chrome-light"]);
  assert.deepEqual(split.primitives["chrome-dark"], highSeparation.primitives["chrome-dark"]);
  assert.equal(
    extractCssLightness(split.css, "--ds-surface-light-2-hover"),
    extractCssLightness(quiet.css, "--ds-surface-light-2-hover"),
  );
  assert.equal(
    extractCssLightness(split.css, "--ds-surface-dark-2-hover"),
    extractCssLightness(highSeparation.css, "--ds-surface-dark-2-hover"),
  );
  assert.deepEqual(split.primitives["primary-light-solid"], shared.primitives["primary-light-solid"]);
  assert.deepEqual(split.primitives["primary-dark-solid"], shared.primitives["primary-dark-solid"]);
  assert.deepEqual(split.primitives["danger-light-solid"], shared.primitives["danger-light-solid"]);
  assert.deepEqual(split.primitives["danger-dark-solid"], shared.primitives["danger-dark-solid"]);
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

test("example theme presets are valid balanced starting points", () => {
  assert.deepEqual(COLOR_ENGINE_THEME_PRESET_NAMES, [
    "evergreen",
    "civic-blue",
    "plum",
    "teal",
  ]);

  for (const name of COLOR_ENGINE_THEME_PRESET_NAMES) {
    const themePreset = COLOR_ENGINE_THEME_PRESETS[name];
    const output = createColorEngineTheme({
      ...themePreset.input,
      namespace: "pf",
    });

    assert.equal(themePreset.name, name);
    assert.equal(typeof themePreset.label, "string");
    assert.equal(themePreset.label.length > 0, true);
    assert.equal(typeof themePreset.description, "string");
    assert.equal(themePreset.description.length > 0, true);
    assert.equal(output.namespace, "pf");
    assert.equal(output.input.preset, themePreset.input.preset);
    assert.equal(output.input.lightSurfacePreset, themePreset.input.lightSurfacePreset);
    assert.equal(output.input.darkSurfacePreset, themePreset.input.darkSurfacePreset);
    assert.equal(output.surfacePresets.light.name, themePreset.input.lightSurfacePreset);
    assert.equal(output.surfacePresets.dark.name, themePreset.input.darkSurfacePreset);
    assert.equal(output.input.primarySeedPolicy, "balanced", name);
    assert.equal(output.input.dangerSeedPolicy, "balanced", name);
    assert.equal(output.input.warningSeedPolicy, "balanced", name);
    assert.equal(output.input.successSeedPolicy, "balanced", name);
    assert.equal(output.input.infoSeedPolicy, "balanced", name);
    assert.equal(output.input.textTreatment, "same-hue", name);
    assert.equal(typeof themePreset.input.primaryDarkSeed, "string");
    assert.equal(typeof themePreset.input.dangerDarkSeed, "string");
    assert.equal(typeof themePreset.input.warningDarkSeed, "string");
    assert.equal(typeof themePreset.input.successDarkSeed, "string");
    assert.equal(typeof themePreset.input.infoDarkSeed, "string");
    assert.deepEqual(output.seeds.primaryDark, parseColorSeed(themePreset.input.primaryDarkSeed));
    assert.deepEqual(output.seeds.statusDark.danger, parseColorSeed(themePreset.input.dangerDarkSeed));
    assert.deepEqual(output.seeds.statusDark.warning, parseColorSeed(themePreset.input.warningDarkSeed));
    assert.deepEqual(output.seeds.statusDark.success, parseColorSeed(themePreset.input.successDarkSeed));
    assert.deepEqual(output.seeds.statusDark.info, parseColorSeed(themePreset.input.infoDarkSeed));
    assert.deepEqual(
      output.assertions.results.filter((result) => !result.passed && result.severity === "required"),
      [],
      name,
    );
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
  assert.equal(output.semantics.light["primary-action-text"], "var(--ds-text-light-strong)");
  assert.equal(output.semantics.dark["primary-action-text"], "var(--ds-text-dark-strong)");
});

test("status usage ramps separate soft containers from solid emphasis for every intent", () => {
  const output = createColorEngineTheme({
    dangerSeed: "oklch(0.54 0.16 30)",
    warningSeed: "oklch(0.62 0.12 76)",
    successSeed: "oklch(0.52 0.13 154)",
    infoSeed: "oklch(0.55 0.12 240)",
  });
  const allowedLightSolidText = new Set([
    "var(--ds-text-light-strong)",
    "var(--ds-text-light-primary)",
    "var(--ds-text-dark-strong)",
    "var(--ds-text-dark-primary)",
  ]);
  const allowedDarkSolidText = new Set([
    "var(--ds-text-dark-strong)",
    "var(--ds-text-dark-primary)",
    "var(--ds-text-light-strong)",
    "var(--ds-text-light-primary)",
  ]);

  for (const intent of statusIntents) {
    const lightSoft = output.primitives[`${intent}-light-soft`];
    const lightSolid = output.primitives[`${intent}-light-solid`];
    const darkSoft = output.primitives[`${intent}-dark-soft`];
    const darkSolid = output.primitives[`${intent}-dark-solid`];

    assert.ok((lightSoft[0]?.oklch.l ?? 0) > (lightSolid[0]?.oklch.l ?? 1), `${intent} light soft should be lighter than solid`);
    assert.ok((lightSoft[0]?.oklch.c ?? 1) < (lightSolid[0]?.oklch.c ?? 0), `${intent} light soft should be lower chroma than solid`);
    assert.ok((darkSolid[1]?.oklch.l ?? 0) > (darkSoft[1]?.oklch.l ?? 1), `${intent} dark solid should be brighter than soft`);
    assert.ok((darkSolid[1]?.oklch.c ?? 0) > (darkSoft[1]?.oklch.c ?? 1), `${intent} dark solid should be higher chroma than soft`);
    assert.equal(allowedLightSolidText.has(output.semantics.light[`${intent}-solid-text`]), true);
    assert.equal(allowedDarkSolidText.has(output.semantics.dark[`${intent}-solid-text`]), true);
  }

  assert.deepEqual(
    output.assertions.results.filter((result) => result.role === "status-solid" && !result.passed),
    [],
  );
});

test("text treatment strategies switch soft colored surface text without changing soft backgrounds", () => {
  const sameHue = createColorEngineTheme({ textTreatment: "same-hue" });
  const neutral = createColorEngineTheme({ textTreatment: "neutral" });
  const adaptive = createColorEngineTheme({ textTreatment: "adaptive" });

  assert.deepEqual(neutral.primitives["primary-light-soft"], sameHue.primitives["primary-light-soft"]);
  assert.deepEqual(adaptive.primitives["danger-dark-soft"], sameHue.primitives["danger-dark-soft"]);
  assert.equal(sameHue.semantics.light["primary-soft-text"], "var(--ds-primary-light-solid-4)");
  assert.equal(sameHue.semantics.dark["warning-soft-text"], "var(--ds-warning-dark-solid-1)");
  assert.equal(neutral.semantics.light["primary-soft-text"], "var(--ds-text-dark-primary)");
  assert.equal(neutral.semantics.dark["primary-soft-text"], "var(--ds-text-light-primary)");
  assert.equal(neutral.semantics.light["danger-soft-text"], "var(--ds-text-dark-primary)");
  assert.equal(neutral.semantics.dark["info-soft-text"], "var(--ds-text-light-primary)");
  assert.equal(adaptive.assertions.results.every((result) =>
    result.severity !== "required" || result.passed
  ), true);
});

test("text treatment defaults and fallback preserve same-hue output", () => {
  const implicit = createColorEngineTheme();
  const explicit = createColorEngineTheme({ textTreatment: "same-hue" });

  assert.deepEqual(explicit.semantics, implicit.semantics);
  assert.equal(implicit.input.textTreatment, "same-hue");
});

test("status solid text preserves intended foregrounds when they pass", () => {
  const output = createColorEngineTheme({
    dangerSeed: "oklch(0.54 0.16 30)",
    successSeed: "oklch(0.52 0.13 154)",
    infoSeed: "oklch(0.55 0.12 240)",
  });

  assert.equal(output.semantics.light["danger-solid-text"], "var(--ds-text-light-strong)");
  assert.equal(output.semantics.light["success-solid-text"], "var(--ds-text-light-strong)");
  assert.equal(output.semantics.light["info-solid-text"], "var(--ds-text-light-strong)");
  assert.equal(output.semantics.dark["danger-solid-text"], "var(--ds-text-dark-strong)");
  assert.equal(output.semantics.dark["success-solid-text"], "var(--ds-text-dark-strong)");
  assert.equal(output.semantics.dark["info-solid-text"], "var(--ds-text-dark-strong)");
});

test("status solid text resolves to readable approved candidates when fixed polarity fails", () => {
  const warning = createColorEngineTheme({ warningSeed: "#e3bb1d" });
  const darkBlue = createColorEngineTheme({
    infoSeed: "#064276",
    infoSeedPolicy: "anchored",
  });

  assert.equal(warning.input.warningSeed, "#e3bb1d");
  assert.equal(warning.semantics.light["warning-solid-text"], "var(--ds-text-light-strong)");
  assert.deepEqual(
    warning.assertions.results.filter((result) => result.role === "status-solid" && !result.passed),
    [],
  );
  assert.equal(darkBlue.semantics.dark["info-solid-text"], "var(--ds-text-light-strong)");
  assert.deepEqual(
    darkBlue.assertions.results.filter((result) =>
      result.theme === "dark" &&
      result.role === "status-solid" &&
      result.id.includes("info") &&
      !result.passed
    ),
    [],
  );
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

test("createColorEngineTheme rejects invalid seed policies", () => {
  assert.throws(
    () => createColorEngineTheme({ primarySeedPolicy: "strict" }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED_POLICY" &&
      error.field === "primarySeedPolicy",
  );
});

test("createColorEngineTheme rejects invalid text treatment strategies", () => {
  assert.throws(
    () => createColorEngineTheme({ textTreatment: "slider-mode" }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_TEXT_TREATMENT" &&
      error.field === "textTreatment",
  );
});

test("createColorEngineTheme rejects invalid theme-specific surface presets", () => {
  assert.throws(
    () => createColorEngineTheme({ lightSurfacePreset: "flatland" }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_PRESET" &&
      error.field === "lightSurfacePreset",
  );
  assert.throws(
    () => createColorEngineTheme({ darkSurfacePreset: "flatland" }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_PRESET" &&
      error.field === "darkSurfacePreset",
  );
});

function rampSpan(output, family) {
  const ramp = output.primitives[family];

  return (ramp[3]?.oklch.l ?? 0) - (ramp[0]?.oklch.l ?? 0);
}

function chromeSpan(output, family) {
  const ramp = output.primitives[family];

  return Math.abs((ramp[2]?.oklch.l ?? 0) - (ramp[0]?.oklch.l ?? 0));
}

function extractCssLightness(css, propertyName) {
  const match = new RegExp(`${propertyName}: oklch\\(([^\\s]+) `).exec(css);

  assert.ok(match, `${propertyName} should be present in generated CSS`);

  return Number(match[1]);
}
