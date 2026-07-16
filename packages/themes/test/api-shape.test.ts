import type {
  NormalizedThemeSource,
  ResolvedThemeRegion,
  ThemeArtifactBundle,
  ThemeArtifactContentHash,
  ThemeArtifactFile,
  ThemeArtifactFileName,
  ThemeArtifactKind,
  ThemeArtifactValidationErrorCode,
  ThemeComposition,
  ThemeManifest,
  ThemeManifestFile,
  ThemeManifestSchemaVersion,
  ThemeRegionDiagnosticKind,
  ThemeRegionDiagnosticResult,
  ThemeRegionId,
  ThemeRegionMapping,
  ThemeRegionMappings,
  ThemeRegionTreatment,
  ThemeSchemaVersion,
  ThemeSourceInput,
  ThemeReleaseMetadata,
  ThemeValidationErrorCode,
} from "../src/index.js";
import {
  THEME_COLOR_ENGINE_CONTRACT_VERSION,
  THEME_ATTRIBUTE,
  THEME_ID_PATTERN,
  THEME_MANIFEST_SCHEMA_VERSION,
  THEME_REGION_DEFINITIONS,
  THEME_REGION_IDS,
  THEME_REGION_TREATMENTS,
  THEME_SCHEMA_VERSION,
  ThemeArtifactValidationError,
  ThemeValidationError,
  createThemeArtifactBundle,
  createThemeComposition,
  createThemeManifest,
  normalizeThemeSource,
  resolveThemeRegionLabelForeground,
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
const composition: ThemeComposition = createThemeComposition(source);
const release: ThemeReleaseMetadata = {
  version: "1.0.0",
  createdAt: "2026-07-16T12:00:00.000Z",
};
const manifest: ThemeManifest = createThemeManifest(composition, release);
const bundle: ThemeArtifactBundle = createThemeArtifactBundle(composition, release);
const artifact: ThemeArtifactFile = bundle.artifacts[0]!;
const manifestFile: ThemeManifestFile = manifest.files[0]!;
const artifactFileName: ThemeArtifactFileName = artifact.fileName;
const artifactKind: ThemeArtifactKind = artifact.kind;
const artifactHash: ThemeArtifactContentHash = artifact.contentHash;
const manifestSchemaVersion: ThemeManifestSchemaVersion = THEME_MANIFEST_SCHEMA_VERSION;
const resolvedRegion: ResolvedThemeRegion = composition.regions[0]!;
const regionDiagnostic: ThemeRegionDiagnosticResult = composition.regionDiagnostics[0]!;
const regionDiagnosticKind: ThemeRegionDiagnosticKind = regionDiagnostic.kind;
const labelResolution = resolveThemeRegionLabelForeground(
  composition.colorOutput,
  resolvedRegion,
  "light",
);
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
const artifactErrorCode: ThemeArtifactValidationErrorCode = new ThemeArtifactValidationError({
  field: "release.version",
  value: "",
  message: "Invalid",
}).code;
const idMatches: boolean = THEME_ID_PATTERN.test(source.id);
const themeAttribute: "data-theme-v2" = THEME_ATTRIBUTE;
const headerLabel: string = THEME_REGION_DEFINITIONS.header.label;

void normalized;
void composition;
void manifest;
void bundle;
void artifact;
void manifestFile;
void artifactFileName;
void artifactKind;
void artifactHash;
void manifestSchemaVersion;
void resolvedRegion;
void regionDiagnostic;
void regionDiagnosticKind;
void labelResolution;
void schemaVersion;
void regionId;
void treatment;
void errorCode;
void contractVersion;
void artifactErrorCode;
void idMatches;
void themeAttribute;
void headerLabel;
