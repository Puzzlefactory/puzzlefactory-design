import { APCA_ALGORITHM_VERSION, calculateApcaLcFromOklch } from "./apca.js";
import type {
  ColorEngineThemeSemantics,
  ColorToken,
  CustomColorRoleSemanticTokenName,
  PrimitiveSurfaceOutput,
  ResolvedCustomColorRole,
  SemanticTokenName,
  SurfaceTheme,
} from "./index.js";

export type ContrastAssertionRole =
  | "body"
  | "secondary"
  | "muted"
  | "ui"
  | "status-soft"
  | "status-solid";

export type ContrastAssertionSeverity = "required" | "diagnostic";

export type ContrastAssertionSemanticName = SemanticTokenName | CustomColorRoleSemanticTokenName;

export interface ContrastAssertionPair {
  readonly id: string;
  readonly theme: SurfaceTheme;
  readonly role: ContrastAssertionRole;
  readonly severity: ContrastAssertionSeverity;
  readonly foreground: ContrastAssertionSemanticName;
  readonly background: ContrastAssertionSemanticName;
  readonly threshold: number;
  readonly description: string;
}

export interface ResolvedContrastAssertion extends ContrastAssertionPair {
  readonly lc: number;
  readonly absLc: number;
  readonly passed: boolean;
  readonly foregroundToken: ColorToken;
  readonly backgroundToken: ColorToken;
}

export interface ContrastAssertionSummary {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly requiredFailed: number;
  readonly diagnosticFailed: number;
}

export interface ContrastAssertionReport {
  readonly apcaAlgorithmVersion: typeof APCA_ALGORITHM_VERSION;
  readonly thresholds: Readonly<Record<ContrastAssertionRole, number>>;
  readonly pairs: readonly ContrastAssertionPair[];
  readonly results: readonly ResolvedContrastAssertion[];
  readonly summary: ContrastAssertionSummary;
}

export const CONTRAST_ASSERTION_THRESHOLDS = {
  body: 60,
  secondary: 45,
  muted: 30,
  ui: 45,
  "status-soft": 45,
  "status-solid": 60,
} as const satisfies Readonly<Record<ContrastAssertionRole, number>>;

export function createContrastAssertionReport(options: {
  readonly namespace: string;
  readonly primitives: PrimitiveSurfaceOutput;
  readonly semantics: Readonly<Record<SurfaceTheme, ColorEngineThemeSemantics>>;
  readonly customRoles?: Readonly<Record<string, ResolvedCustomColorRole>>;
}): ContrastAssertionReport {
  const pairs = createContrastAssertionPairs(options.customRoles ?? {});
  const results = pairs.map((pair) => {
    const foregroundToken = resolveSemanticToken({
      namespace: options.namespace,
      primitives: options.primitives,
      semantics: options.semantics,
      theme: pair.theme,
      semanticName: pair.foreground,
    });
    const backgroundToken = resolveSemanticToken({
      namespace: options.namespace,
      primitives: options.primitives,
      semantics: options.semantics,
      theme: pair.theme,
      semanticName: pair.background,
    });
    const lc = calculateApcaLcFromOklch(foregroundToken.oklch, backgroundToken.oklch);
    const absLc = Math.abs(lc);

    return {
      ...pair,
      lc,
      absLc,
      passed: absLc >= pair.threshold,
      foregroundToken,
      backgroundToken,
    };
  });
  const passed = results.filter((result) => result.passed).length;
  const failedResults = results.filter((result) => !result.passed);

  return {
    apcaAlgorithmVersion: APCA_ALGORITHM_VERSION,
    thresholds: CONTRAST_ASSERTION_THRESHOLDS,
    pairs,
    results,
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed,
      requiredFailed: failedResults.filter((result) => result.severity === "required").length,
      diagnosticFailed: failedResults.filter((result) => result.severity === "diagnostic").length,
    },
  };
}

function createContrastAssertionPairs(
  customRoles: Readonly<Record<string, ResolvedCustomColorRole>>,
): readonly ContrastAssertionPair[] {
  return [
    ...createSurfaceTextPairs("text-primary", "body", "required", "Body text"),
    ...createSurfaceTextPairs("text-secondary", "secondary", "required", "Secondary text"),
    ...createSurfaceTextPairs("text-muted", "muted", "diagnostic", "Muted text"),
    ...createUiPairs(),
    ...createPrimarySoftPairs(),
    ...createStatusPairs(),
    ...createCustomRolePairs(customRoles),
  ];
}

function createSurfaceTextPairs(
  foreground: Extract<SemanticTokenName, `text-${string}`>,
  role: ContrastAssertionRole,
  severity: ContrastAssertionSeverity,
  label: string,
): readonly ContrastAssertionPair[] {
  const pairs: ContrastAssertionPair[] = [];

  for (const theme of ["light", "dark"] as const satisfies readonly SurfaceTheme[]) {
    for (const background of ["surface-1", "surface-2", "surface-3", "surface-4"] as const) {
      pairs.push(createPair({
        theme,
        role,
        severity,
        foreground,
        background,
        description: `${label} on ${background}`,
      }));
    }
  }

  return pairs;
}

function createUiPairs(): readonly ContrastAssertionPair[] {
  return [
    "primary-action-bg",
    "primary-action-bg-hover",
    "primary-action-bg-pressed",
  ].flatMap((background) =>
    (["light", "dark"] as const satisfies readonly SurfaceTheme[]).map((theme) =>
      createPair({
        theme,
        role: "ui",
        severity: "required",
        foreground: "primary-action-text",
        background: background as Extract<SemanticTokenName, `primary-${string}`>,
        description: `Primary action text on ${background}`,
      }),
    ),
  ).concat(
    (["light", "dark"] as const satisfies readonly SurfaceTheme[]).map((theme) =>
      createPair({
        theme,
        role: "ui",
        severity: "required",
        foreground: "control-text",
        background: "control-bg",
        description: "Control text on control background",
      }),
    ),
  );
}

function createPrimarySoftPairs(): readonly ContrastAssertionPair[] {
  return [
    "primary-soft-bg",
    "primary-soft-bg-hover",
  ].flatMap((background) =>
    (["light", "dark"] as const satisfies readonly SurfaceTheme[]).map((theme) =>
      createPair({
        theme,
        role: "ui",
        severity: "required",
        foreground: "primary-soft-text",
        background: background as Extract<SemanticTokenName, `primary-${string}`>,
        description: `Primary soft text on ${background}`,
      }),
    ),
  );
}

function createStatusPairs(): readonly ContrastAssertionPair[] {
  const pairs: ContrastAssertionPair[] = [];

  for (const theme of ["light", "dark"] as const satisfies readonly SurfaceTheme[]) {
    for (const intent of ["danger", "warning", "success", "info"] as const) {
      for (const background of [
        `${intent}-soft-bg`,
        `${intent}-soft-bg-hover`,
      ] as const) {
        pairs.push(createPair({
          theme,
          role: "status-soft",
          severity: "required",
          foreground: `${intent}-soft-text`,
          background,
          description: `${intent} soft text on ${background}`,
        }));
      }

      for (const background of [
        `${intent}-solid-bg`,
        `${intent}-solid-bg-hover`,
        `${intent}-solid-bg-pressed`,
      ] as const) {
        pairs.push(createPair({
          theme,
          role: "status-solid",
          severity: "required",
          foreground: `${intent}-solid-text`,
          background,
          description: `${intent} solid text on ${background}`,
        }));
      }
    }
  }

  return pairs;
}

function createCustomRolePairs(
  customRoles: Readonly<Record<string, ResolvedCustomColorRole>>,
): readonly ContrastAssertionPair[] {
  const pairs: ContrastAssertionPair[] = [];

  for (const theme of ["light", "dark"] as const satisfies readonly SurfaceTheme[]) {
    for (const role of Object.values(customRoles)) {
      for (const background of [
        role.cssAliases["soft-bg"],
        role.cssAliases["soft-bg-hover"],
      ] as const) {
        pairs.push(createPair({
          theme,
          role: "status-soft",
          severity: "required",
          foreground: role.cssAliases["soft-text"],
          background,
          description: `${role.id} custom role soft text on ${background}`,
        }));
      }

      for (const background of [
        role.cssAliases["solid-bg"],
        role.cssAliases["solid-bg-hover"],
        role.cssAliases["solid-bg-pressed"],
      ] as const) {
        pairs.push(createPair({
          theme,
          role: "status-solid",
          severity: "required",
          foreground: role.cssAliases["solid-text"],
          background,
          description: `${role.id} custom role solid text on ${background}`,
        }));
      }
    }
  }

  return pairs;
}

function createPair(options: {
  readonly theme: SurfaceTheme;
  readonly role: ContrastAssertionRole;
  readonly severity: ContrastAssertionSeverity;
  readonly foreground: ContrastAssertionSemanticName;
  readonly background: ContrastAssertionSemanticName;
  readonly description: string;
}): ContrastAssertionPair {
  return {
    ...options,
    id: `${options.theme}:${options.foreground}:on:${options.background}`,
    threshold: CONTRAST_ASSERTION_THRESHOLDS[options.role],
  };
}

function resolveSemanticToken(options: {
  readonly namespace: string;
  readonly primitives: PrimitiveSurfaceOutput;
  readonly semantics: Readonly<Record<SurfaceTheme, ColorEngineThemeSemantics>>;
  readonly theme: SurfaceTheme;
  readonly semanticName: ContrastAssertionSemanticName;
}): ColorToken {
  const semanticValue = options.semantics[options.theme][options.semanticName];
  if (!semanticValue) {
    throw new Error(`Could not resolve semantic token ${options.theme}.${options.semanticName}.`);
  }
  const primitiveName = parseSemanticVariableName(options.namespace, semanticValue);
  const token = Object.values(options.primitives)
    .flatMap((tokens) => [...tokens])
    .find((candidate) => candidate.name === primitiveName);

  if (!token) {
    throw new Error(`Could not resolve ${semanticValue} for ${options.theme}.${options.semanticName}.`);
  }

  return token;
}

function parseSemanticVariableName(namespace: string, value: `var(--${string})`): string {
  const prefix = `var(--${namespace}-`;

  if (!value.startsWith(prefix) || !value.endsWith(")")) {
    throw new Error(`Semantic value ${value} is not a ${namespace} variable reference.`);
  }

  return value.slice(prefix.length, -1);
}
