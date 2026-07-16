import {
  COLOR_ENGINE_CONTRACT_VERSION,
  CUSTOM_COLOR_ROLE_ID_PATTERN,
  createColorEngineTheme,
  type ColorEngineInput,
  type ResolvedColorEngineInput,
} from "@puzzlefactory/color-engine";

export const THEME_SCHEMA_VERSION = 1 as const;
export const THEME_COLOR_ENGINE_CONTRACT_VERSION = COLOR_ENGINE_CONTRACT_VERSION;
export const THEME_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const THEME_REGION_IDS = ["header", "sidebar", "footer"] as const;
export const THEME_REGION_TREATMENTS = ["soft", "solid"] as const;

export type ThemeSchemaVersion = typeof THEME_SCHEMA_VERSION;
export type ThemeRegionId = (typeof THEME_REGION_IDS)[number];
export type ThemeRegionTreatment = (typeof THEME_REGION_TREATMENTS)[number];

export type ThemeRegionMapping = {
  readonly roleId: string;
  readonly treatment: ThemeRegionTreatment;
};

export type ThemeRegionMappings = Readonly<
  Record<ThemeRegionId, ThemeRegionMapping>
>;

export type ThemeSourceInput = {
  readonly schemaVersion: ThemeSchemaVersion;
  readonly id: string;
  readonly name: string;
  readonly color: ColorEngineInput;
  readonly regions: ThemeRegionMappings;
};

export type NormalizedThemeSource = {
  readonly schemaVersion: ThemeSchemaVersion;
  readonly id: string;
  readonly name: string;
  readonly color: ResolvedColorEngineInput;
  readonly regions: ThemeRegionMappings;
};

export type ThemeValidationErrorCode =
  | "INVALID_THEME_SOURCE"
  | "INVALID_THEME_SCHEMA_VERSION"
  | "INVALID_THEME_ID"
  | "INVALID_THEME_NAME"
  | "INVALID_REGION_MAPPING"
  | "UNKNOWN_REGION_ROLE";

export class ThemeValidationError extends Error {
  readonly code: ThemeValidationErrorCode;
  readonly field: string;
  readonly value: unknown;

  constructor(options: {
    readonly code: ThemeValidationErrorCode;
    readonly field: string;
    readonly value: unknown;
    readonly message: string;
  }) {
    super(options.message);
    this.name = "ThemeValidationError";
    this.code = options.code;
    this.field = options.field;
    this.value = options.value;
  }
}

export function normalizeThemeSource(
  input: ThemeSourceInput | unknown,
): NormalizedThemeSource {
  if (!isRecord(input)) {
    throw new ThemeValidationError({
      code: "INVALID_THEME_SOURCE",
      field: "$",
      value: input,
      message: "Theme source must be an object.",
    });
  }

  const identity = validateThemeIdentity(input);
  if (!isRecord(input.color)) {
    throw new ThemeValidationError({
      code: "INVALID_THEME_SOURCE",
      field: "color",
      value: input.color,
      message: "Theme color input must be an object.",
    });
  }
  const colorInput = input.color;
  if (!isRecord(input.regions)) {
    throw new ThemeValidationError({
      code: "INVALID_THEME_SOURCE",
      field: "regions",
      value: input.regions,
      message: "Theme regions must be an object.",
    });
  }
  const regionInput = input.regions;

  const colorOutput = createColorEngineTheme(colorInput as ColorEngineInput);
  const customRoleIds = new Set(Object.keys(colorOutput.input.customRoles));
  const regions = Object.fromEntries(
    THEME_REGION_IDS.map((regionId) => {
      const mapping = regionInput[regionId];
      validateRegionMapping(regionId, mapping, customRoleIds);

      return [
        regionId,
        {
          roleId: mapping.roleId,
          treatment: mapping.treatment,
        },
      ];
    }),
  ) as ThemeRegionMappings;

  return {
    schemaVersion: THEME_SCHEMA_VERSION,
    id: identity.id,
    name: identity.name,
    color: colorOutput.input,
    regions,
  };
}

function validateThemeIdentity(input: Readonly<Record<string, unknown>>): {
  readonly id: string;
  readonly name: string;
} {
  if (input.schemaVersion !== THEME_SCHEMA_VERSION) {
    throw new ThemeValidationError({
      code: "INVALID_THEME_SCHEMA_VERSION",
      field: "schemaVersion",
      value: input.schemaVersion,
      message: `Theme schema version must be ${THEME_SCHEMA_VERSION}.`,
    });
  }

  const id = typeof input.id === "string" ? input.id.trim() : "";
  if (!id || !THEME_ID_PATTERN.test(id)) {
    throw new ThemeValidationError({
      code: "INVALID_THEME_ID",
      field: "id",
      value: input.id,
      message: "Theme ID must use lowercase kebab-case beginning with a letter.",
    });
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || name.length > 200) {
    throw new ThemeValidationError({
      code: "INVALID_THEME_NAME",
      field: "name",
      value: input.name,
      message: "Theme name must contain between 1 and 200 characters.",
    });
  }

  return { id, name };
}

function validateRegionMapping(
  regionId: ThemeRegionId,
  mapping: unknown,
  customRoleIds: ReadonlySet<string>,
): asserts mapping is ThemeRegionMapping {
  if (
    !isRecord(mapping)
    || typeof mapping.roleId !== "string"
    || !CUSTOM_COLOR_ROLE_ID_PATTERN.test(mapping.roleId)
    || (mapping.treatment !== "soft" && mapping.treatment !== "solid")
  ) {
    throw new ThemeValidationError({
      code: "INVALID_REGION_MAPPING",
      field: `regions.${regionId}`,
      value: mapping,
      message: `${toRegionLabel(regionId)} must select a custom role and a supported treatment.`,
    });
  }

  if (!customRoleIds.has(mapping.roleId)) {
    throw new ThemeValidationError({
      code: "UNKNOWN_REGION_ROLE",
      field: `regions.${regionId}.roleId`,
      value: mapping.roleId,
      message: `${toRegionLabel(regionId)} references custom role ${mapping.roleId}, which is not present in normalized color input.`,
    });
  }
}

function toRegionLabel(regionId: ThemeRegionId): string {
  return `${regionId.charAt(0).toUpperCase()}${regionId.slice(1)}`;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
