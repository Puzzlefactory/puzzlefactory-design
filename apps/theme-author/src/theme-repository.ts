import {
  THEME_ID_PATTERN,
  THEME_REGION_IDS,
  THEME_REGION_TREATMENTS,
  createThemeArtifactBundle,
  createThemeComposition,
  type ThemeArtifactBundle,
  type ThemeArtifactFile,
  type ThemeManifest,
} from "@puzzlefactory/themes";
import {
  SEED_POLICY_NAMES,
  SURFACE_PRESET_NAMES,
  TEXT_TREATMENT_STRATEGY_NAMES,
} from "@puzzlefactory/color-engine";
import type {
  AuthoredCustomRole,
  AuthoredRegionMapping,
  AuthoredThemeInput,
} from "./authoring-model";

export const THEME_DRAFT_SCHEMA_VERSION = 1 as const;
export const THEME_PUBLICATION_SCHEMA_VERSION = 1 as const;

export type ThemeDraftContent = {
  readonly themeId: string;
  readonly themeName: string;
  readonly themeInput: AuthoredThemeInput;
  readonly roles: readonly AuthoredCustomRole[];
  readonly regionMappings: readonly AuthoredRegionMapping[];
};

export type StoredThemeDraft = {
  readonly schemaVersion: typeof THEME_DRAFT_SCHEMA_VERSION;
  readonly tenantId: string;
  readonly revision: number;
  readonly updatedAt: string;
  readonly content: ThemeDraftContent;
};

export type PublishedThemeVersion = {
  readonly schemaVersion: typeof THEME_PUBLICATION_SCHEMA_VERSION;
  readonly tenantId: string;
  readonly themeId: string;
  readonly version: string;
  readonly publishedAt: string;
  readonly manifest: ThemeManifest;
  readonly artifacts: readonly ThemeArtifactFile[];
};

export type SaveThemeDraftRequest = {
  readonly tenantId: string;
  readonly expectedRevision: number | null;
  readonly content: ThemeDraftContent;
};

export type PublishThemeRequest = {
  readonly tenantId: string;
  readonly bundle: ThemeArtifactBundle;
};

export interface ThemeRepository {
  loadDraft(tenantId: string, themeId: string): Promise<StoredThemeDraft | null>;
  saveDraft(request: SaveThemeDraftRequest): Promise<StoredThemeDraft>;
  publishTheme(request: PublishThemeRequest): Promise<PublishedThemeVersion>;
  listPublications(tenantId: string, themeId: string): Promise<readonly PublishedThemeVersion[]>;
}

export type ThemeRepositoryErrorCode =
  | "INVALID_TENANT_ID"
  | "INVALID_THEME_ID"
  | "INVALID_DRAFT"
  | "INVALID_PUBLICATION"
  | "DRAFT_CONFLICT"
  | "VERSION_EXISTS"
  | "CORRUPT_STORAGE";

export class ThemeRepositoryError extends Error {
  readonly code: ThemeRepositoryErrorCode;

  constructor(code: ThemeRepositoryErrorCode, message: string) {
    super(message);
    this.name = "ThemeRepositoryError";
    this.code = code;
  }
}

export type BrowserThemeStorage = Pick<
  Storage,
  "getItem" | "setItem" | "length" | "key"
>;

const STORAGE_PREFIX = "puzzlefactory:theme-author:v1";
const TENANT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;

export function createBrowserLocalThemeRepository(
  storage: BrowserThemeStorage,
  now: () => Date = () => new Date(),
): ThemeRepository {
  return {
    async loadDraft(tenantId, themeId) {
      validateTenantId(tenantId);
      validateThemeId(themeId);
      const value = storage.getItem(createDraftKey(tenantId, themeId));

      return value === null ? null : parseStoredDraft(value, tenantId, themeId);
    },

    async saveDraft(request) {
      validateTenantId(request.tenantId);
      const content = validateDraftContent(request.content, "INVALID_DRAFT");
      validateThemeId(content.themeId);
      const key = createDraftKey(request.tenantId, content.themeId);
      const existingValue = storage.getItem(key);
      const existing = existingValue === null
        ? null
        : parseStoredDraft(existingValue, request.tenantId, content.themeId);
      const currentRevision = existing?.revision ?? null;

      if (currentRevision !== request.expectedRevision) {
        throw new ThemeRepositoryError(
          "DRAFT_CONFLICT",
          `Draft revision changed from ${request.expectedRevision ?? "new"} to ${currentRevision ?? "missing"}. Reload before saving again.`,
        );
      }

      if (currentRevision !== null && currentRevision >= Number.MAX_SAFE_INTEGER - 1) {
        throw new ThemeRepositoryError(
          "DRAFT_CONFLICT",
          "Draft revision has reached the browser-local adapter limit and cannot be advanced.",
        );
      }

      const saved = {
        schemaVersion: THEME_DRAFT_SCHEMA_VERSION,
        tenantId: request.tenantId,
        revision: (existing?.revision ?? 0) + 1,
        updatedAt: toCanonicalTimestamp(now()),
        content,
      } satisfies StoredThemeDraft;

      storage.setItem(key, JSON.stringify(saved));
      return cloneJson(saved);
    },

    async publishTheme(request) {
      validateTenantId(request.tenantId);
      const bundle = validateArtifactBundle(request.bundle, "INVALID_PUBLICATION");
      const { manifest } = bundle;
      const themeId = manifest.theme.id;
      const version = manifest.release.version;
      const key = createPublicationKey(request.tenantId, themeId, version);

      if (storage.getItem(key) !== null) {
        throw new ThemeRepositoryError(
          "VERSION_EXISTS",
          `Theme ${themeId} version ${version} already exists and cannot be replaced.`,
        );
      }

      const publication = {
        schemaVersion: THEME_PUBLICATION_SCHEMA_VERSION,
        tenantId: request.tenantId,
        themeId,
        version,
        publishedAt: manifest.release.createdAt,
        manifest,
        artifacts: bundle.artifacts,
      } satisfies PublishedThemeVersion;

      storage.setItem(key, JSON.stringify(publication));
      return cloneJson(publication);
    },

    async listPublications(tenantId, themeId) {
      validateTenantId(tenantId);
      validateThemeId(themeId);
      const prefix = createPublicationPrefix(tenantId, themeId);
      const publications: PublishedThemeVersion[] = [];

      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(prefix)) {
          const value = storage.getItem(key);
          if (value !== null) {
            let version: string;
            try {
              version = decodeURIComponent(key.slice(prefix.length));
            } catch {
              throw corruptStorageError();
            }
            publications.push(parsePublication(value, tenantId, themeId, version));
          }
        }
      }

      return publications.sort((left, right) =>
        right.publishedAt.localeCompare(left.publishedAt)
          || right.version.localeCompare(left.version)
      );
    },
  };
}

function validateTenantId(tenantId: string) {
  if (!TENANT_ID_PATTERN.test(tenantId)) {
    throw new ThemeRepositoryError(
      "INVALID_TENANT_ID",
      "Tenant ID must contain 1 to 100 letters, digits, dots, underscores, or hyphens.",
    );
  }
}

function validateThemeId(themeId: string) {
  if (!THEME_ID_PATTERN.test(themeId)) {
    throw new ThemeRepositoryError(
      "INVALID_THEME_ID",
      "Theme ID must use lowercase kebab-case beginning with a letter.",
    );
  }
}

function createDraftKey(tenantId: string, themeId: string): string {
  return `${STORAGE_PREFIX}:draft:${encodeURIComponent(tenantId)}:${encodeURIComponent(themeId)}`;
}

function createPublicationPrefix(tenantId: string, themeId: string): string {
  return `${STORAGE_PREFIX}:publication:${encodeURIComponent(tenantId)}:${encodeURIComponent(themeId)}:`;
}

function createPublicationKey(tenantId: string, themeId: string, version: string): string {
  return `${createPublicationPrefix(tenantId, themeId)}${encodeURIComponent(version)}`;
}

function parseStoredDraft(
  value: string,
  expectedTenantId: string,
  expectedThemeId: string,
): StoredThemeDraft {
  const parsed = parseJson(value);
  if (
    !isRecord(parsed)
    || parsed.schemaVersion !== THEME_DRAFT_SCHEMA_VERSION
    || typeof parsed.tenantId !== "string"
    || parsed.tenantId !== expectedTenantId
    || !Number.isSafeInteger(parsed.revision)
    || (parsed.revision as number) < 1
    || (parsed.revision as number) >= Number.MAX_SAFE_INTEGER
    || typeof parsed.updatedAt !== "string"
    || !isCanonicalTimestamp(parsed.updatedAt)
  ) {
    throw corruptStorageError();
  }

  const content = validateDraftContent(parsed.content, "CORRUPT_STORAGE");
  if (content.themeId !== expectedThemeId) {
    throw corruptStorageError();
  }

  return {
    schemaVersion: THEME_DRAFT_SCHEMA_VERSION,
    tenantId: parsed.tenantId,
    revision: parsed.revision as number,
    updatedAt: parsed.updatedAt,
    content,
  };
}

function parsePublication(
  value: string,
  expectedTenantId: string,
  expectedThemeId: string,
  expectedVersion: string,
): PublishedThemeVersion {
  const parsed = parseJson(value);
  if (
    !isRecord(parsed)
    || parsed.schemaVersion !== THEME_PUBLICATION_SCHEMA_VERSION
    || typeof parsed.tenantId !== "string"
    || parsed.tenantId !== expectedTenantId
    || typeof parsed.themeId !== "string"
    || parsed.themeId !== expectedThemeId
    || typeof parsed.version !== "string"
    || parsed.version !== expectedVersion
    || typeof parsed.publishedAt !== "string"
    || !isCanonicalTimestamp(parsed.publishedAt)
    || !isRecord(parsed.manifest)
    || !Array.isArray(parsed.artifacts)
  ) {
    throw corruptStorageError();
  }

  const bundle = validateArtifactBundle(
    { manifest: parsed.manifest, artifacts: parsed.artifacts },
    "CORRUPT_STORAGE",
  );
  if (
    bundle.manifest.theme.id !== parsed.themeId
    || bundle.manifest.release.version !== parsed.version
    || bundle.manifest.release.createdAt !== parsed.publishedAt
  ) {
    throw corruptStorageError();
  }

  return {
    schemaVersion: THEME_PUBLICATION_SCHEMA_VERSION,
    tenantId: parsed.tenantId,
    themeId: parsed.themeId,
    version: parsed.version,
    publishedAt: parsed.publishedAt,
    manifest: bundle.manifest,
    artifacts: bundle.artifacts,
  };
}

function validateDraftContent(
  value: unknown,
  errorCode: "INVALID_DRAFT" | "CORRUPT_STORAGE",
): ThemeDraftContent {
  const invalid = () => repositoryValidationError(
    errorCode,
    errorCode === "CORRUPT_STORAGE"
      ? "Stored theme data is invalid. Clear the browser-local Theme Author data and try again."
      : "Theme draft data has an invalid structure and cannot be saved.",
  );

  if (
    !isRecord(value)
    || typeof value.themeId !== "string"
    || !THEME_ID_PATTERN.test(value.themeId)
    || typeof value.themeName !== "string"
    || value.themeName.trim().length === 0
    || value.themeName.trim().length > 200
    || !isRecord(value.themeInput)
    || !Array.isArray(value.roles)
    || !Array.isArray(value.regionMappings)
  ) {
    throw invalid();
  }

  const themeInput = value.themeInput;
  const stringFields = [
    "namespace",
    "neutralSeed",
    "surfaceLightSeed",
    "surfaceDarkSeed",
    "primarySeed",
    "primaryDarkSeed",
    "dangerSeed",
    "dangerDarkSeed",
    "warningSeed",
    "warningDarkSeed",
    "successSeed",
    "successDarkSeed",
    "infoSeed",
    "infoDarkSeed",
  ] as const;
  const policyFields = [
    "primarySeedPolicy",
    "dangerSeedPolicy",
    "warningSeedPolicy",
    "successSeedPolicy",
    "infoSeedPolicy",
  ] as const;

  if (
    stringFields.some((field) => typeof themeInput[field] !== "string")
    || policyFields.some((field) =>
      typeof themeInput[field] !== "string"
      || !(SEED_POLICY_NAMES as readonly string[]).includes(themeInput[field] as string)
    )
    || typeof themeInput.textTreatment !== "string"
    || !(TEXT_TREATMENT_STRATEGY_NAMES as readonly string[]).includes(themeInput.textTreatment)
    || typeof themeInput.preset !== "string"
    || !(SURFACE_PRESET_NAMES as readonly string[]).includes(themeInput.preset)
    || typeof themeInput.lightSurfacePreset !== "string"
    || !(SURFACE_PRESET_NAMES as readonly string[]).includes(themeInput.lightSurfacePreset)
    || typeof themeInput.darkSurfacePreset !== "string"
    || !(SURFACE_PRESET_NAMES as readonly string[]).includes(themeInput.darkSurfacePreset)
  ) {
    throw invalid();
  }

  const roles = value.roles.map((role) => {
    if (
      !isRecord(role)
      || typeof role.key !== "string"
      || role.key.length === 0
      || typeof role.id !== "string"
      || typeof role.lightSeed !== "string"
      || typeof role.darkSeed !== "string"
      || typeof role.seedPolicy !== "string"
      || !(SEED_POLICY_NAMES as readonly string[]).includes(role.seedPolicy)
      || typeof role.enabled !== "boolean"
    ) {
      throw invalid();
    }

    return role as AuthoredCustomRole;
  });
  if (new Set(roles.map((role) => role.key)).size !== roles.length) {
    throw invalid();
  }

  const regionMappings = value.regionMappings.map((mapping) => {
    if (
      !isRecord(mapping)
      || typeof mapping.id !== "string"
      || !(THEME_REGION_IDS as readonly string[]).includes(mapping.id)
      || typeof mapping.roleKey !== "string"
      || mapping.roleKey.length === 0
      || typeof mapping.treatment !== "string"
      || !(THEME_REGION_TREATMENTS as readonly string[]).includes(mapping.treatment)
    ) {
      throw invalid();
    }

    return mapping as AuthoredRegionMapping;
  });
  if (
    regionMappings.length !== THEME_REGION_IDS.length
    || new Set(regionMappings.map((mapping) => mapping.id)).size !== THEME_REGION_IDS.length
  ) {
    throw invalid();
  }

  return {
    themeId: value.themeId,
    themeName: value.themeName,
    themeInput: themeInput as AuthoredThemeInput,
    roles,
    regionMappings,
  };
}

function validateArtifactBundle(
  value: unknown,
  errorCode: "INVALID_PUBLICATION" | "CORRUPT_STORAGE",
): ThemeArtifactBundle {
  const invalid = () => repositoryValidationError(
    errorCode,
    errorCode === "CORRUPT_STORAGE"
      ? "Stored theme data is invalid. Clear the browser-local Theme Author data and try again."
      : "Theme publication data does not match its canonical manifest and artifacts.",
  );

  if (!isRecord(value) || !isRecord(value.manifest) || !Array.isArray(value.artifacts)) {
    throw invalid();
  }

  try {
    const manifest = value.manifest;
    const composition = createThemeComposition(manifest.theme);
    const expected = createThemeArtifactBundle(composition, manifest.release);

    if (
      JSON.stringify(value.manifest) !== JSON.stringify(expected.manifest)
      || JSON.stringify(value.artifacts) !== JSON.stringify(expected.artifacts)
    ) {
      throw invalid();
    }

    if ("composition" in value && JSON.stringify(value.composition) !== JSON.stringify(expected.composition)) {
      throw invalid();
    }

    return expected;
  } catch (error) {
    if (error instanceof ThemeRepositoryError) {
      throw error;
    }
    throw invalid();
  }
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw corruptStorageError();
  }
}

function corruptStorageError(): ThemeRepositoryError {
  return new ThemeRepositoryError(
    "CORRUPT_STORAGE",
    "Stored theme data is invalid. Clear the browser-local Theme Author data and try again.",
  );
}

function repositoryValidationError(
  code: "INVALID_DRAFT" | "INVALID_PUBLICATION" | "CORRUPT_STORAGE",
  message: string,
): ThemeRepositoryError {
  return new ThemeRepositoryError(code, message);
}

function isCanonicalTimestamp(value: string): boolean {
  const parsed = new Date(value);

  return Number.isFinite(parsed.valueOf()) && parsed.toISOString() === value;
}

function toCanonicalTimestamp(value: Date): string {
  if (!Number.isFinite(value.valueOf())) {
    throw new Error("Theme repository clock returned an invalid date.");
  }

  return value.toISOString();
}

function cloneJson<Value>(value: Value): Value {
  return JSON.parse(JSON.stringify(value)) as Value;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
