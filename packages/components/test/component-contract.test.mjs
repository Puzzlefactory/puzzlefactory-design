import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  PUZZLEFACTORY_COMPONENT_TAG_NAMES,
  definePuzzleFactoryComponents,
} from "../dist/index.js";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");

test("package exposes the component proof boundary", () => {
  assert.equal(packageJson.name, "@puzzlefactory/components");
  assert.deepEqual(PUZZLEFACTORY_COMPONENT_TAG_NAMES, ["pf-button", "pf-alert"]);
  assert.equal(typeof definePuzzleFactoryComponents, "function");
});

test("component proof keeps zero runtime dependencies", () => {
  assert.equal(packageJson.dependencies, undefined);
});

test("components consume semantic CSS variables only", () => {
  const requiredVariables = [
    "--ds-primary-action-bg",
    "--ds-primary-action-text",
    "--ds-primary-focus-ring",
    "--ds-control-bg",
    "--ds-control-text",
    "--ds-surface-2-pressed",
    "--ds-text-primary",
    "--ds-danger-soft-bg",
    "--ds-danger-soft-text",
    "--ds-danger-solid-bg",
    "--ds-danger-solid-text",
    "--ds-warning-soft-bg",
    "--ds-warning-solid-bg",
    "--ds-success-soft-bg",
    "--ds-success-solid-bg",
    "--ds-info-soft-bg",
    "--ds-info-solid-bg",
  ];

  for (const variableName of requiredVariables) {
    assert.match(source, new RegExp(variableName.replaceAll("-", "\\-")));
  }

  assert.doesNotMatch(source, /--ds-[a-z]+-(?:light|dark)-(?:soft|solid)-\d/);
  assert.doesNotMatch(source, /--ds-surface-(?:light|dark)-\d/);
  assert.doesNotMatch(source, /--ds-text-(?:light|dark)-\w/);
});

test("components do not import color engine internals", () => {
  assert.doesNotMatch(source, /@puzzlefactory\/color-engine/);
  assert.doesNotMatch(source, /createColorEngineTheme/);
});
