import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  PfAlert,
  PfBadge,
  PfButton,
  PfCard,
  definePuzzleFactoryReactComponents,
} from "../dist/index.js";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");

test("package exposes the React wrapper proof boundary", () => {
  assert.equal(packageJson.name, "@puzzlefactory/react-components");
  assert.equal(typeof PfButton, "object");
  assert.equal(typeof PfAlert, "object");
  assert.equal(typeof PfBadge, "object");
  assert.equal(typeof PfCard, "object");
  assert.equal(typeof definePuzzleFactoryReactComponents, "function");
});

test("React wrappers keep runtime behavior in peer/framework packages", () => {
  assert.equal(packageJson.dependencies, undefined);
  assert.equal(packageJson.sideEffects, true);
  assert.deepEqual(packageJson.peerDependencies, {
    "@puzzlefactory/components": "0.0.0",
    react: ">=19.0.0",
  });
});

test("React wrappers register and render only the stable custom elements", () => {
  assert.match(source, /definePuzzleFactoryComponents\(\);/);
  assert.match(source, /createElement\("pf-button"/);
  assert.match(source, /createElement\("pf-alert"/);
  assert.match(source, /createElement\("pf-badge"/);
  assert.match(source, /createElement\(\s*"pf-card"/);
  assert.doesNotMatch(source, /createElement\("pf-input"/);
});

test("React wrappers do not import color generation internals", () => {
  assert.doesNotMatch(source, /@puzzlefactory\/color-engine/);
  assert.doesNotMatch(source, /createColorEngineTheme/);
});

test("React wrappers do not duplicate component styling or color recipes", () => {
  assert.doesNotMatch(source, /--ds-/);
  assert.doesNotMatch(source, /\bopacity\s*:/);
  assert.doesNotMatch(source, /\bfilter\s*:/);
  assert.doesNotMatch(source, /color-mix\(/);
});

test("React wrappers normalize default attributes before rendering", () => {
  assert.match(source, /variant = "primary"/);
  assert.match(source, /variant = "soft"/);
  assert.match(source, /status = "info"/);
  assert.match(source, /variant = "default"/);
  assert.match(source, /if \(variant === "secondary"\)/);
  assert.match(source, /if \(variant === "solid"\)/);
  assert.match(source, /if \(status !== "info"\)/);
  assert.match(source, /if \(variant === "raised"\)/);
});
