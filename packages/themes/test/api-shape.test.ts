import type {
  NormalizedThemeSource,
  ThemeRegionId,
  ThemeRegionMapping,
  ThemeRegionMappings,
  ThemeRegionTreatment,
  ThemeSchemaVersion,
  ThemeSourceInput,
  ThemeValidationErrorCode,
} from "../src/index.js";
import {
  THEME_COLOR_ENGINE_CONTRACT_VERSION,
  THEME_ID_PATTERN,
  THEME_REGION_IDS,
  THEME_REGION_TREATMENTS,
  THEME_SCHEMA_VERSION,
  ThemeValidationError,
  normalizeThemeSource,
} from "../src/index.js";

const mapping: ThemeRegionMapping = {
  roleId: "institution",
  treatment: "solid",
};
const regions: ThemeRegionMappings = {
  header: mapping,
  sidebar: { roleId: "navigation", treatment: "soft" },
  footer: { roleId: "footer", treatment: "solid" },
};
const source: ThemeSourceInput = {
  schemaVersion: THEME_SCHEMA_VERSION,
  id: "tenant-default",
  name: "Tenant default",
  color: {
    customRoles: {
      institution: { seed: "#24569b" },
      navigation: { seed: "#147d6f" },
      footer: { seed: "#263b55" },
    },
  },
  regions,
};
const normalized: NormalizedThemeSource = normalizeThemeSource(source);
const schemaVersion: ThemeSchemaVersion = THEME_SCHEMA_VERSION;
const regionId: ThemeRegionId = THEME_REGION_IDS[0];
const treatment: ThemeRegionTreatment = THEME_REGION_TREATMENTS[0];
const errorCode: ThemeValidationErrorCode = new ThemeValidationError({
  code: "INVALID_THEME_ID",
  field: "id",
  value: "Invalid",
  message: "Invalid",
}).code;
const contractVersion: 2 = THEME_COLOR_ENGINE_CONTRACT_VERSION;
const idMatches: boolean = THEME_ID_PATTERN.test(source.id);

void normalized;
void schemaVersion;
void regionId;
void treatment;
void errorCode;
void contractVersion;
void idMatches;
