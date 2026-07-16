import {
  CUSTOM_COLOR_ROLE_ID_PATTERN,
  RESERVED_CUSTOM_COLOR_ROLE_IDS,
  type ColorEngineInput,
  type ColorEngineThemePresetInput,
  type SeedPolicy,
} from "@puzzlefactory/color-engine";
import type {
  ThemeRegionId,
  ThemeRegionMappings,
  ThemeRegionTreatment,
} from "@puzzlefactory/themes";

export type AuthoredCustomRole = {
  readonly key: string;
  readonly id: string;
  readonly lightSeed: string;
  readonly darkSeed: string;
  readonly seedPolicy: SeedPolicy;
  readonly enabled: boolean;
};

export type AuthoredThemeInput = ColorEngineThemePresetInput & {
  readonly namespace: string;
};

export type RegionId = ThemeRegionId;
export type RegionTreatment = ThemeRegionTreatment;

export type AuthoredRegionMapping = {
  readonly id: RegionId;
  readonly roleKey: string;
  readonly treatment: RegionTreatment;
};

export type AuthoredRoleIdError = {
  readonly roleKey: string;
  readonly message: string;
};

export const INITIAL_AUTHORED_ROLES = [
  {
    key: "institution",
    id: "institution",
    lightSeed: "oklch(0.42 0.13 255)",
    darkSeed: "oklch(0.66 0.1 255)",
    seedPolicy: "balanced",
    enabled: true,
  },
  {
    key: "navigation",
    id: "navigation",
    lightSeed: "oklch(0.5 0.09 178)",
    darkSeed: "oklch(0.7 0.08 178)",
    seedPolicy: "balanced",
    enabled: true,
  },
  {
    key: "footer",
    id: "footer",
    lightSeed: "oklch(0.28 0.05 250)",
    darkSeed: "oklch(0.62 0.06 250)",
    seedPolicy: "balanced",
    enabled: true,
  },
] as const satisfies readonly AuthoredCustomRole[];

export const INITIAL_REGION_MAPPINGS = [
  { id: "header", roleKey: "institution", treatment: "solid" },
  { id: "sidebar", roleKey: "navigation", treatment: "soft" },
  { id: "footer", roleKey: "footer", treatment: "solid" },
] as const satisfies readonly AuthoredRegionMapping[];

export function validateAuthoredRoleIds(
  roles: readonly AuthoredCustomRole[],
): readonly AuthoredRoleIdError[] {
  const enabledIdCounts = new Map<string, number>();

  for (const role of roles) {
    if (role.enabled) {
      enabledIdCounts.set(role.id, (enabledIdCounts.get(role.id) ?? 0) + 1);
    }
  }

  return roles.flatMap((role) => {
    if (!role.enabled) {
      return [];
    }

    if (!CUSTOM_COLOR_ROLE_ID_PATTERN.test(role.id)) {
      return [{
        roleKey: role.key,
        message: "Use lowercase kebab-case beginning with a letter.",
      }];
    }

    if ((RESERVED_CUSTOM_COLOR_ROLE_IDS as readonly string[]).includes(role.id)) {
      return [{
        roleKey: role.key,
        message: "This ID is reserved by a built-in role or core namespace.",
      }];
    }

    if ((enabledIdCounts.get(role.id) ?? 0) > 1) {
      return [{
        roleKey: role.key,
        message: "Enabled custom role IDs must be unique.",
      }];
    }

    return [];
  });
}

export function createNormalizedCustomRoles(
  roles: readonly AuthoredCustomRole[],
): NonNullable<ColorEngineInput["customRoles"]> {
  return Object.fromEntries(
    roles
      .filter((role) => role.enabled)
      .map((role) => [
        role.id,
        {
          seed: role.lightSeed,
          ...(role.darkSeed.trim() === "" ? {} : { darkSeed: role.darkSeed }),
          seedPolicy: role.seedPolicy,
        },
      ]),
  );
}

export function getNextAuthoredRoleNumber(
  roles: readonly AuthoredCustomRole[],
  preferredNumber = 1,
): number {
  const usedNumbers = roles.flatMap((role) => {
    const values = [role.key.match(/^role-(\d+)$/)?.[1], role.id.match(/^custom-role-(\d+)$/)?.[1]];

    return values.flatMap((value) => {
      if (value === undefined) {
        return [];
      }

      const roleNumber = Number(value);
      return Number.isSafeInteger(roleNumber) && roleNumber > 0 ? [roleNumber] : [];
    });
  });

  const highestUsedNumber = usedNumbers.reduce(
    (highest, roleNumber) => Math.max(highest, roleNumber),
    0,
  );
  const highestSequentialCandidate = Math.max(
    roles.length + 1,
    highestUsedNumber + 1,
    preferredNumber,
  );
  if (
    Number.isSafeInteger(highestSequentialCandidate)
    && highestSequentialCandidate > 0
    && highestSequentialCandidate < Number.MAX_SAFE_INTEGER
  ) {
    return highestSequentialCandidate;
  }

  const usedNumberSet = new Set(usedNumbers);
  let availableNumber = Number.isSafeInteger(preferredNumber)
    && preferredNumber > 0
    && preferredNumber < Number.MAX_SAFE_INTEGER
    ? preferredNumber
    : 1;
  while (usedNumberSet.has(availableNumber)) {
    availableNumber += 1;
  }

  return availableNumber;
}

export function normalizeRegionMappings(
  mappings: readonly AuthoredRegionMapping[],
  roles: readonly AuthoredCustomRole[],
): ThemeRegionMappings | null {
  const rolesByKey = new Map(roles.map((role) => [role.key, role]));
  const mappingsById = new Map(mappings.map((mapping) => [mapping.id, mapping]));
  const normalized = {} as Record<RegionId, ThemeRegionMappings[RegionId]>;

  for (const regionId of ["header", "sidebar", "footer"] as const) {
    const mapping = mappingsById.get(regionId);
    if (!mapping) {
      return null;
    }
    const role = rolesByKey.get(mapping.roleKey);
    if (!role?.enabled) {
      return null;
    }

    normalized[regionId] = {
      roleId: role.id,
      treatment: mapping.treatment,
    };
  }

  return normalized;
}

export function getEngineFieldRoleKey(
  field: string | undefined,
  roles: readonly AuthoredCustomRole[],
): string | undefined {
  if (!field?.startsWith("customRoles.")) {
    return undefined;
  }

  const remainder = field.slice("customRoles.".length);

  return roles.find((role) =>
    remainder === role.id || remainder.startsWith(`${role.id}.`)
  )?.key;
}

export function isAuthoringStateModified(
  roles: readonly AuthoredCustomRole[],
  mappings: readonly AuthoredRegionMapping[],
): boolean {
  return JSON.stringify(roles) !== JSON.stringify(INITIAL_AUTHORED_ROLES)
    || JSON.stringify(mappings) !== JSON.stringify(INITIAL_REGION_MAPPINGS);
}
