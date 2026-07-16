import {
  APCA_ALGORITHM_VERSION,
  COLOR_ENGINE_CONTRACT_VERSION,
  COLOR_ENGINE_THEME_NAMES,
  createColorEngineCssArtifacts,
  type ColorEngineCssFileKind,
  type SurfaceTheme,
} from "@puzzlefactory/color-engine";
import type { ContrastAssertionSummary } from "@puzzlefactory/color-engine";
import type { NormalizedThemeSource, ThemeComposition } from "./index.js";

export const THEME_MANIFEST_SCHEMA_VERSION = 1 as const;
export const THEME_ATTRIBUTE = "data-theme-v2" as const;

export type ThemeManifestSchemaVersion = typeof THEME_MANIFEST_SCHEMA_VERSION;
export type ThemeArtifactContentHash = `fnv1a32-${string}`;
export type ThemeArtifactFileName =
  | "primitives.css"
  | "theme-light.css"
  | "theme-dark.css"
  | "theme-high-contrast.css"
  | "theme-high-contrast-dark.css"
  | "bundle.css"
  | "manifest.json";
export type ThemeArtifactKind = ColorEngineCssFileKind | "bundle" | "manifest";

export type ThemeReleaseMetadata = {
  readonly version: string;
  readonly createdAt: string;
  readonly createdBy?: string;
};

export type ThemeArtifactFile = {
  readonly fileName: ThemeArtifactFileName;
  readonly kind: ThemeArtifactKind;
  readonly theme?: SurfaceTheme;
  readonly contentType: "text/css" | "application/json";
  readonly content: string;
  readonly byteLength: number;
  readonly contentHash: ThemeArtifactContentHash;
};

export type ThemeManifestFile = Omit<ThemeArtifactFile, "content">;

export type ThemeManifest = {
  readonly schemaVersion: ThemeManifestSchemaVersion;
  readonly generator: {
    readonly package: "@puzzlefactory/themes";
    readonly themeSchemaVersion: number;
    readonly colorEngine: {
      readonly package: "@puzzlefactory/color-engine";
      readonly contractVersion: typeof COLOR_ENGINE_CONTRACT_VERSION;
    };
  };
  readonly release: ThemeReleaseMetadata;
  readonly theme: NormalizedThemeSource;
  readonly themeAttribute: typeof THEME_ATTRIBUTE;
  readonly themes: readonly SurfaceTheme[];
  readonly loadOrder: readonly ThemeArtifactFileName[];
  readonly files: readonly ThemeManifestFile[];
  readonly diagnostics: {
    readonly apcaAlgorithmVersion: typeof APCA_ALGORITHM_VERSION;
    readonly color: ContrastAssertionSummary;
    readonly regions: {
      readonly total: number;
      readonly passed: number;
      readonly failed: number;
    };
  };
};

export type ThemeArtifactBundle = {
  readonly composition: ThemeComposition;
  readonly manifest: ThemeManifest;
  readonly artifacts: readonly ThemeArtifactFile[];
};

export type ThemeArtifactValidationErrorCode = "INVALID_RELEASE_METADATA";

export class ThemeArtifactValidationError extends Error {
  readonly code: ThemeArtifactValidationErrorCode;
  readonly field: string;
  readonly value: unknown;

  constructor(options: {
    readonly field: string;
    readonly value: unknown;
    readonly message: string;
  }) {
    super(options.message);
    this.name = "ThemeArtifactValidationError";
    this.code = "INVALID_RELEASE_METADATA";
    this.field = options.field;
    this.value = options.value;
  }
}

export function createThemeManifest(
  composition: ThemeComposition,
  release: ThemeReleaseMetadata | unknown,
): ThemeManifest {
  const normalizedRelease = normalizeReleaseMetadata(release);
  const files = createPublishedCssArtifacts(composition);
  const regionPassed = composition.regionDiagnostics.filter((result) => result.passed).length;

  return {
    schemaVersion: THEME_MANIFEST_SCHEMA_VERSION,
    generator: {
      package: "@puzzlefactory/themes",
      themeSchemaVersion: composition.source.schemaVersion,
      colorEngine: {
        package: "@puzzlefactory/color-engine",
        contractVersion: COLOR_ENGINE_CONTRACT_VERSION,
      },
    },
    release: normalizedRelease,
    theme: composition.source,
    themeAttribute: THEME_ATTRIBUTE,
    themes: COLOR_ENGINE_THEME_NAMES,
    loadOrder: files
      .filter((file) => file.kind !== "bundle")
      .map((file) => file.fileName),
    files: files.map(({ content: _content, ...file }) => file),
    diagnostics: {
      apcaAlgorithmVersion: APCA_ALGORITHM_VERSION,
      color: composition.colorOutput.assertions.summary,
      regions: {
        total: composition.regionDiagnostics.length,
        passed: regionPassed,
        failed: composition.regionDiagnostics.length - regionPassed,
      },
    },
  };
}

export function createThemeArtifactBundle(
  composition: ThemeComposition,
  release: ThemeReleaseMetadata | unknown,
): ThemeArtifactBundle {
  const manifest = createThemeManifest(composition, release);
  const publishedCss = createPublishedCssArtifacts(composition);
  const manifestContent = JSON.stringify(manifest, null, 2);
  const manifestArtifact = createArtifact({
    fileName: "manifest.json",
    kind: "manifest",
    contentType: "application/json",
    content: manifestContent,
  });

  return {
    composition,
    manifest,
    artifacts: [...publishedCss, manifestArtifact],
  };
}

function createPublishedCssArtifacts(
  composition: ThemeComposition,
): readonly ThemeArtifactFile[] {
  const cssArtifacts = createColorEngineCssArtifacts(composition.colorOutput).map((artifact) => ({
    fileName: artifact.fileName,
    kind: artifact.kind,
    ...(artifact.theme ? { theme: artifact.theme } : {}),
    contentType: "text/css" as const,
    content: artifact.css,
    byteLength: artifact.byteLength,
    contentHash: artifact.contentHash,
  }));
  const bundle = createArtifact({
    fileName: "bundle.css",
    kind: "bundle",
    contentType: "text/css",
    content: composition.colorOutput.cssOutput.all,
  });

  return [...cssArtifacts, bundle];
}

function createArtifact(input: {
  readonly fileName: ThemeArtifactFileName;
  readonly kind: ThemeArtifactKind;
  readonly contentType: ThemeArtifactFile["contentType"];
  readonly content: string;
}): ThemeArtifactFile {
  const bytes = new TextEncoder().encode(input.content);
  let hash = 0x811c9dc5;

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return {
    ...input,
    byteLength: bytes.byteLength,
    contentHash: `fnv1a32-${hash.toString(16).padStart(8, "0")}`,
  };
}

function normalizeReleaseMetadata(release: ThemeReleaseMetadata | unknown): ThemeReleaseMetadata {
  if (!isRecord(release)) {
    throw new ThemeArtifactValidationError({
      field: "release",
      value: release,
      message: "Theme release metadata must be an object.",
    });
  }

  const version = typeof release.version === "string" ? release.version.trim() : "";
  if (!version || version.length > 100 || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(version)) {
    throw new ThemeArtifactValidationError({
      field: "release.version",
      value: release.version,
      message: "Theme release version must contain 1 to 100 letters, digits, dots, underscores, or hyphens.",
    });
  }

  const createdAt = typeof release.createdAt === "string" ? release.createdAt.trim() : "";
  const parsedCreatedAt = new Date(createdAt);
  if (
    !createdAt
    || !Number.isFinite(parsedCreatedAt.valueOf())
    || parsedCreatedAt.toISOString() !== createdAt
  ) {
    throw new ThemeArtifactValidationError({
      field: "release.createdAt",
      value: release.createdAt,
      message: "Theme release createdAt must be a canonical UTC ISO timestamp.",
    });
  }

  const createdBy = typeof release.createdBy === "string" ? release.createdBy.trim() : undefined;
  if (
    release.createdBy !== undefined
    && (createdBy === undefined || createdBy.length === 0 || createdBy.length > 200)
  ) {
    throw new ThemeArtifactValidationError({
      field: "release.createdBy",
      value: release.createdBy,
      message: "Theme release createdBy must contain between 1 and 200 characters when provided.",
    });
  }

  return {
    version,
    createdAt,
    ...(createdBy ? { createdBy } : {}),
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
