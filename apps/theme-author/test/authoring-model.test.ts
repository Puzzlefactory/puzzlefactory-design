import assert from "node:assert/strict";
import test from "node:test";
import {
  createNormalizedCustomRoles,
  getNextAuthoredRoleNumber,
  getEngineFieldRoleKey,
  INITIAL_AUTHORED_ROLES,
  INITIAL_REGION_MAPPINGS,
  isAuthoringStateModified,
  normalizeRegionMappings,
  validateAuthoredRoleIds,
  type AuthoredCustomRole,
} from "../src/authoring-model.ts";

const roles = [
  {
    key: "role-1",
    id: "campaign",
    lightSeed: "#336699",
    darkSeed: "",
    seedPolicy: "anchored",
    enabled: true,
  },
  {
    key: "role-2",
    id: "legacy",
    lightSeed: "#663399",
    darkSeed: "#cc99ff",
    seedPolicy: "balanced",
    enabled: false,
  },
] satisfies readonly AuthoredCustomRole[];

test("normalizes enabled roles and omits an empty optional dark seed", () => {
  assert.deepEqual(createNormalizedCustomRoles(roles), {
    campaign: {
      seed: "#336699",
      seedPolicy: "anchored",
    },
  });
});

test("allocates role numbers above sparse stored keys and ids", () => {
  assert.equal(getNextAuthoredRoleNumber(roles), 3);
  assert.equal(getNextAuthoredRoleNumber([
    ...roles,
    { ...roles[0], key: "role-9", id: "custom-role-12" },
  ]), 13);
  assert.equal(getNextAuthoredRoleNumber([
    ...roles,
    { ...roles[0], key: `role-${"9".repeat(400)}`, id: `custom-role-${"9".repeat(400)}` },
  ]), 4);
});

test("reports invalid, reserved, and duplicate enabled role IDs", () => {
  const invalidRoles = [
    { ...roles[0], key: "invalid", id: "Bad ID" },
    { ...roles[0], key: "reserved", id: "primary" },
    { ...roles[0], key: "duplicate-a", id: "campaign" },
    { ...roles[0], key: "duplicate-b", id: "campaign" },
  ];
  const errors = validateAuthoredRoleIds(invalidRoles);

  assert.equal(errors.length, 4);
  assert.match(errors[0]?.message ?? "", /lowercase kebab-case/);
  assert.match(errors[1]?.message ?? "", /reserved/);
  assert.match(errors[2]?.message ?? "", /unique/);
});

test("normalizes region role keys to enabled authored role IDs", () => {
  assert.deepEqual(
    normalizeRegionMappings([
      { id: "header", roleKey: "role-1", treatment: "solid" },
      { id: "sidebar", roleKey: "role-1", treatment: "soft" },
      { id: "footer", roleKey: "role-1", treatment: "soft" },
    ], roles),
    {
      header: { roleId: "campaign", treatment: "solid" },
      sidebar: { roleId: "campaign", treatment: "soft" },
      footer: { roleId: "campaign", treatment: "soft" },
    },
  );
});

test("does not produce a publishable mapping when a region role is unavailable", () => {
  assert.equal(
    normalizeRegionMappings([
      { id: "header", roleKey: "role-1", treatment: "solid" },
      { id: "sidebar", roleKey: "role-1", treatment: "soft" },
      { id: "footer", roleKey: "role-2", treatment: "soft" },
    ], roles),
    null,
  );
});

test("maps color-engine field paths back to stable authoring keys", () => {
  assert.equal(getEngineFieldRoleKey("customRoles.campaign.seed", roles), "role-1");
  assert.equal(getEngineFieldRoleKey("primarySeed", roles), undefined);
});

test("tracks authored role and region changes independently from preset input", () => {
  assert.equal(isAuthoringStateModified(INITIAL_AUTHORED_ROLES, INITIAL_REGION_MAPPINGS), false);
  assert.equal(
    isAuthoringStateModified(
      INITIAL_AUTHORED_ROLES,
      INITIAL_REGION_MAPPINGS.map((mapping) =>
        mapping.id === "header" ? { ...mapping, treatment: "soft" } : mapping
      ),
    ),
    true,
  );
});
