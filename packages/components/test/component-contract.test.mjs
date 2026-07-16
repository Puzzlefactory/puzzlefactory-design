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
  assert.deepEqual(PUZZLEFACTORY_COMPONENT_TAG_NAMES, [
    "pf-button",
    "pf-alert",
    "pf-badge",
    "pf-card",
  ]);
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
    "--ds-control-border",
    "--ds-control-text",
    "--ds-border-default",
    "--ds-border-strong",
    "--ds-surface-2",
    "--ds-surface-3",
    "--ds-surface-2-pressed",
    "--ds-text-primary",
    "--ds-text-secondary",
    "--ds-text-muted",
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

test("button disabled state uses neutral semantic tokens directly", () => {
  assert.match(source, /\.button:disabled,\s*\.button:disabled:hover,\s*\.button:disabled:active/);
  assert.match(source, /border-color: var\(--ds-control-border\);/);
  assert.match(source, /background: var\(--ds-control-bg\);/);
  assert.match(source, /color: var\(--ds-text-muted\);/);
});

test("component color recipes avoid local color derivation", () => {
  assert.doesNotMatch(source, /\bopacity\s*:/);
  assert.doesNotMatch(source, /\bfilter\s*:/);
  assert.doesNotMatch(source, /color-mix\(/);
});

test("components do not import color engine internals", () => {
  assert.doesNotMatch(source, /@puzzlefactory\/color-engine/);
  assert.doesNotMatch(source, /createColorEngineTheme/);
});

test("button exposes a narrow native-backed API contract", () => {
  assert.match(source, /get disabled\(\): boolean/);
  assert.match(source, /set disabled\(value: boolean\)/);
  assert.match(source, /get variant\(\): PfButtonVariant/);
  assert.match(source, /set variant\(value: PfButtonVariant\)/);
  assert.match(source, /click\(\): void/);
  assert.match(source, /focus\(options\?: FocusOptions\): void/);
  assert.match(source, /<button class="button" part="button" type="button">/);
});

test("button forwards explicit accessible naming to its native control", () => {
  assert.match(source, /observedAttributes\(\)[\s\S]*"aria-label"/);
  assert.match(source, /#syncAccessibleName\(\)/);
  assert.match(source, /this\.#button\.setAttribute\("aria-label", label\)/);
});

test("button keeps native form behavior intentionally deferred", () => {
  assert.doesNotMatch(source, /static formAssociated/);
  assert.doesNotMatch(source, /attachInternals/);
  assert.doesNotMatch(source, /setFormValue/);
});

test("alert exposes status and variant properties without becoming interactive", () => {
  assert.match(source, /get status\(\): PfAlertStatus/);
  assert.match(source, /set status\(value: PfAlertStatus\)/);
  assert.match(source, /get variant\(\): PfAlertVariant/);
  assert.match(source, /set variant\(value: PfAlertVariant\)/);
  assert.match(source, /role="status"/);
});

test("badge exposes status and variant properties without becoming interactive", () => {
  assert.match(source, /export class PfBadgeElement/);
  assert.match(source, /get status\(\): PfBadgeStatus/);
  assert.match(source, /set status\(value: PfBadgeStatus\)/);
  assert.match(source, /get variant\(\): PfBadgeVariant/);
  assert.match(source, /set variant\(value: PfBadgeVariant\)/);
  assert.doesNotMatch(source, /PfBadgeElement[\s\S]*role="/);
});

test("card exposes a surface composition contract", () => {
  assert.match(source, /export class PfCardElement/);
  assert.match(source, /get variant\(\): PfCardVariant/);
  assert.match(source, /set variant\(value: PfCardVariant\)/);
  assert.match(source, /<slot name="eyebrow"><\/slot>/);
  assert.match(source, /<slot name="title"><\/slot>/);
  assert.match(source, /<slot name="footer"><\/slot>/);
  assert.match(source, /\[data-optional-slot\]\[hidden\]/);
});
