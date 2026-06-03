import assert from "node:assert/strict";
import test from "node:test";
import {
  CONTRAST_ASSERTION_RULES,
  REFERENCE_SEMANTIC_MAPPINGS,
  runContrastAssertions,
} from "../dist/index.js";

test("runContrastAssertions evaluates expected relationships across all theme variants", () => {
  const assertions = runContrastAssertions({
    primitives: createPrimitiveTokens(),
    mappings: REFERENCE_SEMANTIC_MAPPINGS,
  });

  assert.equal(CONTRAST_ASSERTION_RULES.length, 24);
  assert.equal(assertions.length, 96);
  assert.equal(assertions.every((result) => result.status === "pass"), true);
  assert.equal(assertions.some((result) => result.tokenA === "text-disabled"), false);
});

test("runContrastAssertions reports contrast failures with absolute Lc", () => {
  const assertions = runContrastAssertions({
    primitives: createPrimitiveTokens({
      "neutral-d-11": 0.8,
    }),
    mappings: REFERENCE_SEMANTIC_MAPPINGS,
  });
  const result = findAssertion(assertions, "light", "text-primary", "surface-base");

  assert.equal(result.status, "fail");
  assert.equal(result.failureType, "CONTRAST");
  assert.equal(result.polarity, "CORRECT");
  assert.equal(result.requiredLc, 75);
  assert.equal(result.actualLc < result.requiredLc, true);
});

test("runContrastAssertions reports signed polarity errors separately", () => {
  const overrides = {
    "text-primary": "neutral-l-1",
  };
  const assertions = runContrastAssertions({
    primitives: createPrimitiveTokens({
      "neutral-l-1": 0.98,
      "neutral-l-2": 0.65,
    }),
    mappings: createOverriddenMappings(overrides),
    overrides,
  });
  const result = findAssertion(assertions, "light", "text-primary", "surface-base");

  assert.equal(result.status, "fail");
  assert.equal(result.failureType, "POLARITY_ERROR");
  assert.equal(result.polarity, "WRONG");
  assert.equal(result.source, "override");
});

test("runContrastAssertions applies elevated high-contrast text thresholds", () => {
  const assertions = runContrastAssertions({
    primitives: createPrimitiveTokens({
      "neutral-d-11": 0.35,
    }),
    mappings: REFERENCE_SEMANTIC_MAPPINGS,
  });
  const light = findAssertion(assertions, "light", "text-primary", "surface-base");
  const highContrast = findAssertion(assertions, "highContrast", "text-secondary", "surface-base");

  assert.equal(light.status, "pass");
  assert.equal(light.requiredLc, 75);
  assert.equal(highContrast.status, "fail");
  assert.equal(highContrast.requiredLc, 90);
  assert.equal(highContrast.failureType, "CONTRAST");
});

test("runContrastAssertions applies UI component thresholds to interactive text", () => {
  const assertions = runContrastAssertions({
    primitives: createPrimitiveTokens({
      "palette-a-d-3": 0.65,
      "palette-a-d-4": 0.65,
    }),
    mappings: REFERENCE_SEMANTIC_MAPPINGS,
  });
  const light = findAssertion(assertions, "light", "interactive-text", "interactive-bg-rest");
  const highContrast = findAssertion(
    assertions,
    "highContrast",
    "interactive-text",
    "interactive-bg-rest",
  );

  assert.equal(light.status, "pass");
  assert.equal(light.requiredLc, 45);
  assert.equal(light.actualLc >= 45, true);
  assert.equal(highContrast.status, "fail");
  assert.equal(highContrast.requiredLc, 60);
  assert.equal(highContrast.failureType, "CONTRAST");
});

test("runContrastAssertions applies warning status contrast floor", () => {
  const assertions = runContrastAssertions({
    primitives: createPrimitiveTokens({
      "neutral-l-1": 0.8,
      "status-warning-d-4": 0.5,
    }),
    mappings: REFERENCE_SEMANTIC_MAPPINGS,
  });
  const result = findAssertion(assertions, "light", "status-warning-text", "status-warning-bg");

  assert.equal(result.status, "warning");
  assert.equal(result.failureType, "CONTRAST");
  assert.equal(result.requiredLc, 45);
  assert.equal(result.actualLc >= 40, true);
  assert.equal(result.actualLc < 45, true);
});

test("runContrastAssertions labels reference assertions when overrides do not affect the pair", () => {
  const overrides = {
    "surface-raised": "neutral-l-3",
  };
  const assertions = runContrastAssertions({
    primitives: createPrimitiveTokens(),
    mappings: createOverriddenMappings(overrides),
    overrides,
  });
  const result = findAssertion(assertions, "light", "text-primary", "surface-base");

  assert.equal(result.source, "reference");
});

function findAssertion(assertions, theme, tokenA, tokenB) {
  const result = assertions.find(
    (assertion) =>
      assertion.theme === theme && assertion.tokenA === tokenA && assertion.tokenB === tokenB,
  );

  assert.ok(result, `${theme} ${tokenA}/${tokenB} assertion missing`);

  return result;
}

function createOverriddenMappings(overrides) {
  return Object.fromEntries(
    Object.entries(REFERENCE_SEMANTIC_MAPPINGS).map(([theme, mapping]) => [
      theme,
      {
        ...mapping,
        ...overrides,
      },
    ]),
  );
}

function createPrimitiveTokens(lightnessOverrides = {}) {
  const names = unique(
    Object.values(REFERENCE_SEMANTIC_MAPPINGS).flatMap((mapping) => Object.values(mapping)),
  );

  return names.map((name) => {
    const lightness = lightnessOverrides[name] ?? defaultLightness(name);
    const oklch = {
      l: lightness,
      c: 0,
      h: 0,
    };

    return {
      name,
      slot: name.replace(/-[ld]-(?:[1-9]|1[0-2])$/, ""),
      tone: name.includes("-l-") ? "l" : "d",
      step: Number(name.match(/-(?:l|d)-([0-9]+)$/)?.[1] ?? 1),
      oklch,
      srgb: `oklch(${oklch.l} ${oklch.c} ${oklch.h})`,
      p3: "color(display-p3 0 0 0)",
    };
  });
}

function defaultLightness(name) {
  return name.includes("-l-") ? 0.95 : 0.1;
}

function unique(values) {
  return [...new Set(values)];
}
