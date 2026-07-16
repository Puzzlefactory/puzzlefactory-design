import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { ColorEngineValidationError } from "@puzzlefactory/color-engine";
import {
  THEME_COLOR_ENGINE_CONTRACT_VERSION,
  THEME_REGION_IDS,
  THEME_SCHEMA_VERSION,
  ThemeValidationError,
  normalizeThemeSource,
} from "../dist/index.js";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

const createSource = (overrides = {}) => ({
  schemaVersion: THEME_SCHEMA_VERSION,
  id: "tenant-default",
  name: "Tenant Default",
  color: {
    namespace: "ds",
    customRoles: {
      institution: { seed: "#24569b" },
      navigation: { seed: "#147d6f" },
      footer: { seed: "#263b55" },
    },
  },
  regions: {
    header: { roleId: "institution", treatment: "solid" },
    sidebar: { roleId: "navigation", treatment: "soft" },
    footer: { roleId: "footer", treatment: "solid" },
  },
  ...overrides,
});

test("package exposes the theme composition boundary", () => {
  assert.equal(packageJson.name, "@puzzlefactory/themes");
  assert.equal(packageJson.sideEffects, false);
  assert.deepEqual(packageJson.dependencies, {
    "@puzzlefactory/color-engine": "0.0.0",
  });
  assert.equal(THEME_SCHEMA_VERSION, 1);
  assert.equal(THEME_COLOR_ENGINE_CONTRACT_VERSION, 2);
  assert.deepEqual(THEME_REGION_IDS, ["header", "sidebar", "footer"]);
});

test("normalizes identity, color input, and exact region mappings", () => {
  const normalized = normalizeThemeSource(createSource({
    id: " tenant-default ",
    name: " Tenant Default ",
  }));

  assert.equal(normalized.id, "tenant-default");
  assert.equal(normalized.name, "Tenant Default");
  assert.equal(normalized.color.namespace, "ds");
  assert.equal(normalized.color.customRoles.institution.darkSeed, "#24569b");
  assert.deepEqual(normalized.regions, {
    header: { roleId: "institution", treatment: "solid" },
    sidebar: { roleId: "navigation", treatment: "soft" },
    footer: { roleId: "footer", treatment: "solid" },
  });
});

test("canonicalizes custom roles independently from caller insertion order", () => {
  const roles = createSource().color.customRoles;
  const forward = normalizeThemeSource(createSource({
    color: { namespace: "ds", customRoles: roles },
  }));
  const reverse = normalizeThemeSource(createSource({
    color: {
      namespace: "ds",
      customRoles: Object.fromEntries(Object.entries(roles).reverse()),
    },
  }));

  assert.deepEqual(Object.keys(forward.color.customRoles), ["footer", "institution", "navigation"]);
  assert.deepEqual(reverse, forward);
});

test("rejects unsupported schema versions and invalid theme identity", () => {
  assert.throws(
    () => normalizeThemeSource(null),
    (error) => error instanceof ThemeValidationError
      && error.code === "INVALID_THEME_SOURCE"
      && error.field === "$",
  );
  assert.throws(
    () => normalizeThemeSource(createSource({ schemaVersion: 2 })),
    (error) => error instanceof ThemeValidationError
      && error.code === "INVALID_THEME_SCHEMA_VERSION"
      && error.field === "schemaVersion",
  );
  assert.throws(
    () => normalizeThemeSource(createSource({ id: "Tenant Default" })),
    (error) => error instanceof ThemeValidationError
      && error.code === "INVALID_THEME_ID"
      && error.field === "id",
  );
  assert.throws(
    () => normalizeThemeSource(createSource({ name: " " })),
    (error) => error instanceof ThemeValidationError
      && error.code === "INVALID_THEME_NAME"
      && error.field === "name",
  );
});

test("rejects missing color and region source objects", () => {
  const source = createSource();

  assert.throws(
    () => normalizeThemeSource({ ...source, color: undefined }),
    (error) => error instanceof ThemeValidationError
      && error.code === "INVALID_THEME_SOURCE"
      && error.field === "color",
  );
  assert.throws(
    () => normalizeThemeSource({ ...source, regions: undefined }),
    (error) => error instanceof ThemeValidationError
      && error.code === "INVALID_THEME_SOURCE"
      && error.field === "regions",
  );
});

test("rejects missing, malformed, and unknown region role mappings", () => {
  const source = createSource();

  assert.throws(
    () => normalizeThemeSource({
      ...source,
      regions: { ...source.regions, header: undefined },
    }),
    (error) => error instanceof ThemeValidationError
      && error.code === "INVALID_REGION_MAPPING"
      && error.field === "regions.header",
  );
  assert.throws(
    () => normalizeThemeSource({
      ...source,
      regions: {
        ...source.regions,
        sidebar: { roleId: "navigation", treatment: "outline" },
      },
    }),
    (error) => error instanceof ThemeValidationError
      && error.code === "INVALID_REGION_MAPPING"
      && error.field === "regions.sidebar",
  );
  assert.throws(
    () => normalizeThemeSource({
      ...source,
      regions: {
        ...source.regions,
        footer: { roleId: "billing", treatment: "solid" },
      },
    }),
    (error) => error instanceof ThemeValidationError
      && error.code === "UNKNOWN_REGION_ROLE"
      && error.field === "regions.footer.roleId",
  );
});

test("surfaces color-engine validation errors without obscuring their fields", () => {
  const source = createSource();

  assert.throws(
    () => normalizeThemeSource({
      ...source,
      color: {
        ...source.color,
        customRoles: {
          ...source.color.customRoles,
          institution: { seed: "not-a-color" },
        },
      },
    }),
    (error) => error instanceof ColorEngineValidationError
      && error.field === "customRoles.institution.seed",
  );
});
