import assert from "node:assert/strict";
import test from "node:test";
import {
  CHROME_LEVELS,
  COLOR_ENGINE_CSS_LOAD_ORDER,
  COLOR_ENGINE_THEME_PRESET_NAMES,
  COLOR_ENGINE_THEME_PRESETS,
  CUSTOM_COLOR_ROLE_SEMANTIC_PARTS,
  ColorEngineValidationError,
  NEUTRAL_SEMANTIC_TOKEN_NAMES,
  PRIMARY_SEMANTIC_TOKEN_NAMES,
  RESERVED_CUSTOM_COLOR_ROLE_IDS,
  SEED_POLICY_NAMES,
  SEMANTIC_TOKEN_NAMES,
  SURFACE_PRESET_NAMES,
  SURFACE_SEMANTIC_TOKEN_NAMES,
  STATUS_SEMANTIC_TOKEN_NAMES,
  TEXT_LEVELS,
  TEXT_TREATMENT_STRATEGY_NAMES,
  createCustomColorRoleCssAliasName,
  createCustomColorRoleCssAliasNames,
  createCustomColorRoleCssVariableName,
  createCustomColorRoleCssVariableNames,
  createColorEngineCssArtifacts,
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
    "hc-dark",
    "hc-light",
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
  assert.deepEqual(output.input.customRoles, {});
  assert.deepEqual(output.customRoles, {});
  assert.equal(output.seedPolicies.primary, "balanced");
  assert.equal(output.seedPolicies.status.danger, "balanced");
  assert.equal(output.textTreatment.name, "same-hue");
  assert.equal(output.primitives["surface-light"].length, 4);
  assert.equal(output.primitives["surface-dark"].length, 4);
  assert.equal(output.primitives["chrome-light"].length, 3);
  assert.equal(output.primitives["chrome-dark"].length, 3);
  assert.equal(output.primitives["text-dark"].length, 5);
  assert.equal(output.primitives["text-light"].length, 5);
  assert.equal(output.primitives["hc-light"].length, 66);
  assert.equal(output.primitives["hc-dark"].length, 66);
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
  assert.equal(Object.keys(output.semantics["high-contrast"]).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(Object.keys(output.semantics["high-contrast-dark"]).length, SEMANTIC_TOKEN_NAMES.length);
  assert.equal(output.semantics.light["text-primary"], "var(--ds-text-dark-primary)");
  assert.equal(output.semantics.dark["text-primary"], "var(--ds-text-light-primary)");
  assert.equal(output.semantics.light["border-subtle"], "var(--ds-chrome-light-subtle)");
  assert.equal(output.semantics.light["border-default"], "var(--ds-chrome-light-default)");
  assert.equal(output.semantics.light["border-strong"], "var(--ds-chrome-light-strong)");
  assert.equal(output.semantics.light["control-border"], "var(--ds-chrome-light-default)");
  assert.equal(output.semantics.light["control-bg"], "var(--ds-surface-light-1)");
  assert.equal(output.semantics.light["control-bg-hover"], "var(--ds-surface-light-1-hover)");
  assert.equal(output.semantics.dark["control-bg"], "var(--ds-surface-dark-2)");
  assert.equal(output.semantics.dark["control-bg-hover"], "var(--ds-surface-dark-2-hover)");
  assert.equal(output.semantics.light["surface-1"], "var(--ds-surface-light-1)");
  assert.equal(output.semantics.dark["surface-1"], "var(--ds-surface-dark-1)");
  assert.equal(output.semantics.light["primary-action-bg"], "var(--ds-primary-light-solid-2)");
  assert.equal(output.semantics.dark["primary-action-bg"], "var(--ds-primary-dark-solid-2)");
  assert.equal(output.semantics.light["primary-soft-text"], "var(--ds-primary-light-solid-4)");
  assert.equal(output.semantics.dark["primary-soft-text"], "var(--ds-primary-dark-solid-1)");
  assert.equal(output.semantics.light["danger-soft-bg"], "var(--ds-danger-light-soft-1)");
  assert.equal(output.semantics.light["danger-soft-text"], "var(--ds-danger-light-solid-4)");
  assert.equal(output.semantics.dark["warning-solid-bg"], "var(--ds-warning-dark-solid-2)");
  assert.equal(output.semantics["high-contrast"]["text-primary"], "var(--ds-hc-light-text-primary)");
  assert.equal(output.semantics["high-contrast-dark"]["text-primary"], "var(--ds-hc-dark-text-primary)");
  assert.equal(output.semantics["high-contrast"]["primary-action-bg"], "var(--ds-hc-light-primary-action-bg)");
  assert.equal(output.semantics["high-contrast-dark"]["warning-solid-text"], "var(--ds-hc-dark-warning-solid-text)");
  assert.match(output.cssOutput.primitives, /^:root \{/);
  assert.match(output.cssOutput.themes.light, /^\[data-theme-v2="light"\] \{/);
  assert.match(output.cssOutput.themes.dark, /^\[data-theme-v2="dark"\] \{/);
  assert.match(output.cssOutput.themes["high-contrast"], /^\[data-theme-v2="high-contrast"\] \{/);
  assert.match(output.cssOutput.themes["high-contrast-dark"], /^\[data-theme-v2="high-contrast-dark"\] \{/);
  assert.deepEqual(
    output.cssOutput.files.map((file) => file.fileName),
    [...COLOR_ENGINE_CSS_LOAD_ORDER],
  );
  assert.deepEqual(
    output.cssOutput.files.map((file) => file.kind),
    ["primitives", "theme", "theme", "theme", "theme"],
  );
  assert.deepEqual(
    output.cssOutput.files.map((file) => file.theme ?? null),
    [null, "light", "dark", "high-contrast", "high-contrast-dark"],
  );
  assert.equal(output.cssOutput.files[0].css, output.cssOutput.primitives);
  assert.equal(output.cssOutput.files[1].css, output.cssOutput.themes.light);
  assert.equal(output.cssOutput.files[2].css, output.cssOutput.themes.dark);
  assert.equal(output.cssOutput.files[3].css, output.cssOutput.themes["high-contrast"]);
  assert.equal(output.cssOutput.files[4].css, output.cssOutput.themes["high-contrast-dark"]);
  assert.equal(output.cssOutput.all, output.cssOutput.files.map((file) => file.css).join("\n\n"));
  assert.equal(output.css, output.cssOutput.all);
  assert.match(output.css, /\[data-theme-v2="light"\]/);
  assert.match(output.css, /\[data-theme-v2="high-contrast"\]/);
  assert.match(output.css, /\[data-theme-v2="high-contrast-dark"\]/);
  assert.match(output.css, /--ds-chrome-light-default: oklch\(/);
  assert.match(output.css, /--ds-hc-light-surface-1: oklch\(/);
  assert.match(output.css, /--ds-hc-dark-primary-action-bg: oklch\(/);
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
  assert.doesNotMatch(output.css, /--ds-role-/);
});

test("CSS artifacts wrap ordered output files with stable metadata", () => {
  const output = createColorEngineTheme({
    namespace: "pf",
    customRoles: {
      promo: {
        seed: "oklch(0.68 0.22 330)",
        darkSeed: "oklch(0.78 0.18 330)",
      },
    },
  });
  const artifacts = createColorEngineCssArtifacts(output);
  const artifactsFromCssOutput = createColorEngineCssArtifacts(output.cssOutput);

  assert.deepEqual(
    artifacts.map((artifact) => artifact.fileName),
    [...COLOR_ENGINE_CSS_LOAD_ORDER],
  );
  assert.deepEqual(artifacts, artifactsFromCssOutput);
  assert.deepEqual(
    artifacts.map((artifact) => artifact.kind),
    ["primitives", "theme", "theme", "theme", "theme"],
  );
  assert.deepEqual(
    artifacts.map((artifact) => artifact.theme ?? null),
    [null, "light", "dark", "high-contrast", "high-contrast-dark"],
  );
  assert.equal(artifacts[0]?.css, output.cssOutput.primitives);
  assert.equal(artifacts[1]?.css, output.cssOutput.themes.light);
  assert.equal(artifacts[2]?.css, output.cssOutput.themes.dark);
  assert.equal(artifacts[3]?.css, output.cssOutput.themes["high-contrast"]);
  assert.equal(artifacts[4]?.css, output.cssOutput.themes["high-contrast-dark"]);

  for (const artifact of artifacts) {
    assert.equal(artifact.byteLength, Buffer.byteLength(artifact.css, "utf8"));
    assert.match(artifact.contentHash, /^fnv1a32-[0-9a-f]{8}$/);
  }

  assert.match(artifacts[0]?.css ?? "", /--pf-role-promo-light-solid-2: oklch\(/);
  assert.match(artifacts[1]?.css ?? "", /\[data-theme-v2="light"\]/);
  assert.match(artifacts[3]?.css ?? "", /\[data-theme-v2="high-contrast"\]/);
  assert.notEqual(
    artifacts[0]?.contentHash,
    createColorEngineCssArtifacts(createColorEngineTheme())[0]?.contentHash,
  );
});

test("custom roles generate primitive families and semantic aliases", () => {
  const output = createColorEngineTheme({
    namespace: "pf",
    customRoles: {
      pending: {
        seed: "#5b47d6",
        darkSeed: "oklch(0.7 0.12 285)",
        seedPolicy: "anchored",
      },
      "billing-alert": {
        seed: "oklch(0.64 0.13 74)",
      },
    },
  });

  assert.deepEqual(CUSTOM_COLOR_ROLE_SEMANTIC_PARTS, [
    "soft-bg",
    "soft-bg-hover",
    "soft-border",
    "soft-text",
    "solid-bg",
    "solid-bg-hover",
    "solid-bg-pressed",
    "solid-text",
  ]);
  assert.deepEqual(Object.keys(output.customRoles), ["billing-alert", "pending"]);
  assert.deepEqual(output.customRoles.pending.seed, parseColorSeed("#5b47d6"));
  assert.deepEqual(output.customRoles.pending.darkSeed, parseColorSeed("oklch(0.7 0.12 285)"));
  assert.equal(output.customRoles.pending.seedPolicy, "anchored");
  assert.deepEqual(output.customRoles["billing-alert"].seed, parseColorSeed("oklch(0.64 0.13 74)"));
  assert.deepEqual(output.customRoles["billing-alert"].darkSeed, parseColorSeed("oklch(0.64 0.13 74)"));
  assert.equal(output.customRoles["billing-alert"].seedPolicy, "balanced");
  assert.equal(output.input.customRoles.pending.seed, "#5b47d6");
  assert.equal(output.input.customRoles.pending.darkSeed, "oklch(0.7 0.12 285)");
  assert.equal(output.input.customRoles["billing-alert"].darkSeed, "oklch(0.64 0.13 74)");
  assert.equal(output.customRoles.pending.cssAliases["soft-bg"], "role-pending-soft-bg");
  assert.equal(output.customRoles.pending.cssAliases["solid-bg-pressed"], "role-pending-solid-bg-pressed");
  assert.equal(output.customRoles.pending.cssVariables["soft-bg"], "--pf-role-pending-soft-bg");
  assert.equal(output.customRoles.pending.cssVariables["solid-text"], "--pf-role-pending-solid-text");
  assert.equal(createCustomColorRoleCssAliasName("promo", "solid-text"), "role-promo-solid-text");
  assert.equal(createCustomColorRoleCssVariableName("ds", "promo", "solid-text"), "--ds-role-promo-solid-text");
  assert.deepEqual(createCustomColorRoleCssAliasNames("promo"), {
    "soft-bg": "role-promo-soft-bg",
    "soft-bg-hover": "role-promo-soft-bg-hover",
    "soft-border": "role-promo-soft-border",
    "soft-text": "role-promo-soft-text",
    "solid-bg": "role-promo-solid-bg",
    "solid-bg-hover": "role-promo-solid-bg-hover",
    "solid-bg-pressed": "role-promo-solid-bg-pressed",
    "solid-text": "role-promo-solid-text",
  });
  assert.deepEqual(createCustomColorRoleCssVariableNames("ds", "promo"), {
    "soft-bg": "--ds-role-promo-soft-bg",
    "soft-bg-hover": "--ds-role-promo-soft-bg-hover",
    "soft-border": "--ds-role-promo-soft-border",
    "soft-text": "--ds-role-promo-soft-text",
    "solid-bg": "--ds-role-promo-solid-bg",
    "solid-bg-hover": "--ds-role-promo-solid-bg-hover",
    "solid-bg-pressed": "--ds-role-promo-solid-bg-pressed",
    "solid-text": "--ds-role-promo-solid-text",
  });
  assert.equal(output.primitives["role-pending-light-soft"].length, 4);
  assert.equal(output.primitives["role-pending-light-solid"].length, 4);
  assert.equal(output.primitives["role-pending-dark-soft"].length, 4);
  assert.equal(output.primitives["role-pending-dark-solid"].length, 4);
  assert.equal(output.primitives["role-billing-alert-light-soft"].length, 4);
  assert.equal(output.primitives["role-pending-light-soft"][0]?.name, "role-pending-light-soft-1");
  assert.equal(output.primitives["role-pending-dark-solid"][1]?.name, "role-pending-dark-solid-2");
  assert.deepEqual(output.primitives["role-pending-light-solid"][1]?.oklch, parseColorSeed("#5b47d6"));
  assert.deepEqual(output.primitives["role-pending-dark-solid"][1]?.oklch, parseColorSeed("oklch(0.7 0.12 285)"));
  assert.equal(
    output.primitives["role-billing-alert-dark-solid"][1]?.oklch.h,
    output.primitives["role-billing-alert-light-solid"][1]?.oklch.h,
  );
  assert.notDeepEqual(output.primitives["role-billing-alert-dark-solid"], output.primitives["role-billing-alert-light-solid"]);
  assert.equal(output.semantics.light["role-pending-soft-bg"], "var(--pf-role-pending-light-soft-1)");
  assert.equal(output.semantics.light["role-pending-soft-bg-hover"], "var(--pf-role-pending-light-soft-2)");
  assert.equal(output.semantics.light["role-pending-soft-border"], "var(--pf-role-pending-light-soft-4)");
  assert.equal(output.semantics.light["role-pending-solid-bg"], "var(--pf-role-pending-light-solid-2)");
  assert.equal(output.semantics.light["role-pending-solid-bg-hover"], "var(--pf-role-pending-light-solid-3)");
  assert.equal(output.semantics.light["role-pending-solid-bg-pressed"], "var(--pf-role-pending-light-solid-4)");
  assert.equal(output.semantics.dark["role-pending-soft-bg"], "var(--pf-role-pending-dark-soft-1)");
  assert.equal(output.semantics.dark["role-pending-solid-bg"], "var(--pf-role-pending-dark-solid-2)");
  assert.equal(Object.keys(output.semantics.light).length, SEMANTIC_TOKEN_NAMES.length + 16);
  assert.equal(Object.keys(output.semantics["high-contrast"]).length, SEMANTIC_TOKEN_NAMES.length + 16);
  assert.match(output.cssOutput.primitives, /--pf-role-pending-light-soft-1: oklch\(/);
  assert.match(output.cssOutput.primitives, /--pf-role-pending-dark-solid-2: oklch\(0.7 0.12 285\);/);
  assert.match(output.cssOutput.themes.light, /--pf-role-pending-soft-bg: var\(--pf-role-pending-light-soft-1\);/);
  assert.match(output.cssOutput.themes.dark, /--pf-role-pending-soft-bg: var\(--pf-role-pending-dark-soft-1\);/);
  assert.match(output.cssOutput.themes["high-contrast"], /--pf-role-pending-soft-bg: var\(--pf-hc-light-role-soft-bg\);/);
  assert.match(output.cssOutput.themes["high-contrast-dark"], /--pf-role-pending-solid-text: var\(--pf-hc-dark-role-solid-text\);/);
  assert.match(output.cssOutput.themes.light, /--pf-role-billing-alert-solid-bg: var\(--pf-role-billing-alert-light-solid-2\);/);
  assert.doesNotMatch(output.cssOutput.themes.light, /--pf-primary-action-bg: var\(--pf-role-/);
  assert.equal(output.primitives["primary-light-solid"].length, 4);
  assert.equal(output.semantics.light["primary-action-bg"], "var(--pf-primary-light-solid-2)");
});

test("omitted, empty, and populated custom roles preserve built-in output", () => {
  const omitted = createColorEngineTheme();
  const empty = createColorEngineTheme({ customRoles: {} });
  const populated = createColorEngineTheme({
    customRoles: {
      pending: {
        seed: "oklch(0.62 0.12 280)",
        darkSeed: "oklch(0.72 0.1 280)",
      },
    },
  });

  assert.deepEqual(empty.input.customRoles, {});
  assert.deepEqual(empty.customRoles, {});
  assert.deepEqual(empty.primitives, omitted.primitives);
  assert.deepEqual(empty.semantics, omitted.semantics);
  assert.deepEqual(empty.assertions, omitted.assertions);
  assert.deepEqual(empty.cssOutput, omitted.cssOutput);
  assert.equal(empty.css, omitted.css);
  assert.deepEqual(populated.primitives["primary-light-solid"], omitted.primitives["primary-light-solid"]);
  assert.deepEqual(populated.primitives["danger-dark-soft"], omitted.primitives["danger-dark-soft"]);
  assert.deepEqual(populated.semantics.light["primary-action-bg"], omitted.semantics.light["primary-action-bg"]);
  assert.deepEqual(populated.semantics.dark["warning-solid-bg"], omitted.semantics.dark["warning-solid-bg"]);
  assert.deepEqual(
    SEMANTIC_TOKEN_NAMES.map((name) => [name, populated.semantics.light[name]]),
    SEMANTIC_TOKEN_NAMES.map((name) => [name, omitted.semantics.light[name]]),
  );
});

test("high contrast output stays fixed across tenant seeds and surface presets", () => {
  const baseline = createColorEngineTheme({
    namespace: "ds",
    customRoles: {
      promo: {
        seed: "oklch(0.6 0.12 20)",
        darkSeed: "oklch(0.7 0.1 20)",
      },
    },
  });
  const varied = createColorEngineTheme({
    namespace: "ds",
    neutralSeed: "oklch(0.8 0.05 35)",
    surfaceLightSeed: "oklch(0.98 0.04 120)",
    surfaceDarkSeed: "oklch(0.08 0.05 300)",
    primarySeed: "#f8d7ff",
    primaryDarkSeed: "#00f5ff",
    primarySeedPolicy: "anchored",
    dangerSeed: "#ff003d",
    dangerDarkSeed: "#ff99aa",
    warningSeed: "#fff000",
    warningDarkSeed: "#ffe26a",
    successSeed: "#00a854",
    successDarkSeed: "#b6ffbe",
    infoSeed: "#0047ff",
    infoDarkSeed: "#90d7ff",
    lightSurfacePreset: "quiet",
    darkSurfacePreset: "high-separation",
    preset: "layered",
    textTreatment: "adaptive",
    customRoles: {
      promo: {
        seed: "oklch(0.7 0.22 330)",
        darkSeed: "oklch(0.84 0.2 330)",
        seedPolicy: "anchored",
      },
    },
  });

  assert.deepEqual(
    extractHighContrastPrimitiveDeclarations(varied.cssOutput.primitives),
    extractHighContrastPrimitiveDeclarations(baseline.cssOutput.primitives),
  );
  assert.equal(varied.cssOutput.themes["high-contrast"], baseline.cssOutput.themes["high-contrast"]);
  assert.equal(varied.cssOutput.themes["high-contrast-dark"], baseline.cssOutput.themes["high-contrast-dark"]);
});

test("custom role state CSS detects theme from the family suffix", () => {
  const output = createColorEngineTheme({
    namespace: "pf",
    customRoles: {
      "traffic-light": {
        seed: "oklch(0.5 0.12 145)",
        darkSeed: "oklch(0.7 0.1 145)",
        seedPolicy: "anchored",
      },
    },
  });
  const lightBase = extractCssLightness(output.cssOutput.primitives, "--pf-role-traffic-light-light-solid-2");
  const lightHover = extractCssLightness(output.cssOutput.primitives, "--pf-role-traffic-light-light-solid-2-hover");
  const darkBase = extractCssLightness(output.cssOutput.primitives, "--pf-role-traffic-light-dark-solid-2");
  const darkHover = extractCssLightness(output.cssOutput.primitives, "--pf-role-traffic-light-dark-solid-2-hover");

  assert.ok(lightHover < lightBase);
  assert.ok(darkHover > darkBase);
});

function extractHighContrastPrimitiveDeclarations(css) {
  return css
    .split("\n")
    .filter((line) => line.trimStart().startsWith("--ds-hc-"))
    .sort();
}

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

test("example theme presets vary built-in status seed palettes", () => {
  const statuses = ["danger", "warning", "success", "info"];

  for (const status of statuses) {
    const lightHueBuckets = new Set(
      COLOR_ENGINE_THEME_PRESET_NAMES.map((name) =>
        hueBucket(COLOR_ENGINE_THEME_PRESETS[name].input[`${status}Seed`]),
      ),
    );
    const darkHueBuckets = new Set(
      COLOR_ENGINE_THEME_PRESET_NAMES.map((name) =>
        hueBucket(COLOR_ENGINE_THEME_PRESETS[name].input[`${status}DarkSeed`]),
      ),
    );

    assert.ok(
      lightHueBuckets.size >= 3,
      `${status} light seeds should vary across curated presets`,
    );
    assert.ok(
      darkHueBuckets.size >= 3,
      `${status} dark seeds should vary across curated presets`,
    );
  }

  assert.ok(
    hueDistance(
      COLOR_ENGINE_THEME_PRESETS.evergreen.input.warningSeed,
      COLOR_ENGINE_THEME_PRESETS["civic-blue"].input.warningSeed,
    ) >= 15,
    "civic-blue warning should read more orange than evergreen warning",
  );
  assert.ok(
    hueDistance(
      COLOR_ENGINE_THEME_PRESETS.plum.input.dangerSeed,
      COLOR_ENGINE_THEME_PRESETS.evergreen.input.dangerSeed,
    ) >= 30,
    "plum danger should read berry-toned rather than default red",
  );
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
  assert.throws(
    () => createColorEngineTheme({ customRoles: { pending: { seed: "rebeccapurple" } } }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED" &&
      error.field === "customRoles.pending.seed",
  );
  assert.throws(
    () => createColorEngineTheme({
      customRoles: {
        pending: {
          seed: "oklch(0.6 0.1 270)",
          darkSeed: "blue",
        },
      },
    }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED" &&
      error.field === "customRoles.pending.darkSeed",
  );
  assert.throws(
    () => createColorEngineTheme({ customRoles: { pending: {} } }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED" &&
      error.field === "customRoles.pending.seed",
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
  assert.throws(
    () => createColorEngineTheme({
      customRoles: { pending: { seed: "#5b47d6", seedPolicy: "strict" } },
    }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_SEED_POLICY" &&
      error.field === "customRoles.pending.seedPolicy",
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

test("createColorEngineTheme rejects invalid or reserved custom role ids", () => {
  for (const roleId of [
    "",
    "Pending",
    "pending_role",
    "pending--role",
    "pending-",
    "-pending",
    "pending.role",
    "pénding",
    "1pending",
  ]) {
    assert.throws(
      () => createColorEngineTheme({
        customRoles: { [roleId]: { seed: "#5b47d6" } },
      }),
      (error) =>
        error instanceof ColorEngineValidationError &&
        error.code === "INVALID_CUSTOM_ROLE_ID" &&
        error.field === `customRoles.${roleId}`,
      roleId,
    );
  }

  assert.deepEqual(RESERVED_CUSTOM_COLOR_ROLE_IDS, [
    "primary",
    "danger",
    "warning",
    "success",
    "info",
    "surface",
    "text",
    "chrome",
    "border",
  ]);

  for (const roleId of RESERVED_CUSTOM_COLOR_ROLE_IDS) {
    assert.throws(
      () => createColorEngineTheme({
        customRoles: { [roleId]: { seed: "#5b47d6" } },
      }),
      (error) =>
        error instanceof ColorEngineValidationError &&
        error.code === "RESERVED_CUSTOM_ROLE_ID" &&
        error.field === `customRoles.${roleId}`,
      roleId,
    );
  }
});

test("createColorEngineTheme rejects malformed custom role objects", () => {
  assert.throws(
    () => createColorEngineTheme({ customRoles: [] }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_CUSTOM_ROLE" &&
      error.field === "customRoles",
  );
  assert.throws(
    () => createColorEngineTheme({ customRoles: { pending: "#5b47d6" } }),
    (error) =>
      error instanceof ColorEngineValidationError &&
      error.code === "INVALID_CUSTOM_ROLE" &&
      error.field === "customRoles.pending",
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

function hueBucket(seed) {
  return Math.round((parseColorSeed(seed).h ?? 0) / 5) * 5;
}

function hueDistance(a, b) {
  const difference = Math.abs(hueBucket(a) - hueBucket(b));

  return Math.min(difference, 360 - difference);
}
