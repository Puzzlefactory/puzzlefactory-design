import { calculateApcaLcFromOklch } from "./apca.js";
import type {
  AssertionFailureType,
  AssertionPolarity,
  AssertionResult,
  AssertionSource,
  AssertionStatus,
  PrimitiveColorToken,
  PrimitiveTokenName,
  SemanticMappingOverrides,
  SemanticThemeKey,
  SemanticTokenName,
  StatusName,
} from "./index.js";
import type { SemanticThemeMappings } from "./semantic.js";

export type ContrastAssertionKind =
  | "text-on-surface"
  | "interactive-text"
  | "interactive-border"
  | "status-text"
  | "status-container"
  | "status-border";

export type ExpectedContrastPolarity = "positive" | "negative";

export interface ContrastAssertionRule {
  readonly kind: ContrastAssertionKind;
  readonly tokenA: SemanticTokenName;
  readonly tokenB: SemanticTokenName;
  readonly standardLc: number;
  readonly highContrastLc: number;
  readonly polarityByTheme: Readonly<Record<SemanticThemeKey, ExpectedContrastPolarity>>;
  readonly warningFloorLc?: number;
}

export interface RunContrastAssertionsOptions {
  readonly primitives: readonly PrimitiveColorToken[];
  readonly mappings: SemanticThemeMappings;
  readonly overrides?: SemanticMappingOverrides;
}

export function runContrastAssertions(
  options: RunContrastAssertionsOptions,
): readonly AssertionResult[] {
  const primitivesByName = new Map(options.primitives.map((token) => [token.name, token]));

  return THEME_KEYS.flatMap((theme) =>
    CONTRAST_ASSERTION_RULES.map((rule) =>
      evaluateContrastAssertion({
        theme,
        rule,
        mappings: options.mappings,
        primitivesByName,
        overrides: options.overrides,
      }),
    ),
  );
}

export function isHighContrastTheme(theme: SemanticThemeKey): boolean {
  return theme === "highContrast" || theme === "highContrastDark";
}

function evaluateContrastAssertion(options: {
  readonly theme: SemanticThemeKey;
  readonly rule: ContrastAssertionRule;
  readonly mappings: SemanticThemeMappings;
  readonly primitivesByName: ReadonlyMap<PrimitiveTokenName, PrimitiveColorToken>;
  readonly overrides: SemanticMappingOverrides | undefined;
}): AssertionResult {
  const mapping = options.mappings[options.theme];
  const primitiveAName = mapping[options.rule.tokenA];
  const primitiveBName = mapping[options.rule.tokenB];
  const primitiveA = options.primitivesByName.get(primitiveAName);
  const primitiveB = options.primitivesByName.get(primitiveBName);

  if (primitiveA === undefined || primitiveB === undefined) {
    return createAssertionResult({
      theme: options.theme,
      rule: options.rule,
      actualSignedLc: 0,
      polarity: "CORRECT",
      status: "fail",
      failureType: "CONTRAST",
      source: assertionSource(options.rule, options.overrides),
    });
  }

  const actualSignedLc = calculateApcaLcFromOklch(primitiveA.oklch, primitiveB.oklch);
  const polarity = assertionPolarity(actualSignedLc, expectedPolarity(options.theme, options.rule));
  const threshold = requiredLc(options.theme, options.rule);
  const actualLc = Math.abs(actualSignedLc);
  const status = assertionStatus(actualLc, threshold, options.rule.warningFloorLc, polarity);
  const failureType = assertionFailureType(status, polarity);

  return createAssertionResult({
    theme: options.theme,
    rule: options.rule,
    actualSignedLc,
    polarity,
    status,
    ...(failureType === undefined ? {} : { failureType }),
    source: assertionSource(options.rule, options.overrides),
  });
}

function createAssertionResult(options: {
  readonly theme: SemanticThemeKey;
  readonly rule: ContrastAssertionRule;
  readonly actualSignedLc: number;
  readonly polarity: AssertionPolarity;
  readonly status: AssertionStatus;
  readonly failureType?: AssertionFailureType;
  readonly source: AssertionSource;
}): AssertionResult {
  return {
    theme: options.theme,
    tokenA: options.rule.tokenA,
    tokenB: options.rule.tokenB,
    requiredLc: requiredLc(options.theme, options.rule),
    actualLc: roundLc(Math.abs(options.actualSignedLc)),
    polarity: options.polarity,
    status: options.status,
    ...(options.failureType === undefined ? {} : { failureType: options.failureType }),
    source: options.source,
  };
}

function assertionPolarity(
  actualSignedLc: number,
  expected: ExpectedContrastPolarity,
): AssertionPolarity {
  if (actualSignedLc === 0) {
    return "CORRECT";
  }

  return (expected === "positive" && actualSignedLc > 0) ||
    (expected === "negative" && actualSignedLc < 0)
    ? "CORRECT"
    : "WRONG";
}

function assertionStatus(
  actualLc: number,
  required: number,
  warningFloor: number | undefined,
  polarity: AssertionPolarity,
): AssertionStatus {
  if (polarity === "WRONG") {
    return "fail";
  }

  if (actualLc >= required) {
    return "pass";
  }

  if (warningFloor !== undefined && actualLc >= warningFloor) {
    return "warning";
  }

  return "fail";
}

function assertionFailureType(
  status: AssertionStatus,
  polarity: AssertionPolarity,
): AssertionFailureType | undefined {
  if (polarity === "WRONG") {
    return "POLARITY_ERROR";
  }

  return status === "pass" ? undefined : "CONTRAST";
}

function assertionSource(
  rule: ContrastAssertionRule,
  overrides: SemanticMappingOverrides | undefined,
): AssertionSource {
  return overrides !== undefined &&
    (Object.hasOwn(overrides, rule.tokenA) || Object.hasOwn(overrides, rule.tokenB))
    ? "override"
    : "reference";
}

function requiredLc(theme: SemanticThemeKey, rule: ContrastAssertionRule): number {
  return isHighContrastTheme(theme) ? rule.highContrastLc : rule.standardLc;
}

function expectedPolarity(
  theme: SemanticThemeKey,
  rule: ContrastAssertionRule,
): ExpectedContrastPolarity {
  return rule.polarityByTheme[theme];
}

function createTextOnSurfaceRules(): readonly ContrastAssertionRule[] {
  return SURFACE_TOKENS.flatMap((surface) =>
    TEXT_TOKENS.map((text) =>
      createRule({
        kind: "text-on-surface",
        tokenA: text,
        tokenB: surface,
        standardLc: 75,
        highContrastLc: 90,
        polarity: {
          light: "positive",
          dark: "negative",
        },
      }),
    ),
  );
}

function createInteractiveTextRules(): readonly ContrastAssertionRule[] {
  return INTERACTIVE_BACKGROUND_TOKENS.map((background) =>
    createRule({
      kind: "interactive-text",
      tokenA: "interactive-text",
      tokenB: background,
      standardLc: 45,
      highContrastLc: 60,
      polarity: {
        light: "negative",
        dark: "positive",
      },
    }),
  );
}

function createStatusRules(): readonly ContrastAssertionRule[] {
  return STATUS_NAMES.flatMap((statusName) => {
    const base = `status-${statusName}` as const;
    const warningFloor = statusName === "warning" ? 40 : undefined;

    const statusTextRule = createRule({
      kind: "status-text",
      tokenA: `${base}-text`,
      tokenB: `${base}-bg`,
      standardLc: 45,
      highContrastLc: 60,
        polarity: {
          light: "negative",
          dark: "positive",
      },
      ...(warningFloor === undefined ? {} : { warningFloorLc: warningFloor }),
    });

    return [
      statusTextRule,
      createRule({
        kind: "status-container",
        tokenA: `${base}-on-container`,
        tokenB: `${base}-container`,
        standardLc: 60,
        highContrastLc: 75,
        polarity: {
          light: "positive",
          dark: "negative",
        },
      }),
      createRule({
        kind: "status-border",
        tokenA: `${base}-border`,
        tokenB: "surface-base",
        standardLc: 30,
        highContrastLc: 45,
        polarity: {
          light: "positive",
          dark: "negative",
        },
      }),
    ];
  });
}

function createRule(rule: {
  readonly kind: ContrastAssertionKind;
  readonly tokenA: SemanticTokenName;
  readonly tokenB: SemanticTokenName;
  readonly standardLc: number;
  readonly highContrastLc: number;
  readonly polarity: Readonly<Record<"light" | "dark", ExpectedContrastPolarity>>;
  readonly warningFloorLc?: number;
}): ContrastAssertionRule {
  return {
    kind: rule.kind,
    tokenA: rule.tokenA,
    tokenB: rule.tokenB,
    standardLc: rule.standardLc,
    highContrastLc: rule.highContrastLc,
    polarityByTheme: {
      light: rule.polarity.light,
      dark: rule.polarity.dark,
      highContrast: rule.polarity.light,
      highContrastDark: rule.polarity.dark,
    },
    ...(rule.warningFloorLc === undefined ? {} : { warningFloorLc: rule.warningFloorLc }),
  };
}

function roundLc(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

const THEME_KEYS = ["light", "dark", "highContrast", "highContrastDark"] as const;

const SURFACE_TOKENS = [
  "surface-base",
  "surface-raised",
  "surface-overlay",
  "surface-tinted",
] as const satisfies readonly SemanticTokenName[];

const TEXT_TOKENS = ["text-primary", "text-secondary"] as const satisfies readonly SemanticTokenName[];

const INTERACTIVE_BACKGROUND_TOKENS = [
  "interactive-bg-rest",
  "interactive-bg-hover",
  "interactive-bg-active",
] as const satisfies readonly SemanticTokenName[];

const STATUS_NAMES = ["danger", "warning", "success", "info"] as const satisfies readonly StatusName[];

export const CONTRAST_ASSERTION_RULES: readonly ContrastAssertionRule[] = [
  ...createTextOnSurfaceRules(),
  ...createInteractiveTextRules(),
  createRule({
    kind: "interactive-border",
    tokenA: "interactive-border",
    tokenB: "surface-base",
    standardLc: 30,
    highContrastLc: 45,
    polarity: {
      light: "positive",
      dark: "negative",
    },
  }),
  ...createStatusRules(),
];
