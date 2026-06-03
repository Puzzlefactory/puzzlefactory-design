import { ColorEngineValidationError } from "./errors.js";
import type {
  PrimitiveColorToken,
  PrimitiveTokenName,
  RampTone,
  SemanticMappingOverrides,
  SemanticThemeKey,
  SemanticTokenName,
  StatusSemanticTokenName,
  StatusName,
  Step,
} from "./index.js";

export type SemanticMappingRecord = Readonly<Record<SemanticTokenName, PrimitiveTokenName>>;

export type SemanticThemeMappings = Readonly<Record<SemanticThemeKey, SemanticMappingRecord>>;

export interface ResolveSemanticMappingsOptions {
  readonly primitiveNames: Iterable<PrimitiveTokenName>;
  readonly overrides?: SemanticMappingOverrides;
}

interface StatusMappingConfig {
  readonly bg: `${RampTone}-${Step}`;
  readonly text: PrimitiveTokenName;
  readonly container: `${RampTone}-${Step}`;
  readonly onContainer: `${RampTone}-${Step}`;
  readonly border: `${RampTone}-${Step}`;
}

export const SEMANTIC_TOKEN_NAMES = [
  "surface-base",
  "surface-raised",
  "surface-overlay",
  "surface-tinted",
  "text-primary",
  "text-secondary",
  "text-disabled",
  "interactive-bg-rest",
  "interactive-bg-hover",
  "interactive-bg-active",
  "interactive-bg-disabled",
  "interactive-text",
  "interactive-border",
  "focus-ring",
  "border-strong",
  "border-subtle",
  "status-danger-bg",
  "status-danger-text",
  "status-danger-container",
  "status-danger-on-container",
  "status-danger-border",
  "status-warning-bg",
  "status-warning-text",
  "status-warning-container",
  "status-warning-on-container",
  "status-warning-border",
  "status-success-bg",
  "status-success-text",
  "status-success-container",
  "status-success-on-container",
  "status-success-border",
  "status-info-bg",
  "status-info-text",
  "status-info-container",
  "status-info-on-container",
  "status-info-border",
] as const satisfies readonly SemanticTokenName[];

const STATUS_NAMES = ["danger", "warning", "success", "info"] as const satisfies readonly StatusName[];

export const REFERENCE_SEMANTIC_MAPPINGS: SemanticThemeMappings = {
  light: {
    "surface-base": "neutral-l-2",
    "surface-raised": "neutral-l-1",
    "surface-overlay": "neutral-l-2",
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
    ...createStatusMappings({
      bg: "d-4",
      text: "neutral-l-1",
      container: "l-2",
      onContainer: "d-9",
      border: "d-5",
    }),
  },
  dark: {
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
    ...createStatusMappings({
      bg: "l-9",
      text: "neutral-d-12",
      container: "d-10",
      onContainer: "l-3",
      border: "l-8",
    }),
  },
  highContrast: {
    "surface-base": "neutral-l-2",
    "surface-raised": "neutral-l-1",
    "surface-overlay": "neutral-l-2",
    "surface-tinted": "neutral-l-2",
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
    ...createStatusMappings({
      bg: "d-3",
      text: "neutral-l-1",
      container: "l-2",
      onContainer: "d-11",
      border: "d-6",
    }),
  },
  highContrastDark: {
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
    ...createStatusMappings({
      bg: "l-10",
      text: "neutral-d-12",
      container: "d-10",
      onContainer: "l-2",
      border: "l-7",
    }),
  },
};

export function getReferenceSemanticMappings(): SemanticThemeMappings {
  return REFERENCE_SEMANTIC_MAPPINGS;
}

export function primitiveNamesFromTokens(
  tokens: readonly PrimitiveColorToken[],
): readonly PrimitiveTokenName[] {
  return tokens.map((token) => token.name);
}

export function resolveSemanticMappings(
  options: ResolveSemanticMappingsOptions,
): SemanticThemeMappings {
  const primitiveNames = new Set(options.primitiveNames);

  return {
    light: applySemanticMappingOverrides(REFERENCE_SEMANTIC_MAPPINGS.light, options.overrides, primitiveNames),
    dark: applySemanticMappingOverrides(REFERENCE_SEMANTIC_MAPPINGS.dark, options.overrides, primitiveNames),
    highContrast: applySemanticMappingOverrides(
      REFERENCE_SEMANTIC_MAPPINGS.highContrast,
      options.overrides,
      primitiveNames,
    ),
    highContrastDark: applySemanticMappingOverrides(
      REFERENCE_SEMANTIC_MAPPINGS.highContrastDark,
      options.overrides,
      primitiveNames,
    ),
  };
}

export function applySemanticMappingOverrides(
  mapping: SemanticMappingRecord,
  overrides: SemanticMappingOverrides | undefined,
  primitiveNames: ReadonlySet<PrimitiveTokenName>,
): SemanticMappingRecord {
  if (overrides === undefined) {
    return mapping;
  }

  for (const [semanticName, primitiveName] of Object.entries(overrides)) {
    if (!isSemanticTokenName(semanticName) || !isPrimitiveTokenName(primitiveName)) {
      throw invalidOverride(semanticName, primitiveName);
    }

    if (!primitiveNames.has(primitiveName)) {
      throw invalidOverride(semanticName, primitiveName);
    }
  }

  return {
    ...mapping,
    ...overrides,
  };
}

export function isSemanticTokenName(value: string): value is SemanticTokenName {
  return (SEMANTIC_TOKEN_NAMES as readonly string[]).includes(value);
}

function createStatusMappings(
  config: StatusMappingConfig,
): Readonly<Record<StatusSemanticTokenName, PrimitiveTokenName>> {
  const entries: [StatusSemanticTokenName, PrimitiveTokenName][] = [];

  for (const statusName of STATUS_NAMES) {
    const slot = `status-${statusName}` as const;
    entries.push(
      [`${slot}-bg`, `${slot}-${config.bg}`],
      [`${slot}-text`, config.text],
      [`${slot}-container`, `${slot}-${config.container}`],
      [`${slot}-on-container`, `${slot}-${config.onContainer}`],
      [`${slot}-border`, `${slot}-${config.border}`],
    );
  }

  return Object.fromEntries(entries) as Record<StatusSemanticTokenName, PrimitiveTokenName>;
}

function isPrimitiveTokenName(value: unknown): value is PrimitiveTokenName {
  return typeof value === "string" && PRIMITIVE_TOKEN_PATTERN.test(value);
}

function invalidOverride(
  semanticName: string,
  primitiveName: unknown,
): ColorEngineValidationError {
  return new ColorEngineValidationError({
    code: "INVALID_OVERRIDE_REFERENCE",
    field: `overrides.semanticMapping.${semanticName}`,
    value: primitiveName,
    message: "Semantic mapping overrides must reference known semantic tokens and generated primitives.",
  });
}

const PRIMITIVE_TOKEN_PATTERN =
  /^(?:palette-a|palette-b|palette-c|palette-a-mid|palette-a-subtle|neutral|status-danger|status-warning|status-success|status-info)-[ld]-(?:[1-9]|1[0-2])$/;
