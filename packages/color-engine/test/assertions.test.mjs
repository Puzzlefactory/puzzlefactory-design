import assert from "node:assert/strict";
import test from "node:test";
import {
  APCA_ALGORITHM_VERSION,
  COLOR_ENGINE_THEME_PRESETS,
  CONTRAST_ASSERTION_THRESHOLDS,
  createColorEngineTheme,
} from "../dist/index.js";

test("createColorEngineTheme returns APCA diagnostic assertions", () => {
  const output = createColorEngineTheme();
  const report = output.assertions;

  assert.equal(report.apcaAlgorithmVersion, APCA_ALGORITHM_VERSION);
  assert.equal(report.pairs.length, 296);
  assert.equal(report.results.length, report.pairs.length);
  assert.deepEqual(report.thresholds, CONTRAST_ASSERTION_THRESHOLDS);
  assert.deepEqual(report.summary, {
    total: report.results.length,
    passed: report.results.filter((result) => result.passed).length,
    failed: report.results.filter((result) => !result.passed).length,
    requiredFailed: report.results.filter((result) => !result.passed && result.severity === "required").length,
    diagnosticFailed: report.results.filter((result) => !result.passed && result.severity === "diagnostic").length,
  });
});

test("assertion report uses role-based thresholds and severities", () => {
  const results = createColorEngineTheme().assertions.results;

  assert.equal(CONTRAST_ASSERTION_THRESHOLDS.body, 60);
  assert.equal(CONTRAST_ASSERTION_THRESHOLDS.secondary, 45);
  assert.equal(CONTRAST_ASSERTION_THRESHOLDS.muted, 30);
  assert.equal(CONTRAST_ASSERTION_THRESHOLDS.ui, 45);
  assert.equal(CONTRAST_ASSERTION_THRESHOLDS["status-soft"], 45);
  assert.equal(CONTRAST_ASSERTION_THRESHOLDS["status-solid"], 60);
  assert.equal(results.filter((result) => result.role === "body").length, 64);
  assert.equal(results.filter((result) => result.role === "secondary").length, 64);
  assert.equal(results.filter((result) => result.role === "muted").length, 64);
  assert.equal(results.filter((result) => result.role === "ui").length, 24);
  assert.equal(results.filter((result) => result.role === "status-soft").length, 32);
  assert.equal(results.filter((result) => result.role === "status-solid").length, 48);
  assert.equal(results.every((result) => result.role !== "muted" || result.severity === "diagnostic"), true);
  assert.equal(results.every((result) => result.role === "muted" || result.severity === "required"), true);
});

test("assertion report covers expected semantic text/background pairs", () => {
  const results = createColorEngineTheme().assertions.results;
  const ids = new Set(results.map((result) => result.id));

  assert.equal(ids.has("light:text-primary:on:surface-1"), true);
  assert.equal(ids.has("dark:text-primary:on:surface-4"), true);
  assert.equal(ids.has("light:text-primary:on:surface-1-hover"), true);
  assert.equal(ids.has("dark:text-primary:on:surface-2-selected"), true);
  assert.equal(ids.has("light:text-secondary:on:surface-3-pressed"), true);
  assert.equal(ids.has("high-contrast-dark:text-muted:on:surface-4-pressed"), true);
  assert.equal(ids.has("light:text-secondary:on:surface-2"), true);
  assert.equal(ids.has("dark:text-muted:on:surface-3"), true);
  assert.equal(ids.has("light:primary-action-text:on:primary-action-bg"), true);
  assert.equal(ids.has("light:primary-soft-text:on:primary-soft-bg"), true);
  assert.equal(ids.has("dark:primary-soft-text:on:primary-soft-bg-hover"), true);
  assert.equal(ids.has("dark:primary-action-text:on:primary-action-bg-pressed"), true);
  assert.equal(ids.has("light:control-text:on:control-bg"), true);
  assert.equal(ids.has("dark:control-text:on:control-bg"), true);
  assert.equal(ids.has("light:danger-soft-text:on:danger-soft-bg"), true);
  assert.equal(ids.has("dark:warning-soft-text:on:warning-soft-bg-hover"), true);
  assert.equal(ids.has("dark:warning-solid-text:on:warning-solid-bg-pressed"), true);
  assert.equal(ids.has("high-contrast:text-primary:on:surface-1"), true);
  assert.equal(ids.has("high-contrast-dark:primary-action-text:on:primary-action-bg"), true);
  assert.equal(ids.has("high-contrast-dark:warning-solid-text:on:warning-solid-bg-pressed"), true);
  assert.equal([...ids].some((id) => id.includes("border")), false);
});

test("assertion report resolves semantic variables to generated primitive tokens", () => {
  const output = createColorEngineTheme({ namespace: "pf" });
  const bodyResult = findResult(output, "light:text-primary:on:surface-1");
  const actionResult = findResult(output, "dark:primary-action-text:on:primary-action-bg");
  const statusResult = findResult(output, "light:danger-solid-text:on:danger-solid-bg");
  const highContrastResult = findResult(output, "high-contrast:text-primary:on:surface-1");
  const pressedSurfaceResult = findResult(output, "light:text-primary:on:surface-1-pressed");

  assert.equal(bodyResult.foregroundToken.name, "text-dark-primary");
  assert.equal(bodyResult.backgroundToken.name, "surface-light-1");
  assert.equal(bodyResult.threshold, 60);
  assert.equal(bodyResult.absLc, Math.abs(bodyResult.lc));
  assert.equal(bodyResult.passed, bodyResult.absLc >= bodyResult.threshold);
  assert.equal(actionResult.foregroundToken.name, "text-dark-strong");
  assert.equal(actionResult.backgroundToken.name, "primary-dark-solid-2");
  assert.equal(statusResult.foregroundToken.name, "text-light-strong");
  assert.equal(statusResult.backgroundToken.name, "danger-light-solid-2");
  assert.equal(highContrastResult.foregroundToken.name, "hc-light-text-primary");
  assert.equal(highContrastResult.backgroundToken.name, "hc-light-surface-1");
  assert.equal(pressedSurfaceResult.backgroundToken.name, "surface-light-1-pressed");
  assert.match(pressedSurfaceResult.backgroundToken.value, /^oklch\(/);
});

test("custom roles add soft and solid diagnostic pairs only when configured", () => {
  const omitted = createColorEngineTheme();
  const output = createColorEngineTheme({
    customRoles: {
      pending: {
        seed: "oklch(0.62 0.12 280)",
        darkSeed: "oklch(0.7 0.1 280)",
      },
      "traffic-light": {
        seed: "oklch(0.54 0.13 145)",
        darkSeed: "oklch(0.7 0.1 145)",
      },
    },
  });
  const roleResults = output.assertions.results.filter((result) =>
    result.foreground.startsWith("role-"),
  );
  const ids = new Set(roleResults.map((result) => result.id));

  assert.equal(omitted.assertions.summary.total, 296);
  assert.equal(omitted.assertions.results.some((result) => result.foreground.startsWith("role-")), false);
  assert.equal(output.assertions.summary.total, 336);
  assert.equal(roleResults.length, 40);
  assert.equal(roleResults.every((result) => result.severity === "required"), true);
  assert.equal(roleResults.filter((result) => result.role === "status-soft").length, 16);
  assert.equal(roleResults.filter((result) => result.role === "status-solid").length, 24);
  assert.equal(ids.has("light:role-pending-soft-text:on:role-pending-soft-bg"), true);
  assert.equal(ids.has("light:role-pending-soft-text:on:role-pending-soft-bg-hover"), true);
  assert.equal(ids.has("light:role-pending-solid-text:on:role-pending-solid-bg"), true);
  assert.equal(ids.has("light:role-pending-solid-text:on:role-pending-solid-bg-hover"), true);
  assert.equal(ids.has("light:role-pending-solid-text:on:role-pending-solid-bg-pressed"), true);
  assert.equal(ids.has("dark:role-pending-soft-text:on:role-pending-soft-bg"), true);
  assert.equal(ids.has("dark:role-pending-solid-text:on:role-pending-solid-bg-pressed"), true);
  assert.equal(ids.has("dark:role-traffic-light-solid-text:on:role-traffic-light-solid-bg"), true);
  assert.equal(ids.has("high-contrast:role-pending-soft-text:on:role-pending-soft-bg"), true);
  assert.equal(ids.has("high-contrast-dark:role-traffic-light-solid-text:on:role-traffic-light-solid-bg-pressed"), true);
});

test("custom role assertions resolve semantic aliases to generated role primitives", () => {
  const output = createColorEngineTheme({
    namespace: "pf",
    customRoles: {
      pending: {
        seed: "oklch(0.62 0.12 280)",
        darkSeed: "oklch(0.7 0.1 280)",
      },
    },
  });
  const softResult = findResult(output, "light:role-pending-soft-text:on:role-pending-soft-bg");
  const solidResult = findResult(output, "dark:role-pending-solid-text:on:role-pending-solid-bg-pressed");
  const highContrastResult = findResult(output, "high-contrast:role-pending-solid-text:on:role-pending-solid-bg");

  assert.equal(softResult.backgroundToken.name, "role-pending-light-soft-1");
  assert.equal(softResult.threshold, CONTRAST_ASSERTION_THRESHOLDS["status-soft"]);
  assert.equal(softResult.absLc, Math.abs(softResult.lc));
  assert.equal(softResult.passed, softResult.absLc >= softResult.threshold);
  assert.equal(solidResult.backgroundToken.name, "role-pending-dark-solid-3");
  assert.equal(solidResult.threshold, CONTRAST_ASSERTION_THRESHOLDS["status-solid"]);
  assert.match(solidResult.foregroundToken.name, /^text-(dark|light)-/);
  assert.equal(highContrastResult.backgroundToken.name, "hc-light-role-solid-bg");
  assert.equal(highContrastResult.foregroundToken.name, "hc-light-role-solid-text");
});

test("custom role assertion matrix covers balanced, anchored, dark fallback, and dark override", () => {
  const matrix = [
    {
      name: "balanced violet role with explicit dark seed",
      input: {
        customRoles: {
          pending: {
            seed: "oklch(0.62 0.12 280)",
            darkSeed: "oklch(0.7 0.1 280)",
          },
        },
      },
    },
    {
      name: "balanced billing role falls back from dark seed",
      input: {
        customRoles: {
          billing: {
            seed: "oklch(0.64 0.13 74)",
          },
        },
      },
    },
    {
      name: "anchored green role preserves seed and reports explicit diagnostics",
      input: {
        customRoles: {
          "traffic-light": {
            seed: "oklch(0.54 0.13 145)",
            darkSeed: "oklch(0.7 0.1 145)",
            seedPolicy: "anchored",
          },
        },
      },
    },
  ];

  for (const { input, name } of matrix) {
    const output = createColorEngineTheme(input);
    const roleResults = output.assertions.results.filter((result) =>
      result.foreground.startsWith("role-"),
    );

    assert.equal(output.assertions.summary.total, 316, name);
    assert.equal(roleResults.length, 20, name);
    assert.equal(roleResults.every((result) => result.description.includes("custom role")), true, name);
    assert.equal(roleResults.every((result) => result.role === "status-soft" || result.role === "status-solid"), true, name);
  }
});

test("default balanced dark solid required assertions pass", () => {
  const output = createColorEngineTheme();
  const darkSolidRequiredResults = darkSolidRequiredAssertions(output);

  assert.equal(darkSolidRequiredResults.length, 15);
  assert.deepEqual(
    darkSolidRequiredResults.filter((result) => !result.passed),
    [],
  );
});

test("kitchen-sink defaults preserve passing dark solid assertions", () => {
  const output = createColorEngineTheme({
    ...COLOR_ENGINE_THEME_PRESETS.evergreen.input,
    namespace: "ds",
  });
  const darkSolidRequiredResults = darkSolidRequiredAssertions(output);

  assert.equal(darkSolidRequiredResults.length, 15);
  assert.deepEqual(
    darkSolidRequiredResults.filter((result) => !result.passed),
    [],
  );
});

test("representative balanced preset and seed matrix keeps required assertions passing", () => {
  const matrix = [
    {
      name: "default standard green and gold",
      input: {},
    },
    {
      name: "quiet green and gold",
      input: {
        preset: "quiet",
        primarySeed: "#0f6f3d",
        warningSeed: "#e3bb1d",
      },
    },
    {
      name: "layered blue primary and dark blue info",
      input: {
        preset: "layered",
        primarySeed: "#1857a4",
        infoSeed: "#064276",
      },
    },
    {
      name: "high separation purple primary and saturated status",
      input: {
        preset: "high-separation",
        primarySeed: "#6d3fd1",
        dangerSeed: "#d12d2d",
        warningSeed: "#e3bb1d",
        successSeed: "#128a47",
        infoSeed: "#1666b8",
      },
    },
    {
      name: "legacy brown warning remains valid",
      input: {
        warningSeed: "#b26a00",
      },
    },
  ];

  for (const { input, name } of matrix) {
    const output = createColorEngineTheme(input);

    assert.equal(output.assertions.summary.total, 296, name);
    assert.deepEqual(requiredFailures(output), [], name);
  }
});

test("representative anchored matrix keeps seed-preservation failures explicit", () => {
  const matrix = [
    {
      name: "light primary cannot act as anchored solid action background",
      input: {
        primarySeed: "#f8d7ff",
        primarySeedPolicy: "anchored",
      },
      expectedFailures: [
        "light:primary-soft-text:on:primary-soft-bg",
        "light:primary-soft-text:on:primary-soft-bg-hover",
      ],
    },
    {
      name: "dark blue anchored info exposes soft container tradeoff",
      input: {
        infoSeed: "#064276",
        infoSeedPolicy: "anchored",
      },
      expectedFailures: [
        "dark:info-soft-text:on:info-soft-bg",
        "dark:info-soft-text:on:info-soft-bg-hover",
      ],
    },
    {
      name: "anchored gold warning exposes soft and pressed tradeoffs",
      input: {
        warningSeed: "#e3bb1d",
        warningSeedPolicy: "anchored",
      },
      expectedFailures: [
        "light:warning-soft-text:on:warning-soft-bg",
        "light:warning-soft-text:on:warning-soft-bg-hover",
        "light:warning-solid-text:on:warning-solid-bg-pressed",
      ],
    },
  ];

  for (const { expectedFailures, input, name } of matrix) {
    const output = createColorEngineTheme(input);

    assert.deepEqual(
      requiredFailures(output).map((result) => result.id),
      expectedFailures,
      name,
    );
  }
});

function findResult(output, id) {
  const result = output.assertions.results.find((candidate) => candidate.id === id);

  assert.ok(result, `Expected assertion result ${id}.`);

  return result;
}

function darkSolidRequiredAssertions(output) {
  return output.assertions.results.filter((result) =>
    result.theme === "dark" &&
    result.severity === "required" &&
    (
      result.id.startsWith("dark:primary-action-text:on:primary-action-bg") ||
      result.role === "status-solid"
    )
  );
}

function requiredFailures(output) {
  return output.assertions.results.filter((result) =>
    result.severity === "required" &&
    !result.passed
  );
}
