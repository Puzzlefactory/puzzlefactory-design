import assert from "node:assert/strict";
import test from "node:test";
import {
  THEME_ATTRIBUTE,
  THEME_MANIFEST_SCHEMA_VERSION,
  ThemeArtifactValidationError,
  createThemeArtifactBundle,
  createThemeComposition,
  createThemeManifest,
  resolveThemeRegionLabelForeground,
} from "../dist/index.js";

const source = {
  schemaVersion: 1,
  id: "tenant-default",
  name: "Tenant Default",
  color: {
    namespace: "ds",
    customRoles: {
      institution: {
        seed: "oklch(0.42 0.13 255)",
        darkSeed: "oklch(0.66 0.1 255)",
      },
      navigation: {
        seed: "oklch(0.5 0.09 178)",
        darkSeed: "oklch(0.7 0.08 178)",
      },
      footer: {
        seed: "oklch(0.28 0.05 250)",
        darkSeed: "oklch(0.62 0.06 250)",
      },
    },
  },
  regions: {
    header: { roleId: "institution", treatment: "solid" },
    sidebar: { roleId: "navigation", treatment: "soft" },
    footer: { roleId: "footer", treatment: "solid" },
  },
};

const release = {
  version: "1.0.0",
  createdAt: "2026-07-16T12:00:00.000Z",
  createdBy: "system:test",
};

test("composes normalized source, color output, and complete region semantics", () => {
  const composition = createThemeComposition(source);

  assert.equal(composition.source.id, "tenant-default");
  assert.equal(composition.colorOutput.input, composition.source.color);
  assert.deepEqual(
    composition.regions.map((region) => region.id),
    ["header", "sidebar", "footer"],
  );
  assert.deepEqual(composition.regions[0].semantics, {
    bg: "role-institution-solid-bg",
    "bg-hover": "role-institution-solid-bg-hover",
    border: "role-institution-solid-bg-pressed",
    text: "role-institution-solid-text",
    "action-bg": "role-institution-soft-bg",
    "action-bg-hover": "role-institution-soft-bg-hover",
    "action-text": "role-institution-soft-text",
  });
  assert.equal(composition.regions[1].semantics.bg, "role-navigation-soft-bg");
  assert.equal(composition.regions[1].semantics["action-bg"], "role-navigation-solid-bg");
});

test("covers every region and supported theme with APCA diagnostics", () => {
  const composition = createThemeComposition(source);
  const diagnostics = composition.regionDiagnostics;

  assert.equal(diagnostics.length, 72);
  assert.deepEqual(
    [...new Set(diagnostics.map((result) => result.theme))],
    ["light", "dark", "high-contrast", "high-contrast-dark"],
  );
  assert.deepEqual(
    [...new Set(diagnostics.map((result) => result.region.id))],
    ["header", "sidebar", "footer"],
  );
  assert.equal(diagnostics.filter((result) => result.kind === "label").length, 24);
  assert.equal(diagnostics.filter((result) => result.kind === "action").length, 24);
  assert.ok(diagnostics.every((result) => result.foregroundToken.name === result.foregroundName));
  assert.ok(diagnostics.every((result) => result.backgroundToken.name === result.backgroundName));
});

test("resolves subordinate labels from quietest passing candidates across rest and hover", () => {
  const composition = createThemeComposition(source);

  for (const region of composition.regions) {
    for (const theme of ["light", "dark", "high-contrast", "high-contrast-dark"]) {
      const resolution = resolveThemeRegionLabelForeground(
        composition.colorOutput,
        region,
        theme,
      );

      assert.equal(resolution.passed, true);
      assert.ok(resolution.minimumLc >= 60);
    }
  }
});

test("creates deterministic manifest metadata from caller-supplied release data", () => {
  const composition = createThemeComposition(source);
  const manifest = createThemeManifest(composition, release);
  const repeated = createThemeManifest(composition, release);

  assert.deepEqual(manifest, repeated);
  assert.equal(manifest.schemaVersion, THEME_MANIFEST_SCHEMA_VERSION);
  assert.equal(manifest.generator.package, "@puzzlefactory/themes");
  assert.equal(manifest.generator.themeSchemaVersion, 1);
  assert.deepEqual(manifest.generator.colorEngine, {
    package: "@puzzlefactory/color-engine",
    contractVersion: 2,
  });
  assert.deepEqual(manifest.release, release);
  assert.equal(manifest.theme, composition.source);
  assert.equal(manifest.themeAttribute, THEME_ATTRIBUTE);
  assert.deepEqual(manifest.themes, [
    "light",
    "dark",
    "high-contrast",
    "high-contrast-dark",
  ]);
  assert.deepEqual(manifest.loadOrder, [
    "primitives.css",
    "theme-light.css",
    "theme-dark.css",
    "theme-high-contrast.css",
    "theme-high-contrast-dark.css",
  ]);
  assert.equal(manifest.files.length, 6);
  assert.ok(manifest.files.every((file) => file.content === undefined));
  assert.equal(manifest.diagnostics.regions.total, 72);
  assert.equal(
    manifest.diagnostics.regions.passed + manifest.diagnostics.regions.failed,
    72,
  );
  assert.equal(manifest.diagnostics.color, composition.colorOutput.assertions.summary);
});

test("creates ordered CSS, bundle, and manifest artifacts with stable hashes", () => {
  const composition = createThemeComposition(source);
  const bundle = createThemeArtifactBundle(composition, release);
  const repeated = createThemeArtifactBundle(composition, release);

  assert.deepEqual(bundle, repeated);
  assert.deepEqual(
    bundle.artifacts.map((artifact) => artifact.fileName),
    [
      "primitives.css",
      "theme-light.css",
      "theme-dark.css",
      "theme-high-contrast.css",
      "theme-high-contrast-dark.css",
      "bundle.css",
      "manifest.json",
    ],
  );
  assert.ok(bundle.artifacts.every((artifact) => artifact.byteLength > 0));
  assert.ok(bundle.artifacts.every((artifact) => /^fnv1a32-[0-9a-f]{8}$/.test(artifact.contentHash)));
  assert.equal(bundle.artifacts[5].content, composition.colorOutput.cssOutput.all);
  assert.deepEqual(JSON.parse(bundle.artifacts[6].content), bundle.manifest);
});

test("rejects invalid release metadata before creating a manifest", () => {
  const composition = createThemeComposition(source);

  assert.throws(
    () => createThemeManifest(composition, null),
    (error) => error instanceof ThemeArtifactValidationError
      && error.field === "release",
  );
  assert.throws(
    () => createThemeManifest(composition, { ...release, version: "bad version" }),
    (error) => error instanceof ThemeArtifactValidationError
      && error.field === "release.version",
  );
  assert.throws(
    () => createThemeManifest(composition, { ...release, createdAt: "not-a-date" }),
    (error) => error instanceof ThemeArtifactValidationError
      && error.field === "release.createdAt",
  );
  assert.throws(
    () => createThemeManifest(composition, { ...release, createdAt: "2026-07-16" }),
    (error) => error instanceof ThemeArtifactValidationError
      && error.field === "release.createdAt",
  );
  assert.throws(
    () => createThemeManifest(composition, { ...release, createdBy: " " }),
    (error) => error instanceof ThemeArtifactValidationError
      && error.field === "release.createdBy",
  );
});
