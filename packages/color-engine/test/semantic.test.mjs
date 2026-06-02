import assert from "node:assert/strict";
import test from "node:test";
import {
  REFERENCE_SEMANTIC_MAPPINGS,
  SEMANTIC_TOKEN_NAMES,
  assemblePrimitiveTokens,
  primitiveNamesFromTokens,
  resolveSemanticMappings,
  normalizeSeed,
} from "../dist/index.js";

const seed = normalizeSeed("#3366ff");

test("reference semantic mappings include every semantic token in every theme", () => {
  for (const [theme, mapping] of Object.entries(REFERENCE_SEMANTIC_MAPPINGS)) {
    assert.deepEqual(Object.keys(mapping).sort(), [...SEMANTIC_TOKEN_NAMES].sort(), theme);
  }
});

test("reference semantic mappings preserve light and dark spec mappings", () => {
  assert.deepEqual(REFERENCE_SEMANTIC_MAPPINGS.light, EXPECTED_LIGHT_MAPPING);
  assert.deepEqual(REFERENCE_SEMANTIC_MAPPINGS.dark, EXPECTED_DARK_MAPPING);
});

test("reference semantic mappings preserve high-contrast spec mappings and collapses", () => {
  assert.deepEqual(REFERENCE_SEMANTIC_MAPPINGS.highContrast, EXPECTED_HIGH_CONTRAST_MAPPING);
  assert.deepEqual(REFERENCE_SEMANTIC_MAPPINGS.highContrastDark, EXPECTED_HIGH_CONTRAST_DARK_MAPPING);
});

test("resolveSemanticMappings only references generated primitives", () => {
  for (const harmony of ["complementary", "analogous", "triadic", "split-complementary", "monochromatic"]) {
    const primitives = assemblePrimitiveTokens({
      seed,
      harmony,
      mood: "vibrant",
    });
    const primitiveNames = new Set(primitiveNamesFromTokens(primitives.tokens));
    const mappings = resolveSemanticMappings({
      primitiveNames,
    });

    for (const mapping of Object.values(mappings)) {
      assert.equal(Object.values(mapping).every((primitiveName) => primitiveNames.has(primitiveName)), true, harmony);
    }
  }
});

test("resolveSemanticMappings applies overrides across all theme variants", () => {
  const primitives = assemblePrimitiveTokens({
    seed,
    harmony: "complementary",
  });
  const mappings = resolveSemanticMappings({
    primitiveNames: primitiveNamesFromTokens(primitives.tokens),
    overrides: {
      "surface-base": "neutral-l-2",
      "status-danger-text": "status-danger-l-1",
    },
  });

  assert.equal(mappings.light["surface-base"], "neutral-l-2");
  assert.equal(mappings.dark["surface-base"], "neutral-l-2");
  assert.equal(mappings.highContrast["status-danger-text"], "status-danger-l-1");
  assert.equal(mappings.highContrastDark["status-danger-text"], "status-danger-l-1");
});

test("resolveSemanticMappings rejects overrides for primitives absent from inventory", () => {
  const primitives = assemblePrimitiveTokens({
    seed,
    harmony: "monochromatic",
  });

  assert.throws(
    () =>
      resolveSemanticMappings({
        primitiveNames: primitiveNamesFromTokens(primitives.tokens),
        overrides: {
          "surface-tinted": "palette-b-l-1",
        },
      }),
    {
      code: "INVALID_OVERRIDE_REFERENCE",
      field: "overrides.semanticMapping.surface-tinted",
    },
  );
});

function expectedStatusMappings(config) {
  return Object.fromEntries(
    ["danger", "warning", "success", "info"].flatMap((statusName) => {
      const slot = `status-${statusName}`;

      return [
        [`${slot}-bg`, `${slot}-${config.bg}`],
        [`${slot}-text`, config.text],
        [`${slot}-container`, `${slot}-${config.container}`],
        [`${slot}-on-container`, `${slot}-${config.onContainer}`],
        [`${slot}-border`, `${slot}-${config.border}`],
      ];
    }),
  );
}

const EXPECTED_LIGHT_MAPPING = {
  "surface-base": "neutral-l-1",
  "surface-raised": "neutral-l-2",
  "surface-overlay": "neutral-l-1",
  "surface-tinted": "palette-a-l-2",
  "text-primary": "neutral-d-11",
  "text-secondary": "neutral-d-8",
  "text-disabled": "neutral-d-4",
  "interactive-bg-rest": "palette-a-d-4",
  "interactive-bg-hover": "palette-a-d-3",
  "interactive-bg-active": "palette-a-d-2",
  "interactive-bg-disabled": "neutral-l-5",
  "interactive-text": "neutral-l-1",
  "interactive-border": "palette-a-d-5",
  "focus-ring": "palette-a-d-3",
  "border-strong": "neutral-d-6",
  "border-subtle": "neutral-l-5",
  ...expectedStatusMappings({
    bg: "d-4",
    text: "neutral-l-1",
    container: "l-2",
    onContainer: "d-9",
    border: "d-5",
  }),
};

const EXPECTED_DARK_MAPPING = {
  "surface-base": "neutral-d-12",
  "surface-raised": "neutral-d-11",
  "surface-overlay": "neutral-d-12",
  "surface-tinted": "palette-a-d-11",
  "text-primary": "neutral-l-2",
  "text-secondary": "neutral-l-5",
  "text-disabled": "neutral-l-9",
  "interactive-bg-rest": "palette-a-l-9",
  "interactive-bg-hover": "palette-a-l-10",
  "interactive-bg-active": "palette-a-l-11",
  "interactive-bg-disabled": "neutral-d-9",
  "interactive-text": "neutral-d-12",
  "interactive-border": "palette-a-l-8",
  "focus-ring": "palette-a-l-10",
  "border-strong": "neutral-l-6",
  "border-subtle": "neutral-d-9",
  ...expectedStatusMappings({
    bg: "l-9",
    text: "neutral-d-12",
    container: "d-10",
    onContainer: "l-3",
    border: "l-8",
  }),
};

const EXPECTED_HIGH_CONTRAST_MAPPING = {
  "surface-base": "neutral-l-1",
  "surface-raised": "neutral-l-2",
  "surface-overlay": "neutral-l-1",
  "surface-tinted": "neutral-l-1",
  "text-primary": "neutral-d-12",
  "text-secondary": "neutral-d-11",
  "text-disabled": "neutral-d-4",
  "interactive-bg-rest": "palette-a-d-3",
  "interactive-bg-hover": "palette-a-d-2",
  "interactive-bg-active": "palette-a-d-1",
  "interactive-bg-disabled": "neutral-l-5",
  "interactive-text": "neutral-l-1",
  "interactive-border": "palette-a-d-4",
  "focus-ring": "palette-a-d-2",
  "border-strong": "neutral-d-8",
  "border-subtle": "neutral-d-5",
  ...expectedStatusMappings({
    bg: "d-3",
    text: "neutral-l-1",
    container: "l-2",
    onContainer: "d-11",
    border: "d-6",
  }),
};

const EXPECTED_HIGH_CONTRAST_DARK_MAPPING = {
  "surface-base": "neutral-d-12",
  "surface-raised": "neutral-d-12",
  "surface-overlay": "neutral-d-12",
  "surface-tinted": "neutral-d-12",
  "text-primary": "neutral-l-1",
  "text-secondary": "neutral-l-2",
  "text-disabled": "neutral-l-9",
  "interactive-bg-rest": "palette-a-l-8",
  "interactive-bg-hover": "palette-a-l-9",
  "interactive-bg-active": "palette-a-l-10",
  "interactive-bg-disabled": "neutral-d-9",
  "interactive-text": "neutral-d-12",
  "interactive-border": "palette-a-l-7",
  "focus-ring": "palette-a-l-9",
  "border-strong": "neutral-l-5",
  "border-subtle": "neutral-l-8",
  ...expectedStatusMappings({
    bg: "l-10",
    text: "neutral-d-12",
    container: "d-10",
    onContainer: "l-2",
    border: "l-7",
  }),
};
