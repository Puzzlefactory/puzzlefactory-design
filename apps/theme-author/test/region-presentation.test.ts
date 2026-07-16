import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  COLOR_ENGINE_THEME_PRESETS,
} from "@puzzlefactory/color-engine";
import {
  THEME_SCHEMA_VERSION,
  createThemeComposition,
  resolveThemeRegionLabelForeground,
} from "@puzzlefactory/themes";

const appSource = await readFile(new URL("../src/app.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

test("region labels use an explicit role-aware text semantic", () => {
  assert.match(appSource, /resolveThemeRegionLabelForeground\(output, region, theme\)/);
  assert.match(appSource, /"--region-label-text": cssVar\(region\.namespace, labelForeground\.name\)/);
  assert.match(styles, /\.region-example span \{[\s\S]*?color: var\(--region-label-text\);/);
});

test("generic preview text styling cannot override region label text", () => {
  const genericRule = styles.indexOf(".generated-preview span {");
  const scopedRule = styles.indexOf(".generated-preview .region-example span {");

  assert.notEqual(genericRule, -1);
  assert.ok(scopedRule > genericRule);
  assert.match(
    styles.slice(scopedRule),
    /^\.generated-preview \.region-example span \{\n {2}color: var\(--region-label-text\);\n\}/,
  );
});

test("APCA diagnostics cover region labels on rest and hover backgrounds", () => {
  const composition = createThemeComposition({
    schemaVersion: THEME_SCHEMA_VERSION,
    id: "tenant-default",
    name: "Tenant Default",
    color: {
      ...COLOR_ENGINE_THEME_PRESETS.evergreen.input,
      customRoles: {
        institution: {
          seed: "oklch(0.42 0.13 255)",
          darkSeed: "oklch(0.66 0.1 255)",
          seedPolicy: "balanced",
        },
      },
    },
    regions: {
      header: { roleId: "institution", treatment: "solid" },
      sidebar: { roleId: "institution", treatment: "soft" },
      footer: { roleId: "institution", treatment: "solid" },
    },
  });
  const results = composition.regionDiagnostics.filter((result) => result.region.id === "header");
  const labelResults = results.filter((result) => result.label.includes("label text"));

  assert.equal(results.length, 24);
  assert.equal(labelResults.length, 8);
  assert.equal(
    labelResults.filter((result) => result.label === "region label text on region background").length,
    4,
  );
  assert.equal(
    labelResults.filter((result) => result.label === "region label text on hover background").length,
    4,
  );
  assert.equal(new Set(results.map((result) => result.id)).size, results.length);
  assert.ok(labelResults.every((result) => result.passed));
  assert.ok(labelResults.every((result) => {
    const primaryResult = results.find((candidate) =>
      candidate.theme === result.theme
      && candidate.backgroundToken.name === result.backgroundToken.name
      && candidate.label.startsWith("region text")
    );

    return primaryResult && primaryResult.foregroundToken.name !== result.foregroundToken.name;
  }));
});

test("high-contrast region labels use fixed seed-independent foregrounds", () => {
  const createComposition = (neutralSeed: string) => createThemeComposition({
    schemaVersion: THEME_SCHEMA_VERSION,
    id: "tenant-default",
    name: "Tenant Default",
    color: {
      ...COLOR_ENGINE_THEME_PRESETS.evergreen.input,
      neutralSeed,
      customRoles: {
        institution: {
          seed: "oklch(0.42 0.13 255)",
          darkSeed: "oklch(0.66 0.1 255)",
          seedPolicy: "balanced",
        },
      },
    },
    regions: {
      header: { roleId: "institution", treatment: "solid" },
      sidebar: { roleId: "institution", treatment: "soft" },
      footer: { roleId: "institution", treatment: "solid" },
    },
  });
  const firstComposition = createComposition("oklch(0.5 0.08 25)");
  const secondComposition = createComposition("oklch(0.5 0.08 210)");
  const region = firstComposition.regions.find((candidate) => candidate.id === "header");

  assert.ok(region);

  for (const theme of ["high-contrast", "high-contrast-dark"] as const) {
    const first = resolveThemeRegionLabelForeground(firstComposition.colorOutput, region, theme);
    const second = resolveThemeRegionLabelForeground(secondComposition.colorOutput, region, theme);

    assert.equal(first.token.name, second.token.name);
    assert.deepEqual(first.token.oklch, second.token.oklch);
    assert.match(first.token.name, /^hc-(?:light|dark)-text-/);
    assert.equal(first.passed, true);
  }
});
