import assert from "node:assert/strict";
import test from "node:test";
import { createColorEngineTheme } from "@puzzlefactory/color-engine-1";
import {
  createThemeCss,
  createThemeCssFiles,
  createTokenCssFiles,
  createTokenCssOutput,
  inferNamespace,
} from "../dist/index.js";

test("createTokenCssFiles renders primitive sRGB custom properties", () => {
  const output = createColorEngineTheme({
    seed: "#3366ff",
    harmony: "complementary",
    namespace: "pf",
  });
  const files = createTokenCssFiles(output);

  assert.equal(files["tokens.css"].startsWith(":root {\n"), true);
  assert.match(files["tokens.css"], /  --pf-neutral-l-1: oklch\([^)]+\);/);
  assert.match(files["tokens.css"], /  --pf-palette-a-l-1: oklch\([^)]+\);/);
  assert.equal(countDeclarations(files["tokens.css"]), Object.keys(output.primitives.srgb).length);
  assert.equal(files["tokens.css"].endsWith("\n}"), true);
});

test("createTokenCssFiles renders P3 overrides inside a supports block", () => {
  const output = createColorEngineTheme({
    seed: "#3366ff",
    harmony: "complementary",
    namespace: "pf",
  });
  const p3Value = "color(display-p3 0.7 0.6 0.2)";
  const files = createTokenCssFiles({
    ...output,
    primitives: {
      ...output.primitives,
      p3: {
        "palette-a-l-1": p3Value,
      },
    },
  });

  assert.equal(
    files["tokens-p3.css"],
    `@supports (color: color(display-p3 0 0 0)) {
  :root {
    --pf-palette-a-l-1: ${p3Value};
  }
}`,
  );
  assert.equal(files["tokens-p3.css"].includes("--pf-neutral-l-1"), false);
});

test("createTokenCssFiles renders theme selectors and semantic references", () => {
  const output = createColorEngineTheme({
    seed: "#3366ff",
    harmony: "complementary",
    namespace: "pf",
  });
  const files = createTokenCssFiles(output);

  assert.equal(files["theme-light.css"].startsWith(":root,\n[data-theme=\"light\"] {\n"), true);
  assert.match(files["theme-light.css"], /  --pf-surface-base: var\(--pf-neutral-l-2\);/);
  assert.match(files["theme-light.css"], /  --pf-surface-raised: var\(--pf-neutral-l-1\);/);
  assert.equal(countDeclarations(files["theme-light.css"]), Object.keys(output.semantic.light).length);
  assert.equal(files["theme-dark.css"].startsWith("[data-theme=\"dark\"] {\n"), true);
  assert.equal(files["theme-dark.css"].includes(":root"), false);
  assert.equal(countDeclarations(files["theme-dark.css"]), Object.keys(output.semantic.dark).length);
  assert.equal(
    files["theme-high-contrast.css"].startsWith("[data-theme=\"high-contrast\"] {\n"),
    true,
  );
  assert.equal(
    files["theme-high-contrast-dark.css"].startsWith(
      "[data-theme=\"high-contrast-dark\"] {\n",
    ),
    true,
  );
});

test("createThemeCssFiles returns the four theme files in load-order-ready names", () => {
  const output = createColorEngineTheme({
    seed: "#3366ff",
    harmony: "triadic",
  });
  const files = createThemeCssFiles(output);

  assert.deepEqual(
    files.map((file) => file.fileName),
    [
      "theme-light.css",
      "theme-dark.css",
      "theme-high-contrast.css",
      "theme-high-contrast-dark.css",
    ],
  );
  assert.deepEqual(
    files.map((file) => file.theme),
    ["light", "dark", "highContrast", "highContrastDark"],
  );
});

test("inferNamespace handles namespace values that contain hyphens", () => {
  const output = createColorEngineTheme({
    seed: "#3366ff",
    harmony: "complementary",
    namespace: "tenant-one",
  });

  assert.equal(inferNamespace(output), "tenant-one");
  assert.match(
    createThemeCss(output, "light"),
    /  --tenant-one-surface-base: var\(--tenant-one-neutral-l-2\);/,
  );
});

test("createTokenCssOutput reports the inferred namespace with generated files", () => {
  const output = createColorEngineTheme({
    seed: "#3366ff",
    harmony: "complementary",
    namespace: "pf",
  });
  const result = createTokenCssOutput(output);

  assert.equal(result.namespace, "pf");
  assert.equal(Object.keys(result.files).length, 6);
});

function countDeclarations(css) {
  return css.split("\n").filter((line) => line.trim().startsWith("--")).length;
}
