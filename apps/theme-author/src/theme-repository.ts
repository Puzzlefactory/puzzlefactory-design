import type { ThemeArtifactBundle, ThemeManifest } from "@puzzlefactory/themes";
import type {
  AuthoredCustomRole,
  AuthoredRegionMapping,
  AuthoredThemeInput,
} from "./authoring-model";

export const THEME_DRAFT_SCHEMA_VERSION = 1 as const;

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
  readonly tenantId: string;
  readonly themeId: string;
  readonly version: string;
  readonly publishedAt: string;
  readonly manifest: ThemeManifest;
  readonly bundle: ThemeArtifactBundle;
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
      const value = storage.getItem(createDraftKey(tenantId, themeId));

      return value === null ? null : parseStoredDraft(value);
    },

    async saveDraft(request) {
      validateTenantId(request.tenantId);
      const key = createDraftKey(request.tenantId, request.content.themeId);
      const existingValue = storage.getItem(key);
      const existing = existingValue === null ? null : parseStoredDraft(existingValue);
      const currentRevision = existing?.revision ?? null;

      if (currentRevision !== request.expectedRevision) {
        throw new ThemeRepositoryError(
          "DRAFT_CONFLICT",
          `Draft revision changed from ${request.expectedRevision ?? "new"} to ${currentRevision ?? "missing"}. Reload before saving again.`,
        );
      }

      const saved = {
        schemaVersion: THEME_DRAFT_SCHEMA_VERSION,
        tenantId: request.tenantId,
        revision: (existing?.revision ?? 0) + 1,
        updatedAt: toCanonicalTimestamp(now()),
        content: request.content,
      } satisfies StoredThemeDraft;

      storage.setItem(key, JSON.stringify(saved));
      return cloneJson(saved);
    },

    async publishTheme(request) {
      validateTenantId(request.tenantId);
      const { manifest } = request.bundle;
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
        tenantId: request.tenantId,
        themeId,
        version,
        publishedAt: manifest.release.createdAt,
        manifest,
        bundle: request.bundle,
      } satisfies PublishedThemeVersion;

      storage.setItem(key, JSON.stringify(publication));
      return cloneJson(publication);
    },

    async listPublications(tenantId, themeId) {
      validateTenantId(tenantId);
      const prefix = createPublicationPrefix(tenantId, themeId);
      const publications: PublishedThemeVersion[] = [];

      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(prefix)) {
          const value = storage.getItem(key);
          if (value !== null) {
            publications.push(parsePublication(value));
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

function createDraftKey(tenantId: string, themeId: string): string {
  return `${STORAGE_PREFIX}:draft:${encodeURIComponent(tenantId)}:${encodeURIComponent(themeId)}`;
}

function createPublicationPrefix(tenantId: string, themeId: string): string {
  return `${STORAGE_PREFIX}:publication:${encodeURIComponent(tenantId)}:${encodeURIComponent(themeId)}:`;
}

function createPublicationKey(tenantId: string, themeId: string, version: string): string {
  return `${createPublicationPrefix(tenantId, themeId)}${encodeURIComponent(version)}`;
}

function parseStoredDraft(value: string): StoredThemeDraft {
  const parsed = parseJson(value);
  if (
    !isRecord(parsed)
    || parsed.schemaVersion !== THEME_DRAFT_SCHEMA_VERSION
    || typeof parsed.tenantId !== "string"
    || !Number.isInteger(parsed.revision)
    || typeof parsed.updatedAt !== "string"
    || !isRecord(parsed.content)
  ) {
    throw corruptStorageError();
  }

  return parsed as StoredThemeDraft;
}

function parsePublication(value: string): PublishedThemeVersion {
  const parsed = parseJson(value);
  if (
    !isRecord(parsed)
    || typeof parsed.tenantId !== "string"
    || typeof parsed.themeId !== "string"
    || typeof parsed.version !== "string"
    || typeof parsed.publishedAt !== "string"
    || !isRecord(parsed.manifest)
    || !isRecord(parsed.bundle)
  ) {
    throw corruptStorageError();
  }

  return parsed as PublishedThemeVersion;
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
