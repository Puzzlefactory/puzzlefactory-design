import {
  calculateApcaLcFromOklch,
  resolveContrastForeground,
  type ColorEngineOutput,
  type ColorToken,
  type ContrastForegroundResolution,
  type SurfaceTheme,
} from "@puzzlefactory/color-engine";
import type {
  ThemeRegionId,
  ThemeRegionMappings,
  ThemeRegionTreatment,
} from "./index.js";

export const THEME_REGION_DEFINITIONS = {
  header: {
    label: "Header",
    description: "Institutional masthead, account controls, and primary navigation chrome.",
  },
  sidebar: {
    label: "Sidebar",
    description: "Persistent navigation context that can be tinted without becoming primary action color.",
  },
  footer: {
    label: "Footer",
    description: "Dense lower-chrome area for links, legal text, and operational metadata.",
  },
} as const satisfies Readonly<
  Record<ThemeRegionId, { readonly label: string; readonly description: string }>
>;

export type ThemeRegionSemanticPart =
  | "bg"
  | "bg-hover"
  | "border"
  | "text"
  | "action-bg"
  | "action-bg-hover"
  | "action-text";

export type ResolvedThemeRegion = {
  readonly id: ThemeRegionId;
  readonly roleId: string;
  readonly treatment: ThemeRegionTreatment;
  readonly label: string;
  readonly description: string;
  readonly namespace: string;
  readonly roleLabel: string;
  readonly semantics: Readonly<Record<ThemeRegionSemanticPart, string>>;
};

export type ThemeRegionDiagnosticKind = "text" | "label" | "action";

export type ThemeRegionDiagnosticResult = {
  readonly id: string;
  readonly kind: ThemeRegionDiagnosticKind;
  readonly theme: SurfaceTheme;
  readonly region: ResolvedThemeRegion;
  readonly label: string;
  readonly foregroundName: string;
  readonly backgroundName: string;
  readonly foregroundToken: ColorToken;
  readonly backgroundToken: ColorToken;
  readonly lc: number;
  readonly absLc: number;
  readonly threshold: number;
  readonly passed: boolean;
};

const REGION_IDS = ["header", "sidebar", "footer"] as const satisfies readonly ThemeRegionId[];
const DIAGNOSTIC_THEMES = [
  "light",
  "dark",
  "high-contrast",
  "high-contrast-dark",
] as const satisfies readonly SurfaceTheme[];

export function createResolvedThemeRegions(
  output: ColorEngineOutput,
  mappings: ThemeRegionMappings,
): readonly ResolvedThemeRegion[] {
  return REGION_IDS.map((regionId) => {
    const mapping = mappings[regionId];
    const role = output.customRoles[mapping.roleId];

    if (!role) {
      throw new Error(`Normalized theme region ${regionId} references missing role ${mapping.roleId}.`);
    }

    const backgroundPart = mapping.treatment === "solid" ? "solid-bg" : "soft-bg";
    const hoverPart = mapping.treatment === "solid" ? "solid-bg-hover" : "soft-bg-hover";
    const borderPart = mapping.treatment === "solid" ? "solid-bg-pressed" : "soft-border";
    const textPart = mapping.treatment === "solid" ? "solid-text" : "soft-text";
    const actionTreatment = mapping.treatment === "solid" ? "soft" : "solid";
    const actionBackgroundPart = actionTreatment === "solid" ? "solid-bg" : "soft-bg";
    const actionHoverPart = actionTreatment === "solid" ? "solid-bg-hover" : "soft-bg-hover";
    const actionTextPart = actionTreatment === "solid" ? "solid-text" : "soft-text";

    return {
      id: regionId,
      roleId: role.id,
      treatment: mapping.treatment,
      ...THEME_REGION_DEFINITIONS[regionId],
      namespace: output.input.namespace,
      roleLabel: toTitleLabel(role.id),
      semantics: {
        bg: role.cssAliases[backgroundPart],
        "bg-hover": role.cssAliases[hoverPart],
        border: role.cssAliases[borderPart],
        text: role.cssAliases[textPart],
        "action-bg": role.cssAliases[actionBackgroundPart],
        "action-bg-hover": role.cssAliases[actionHoverPart],
        "action-text": role.cssAliases[actionTextPart],
      },
    };
  });
}

export function createThemeRegionDiagnostics(
  output: ColorEngineOutput,
  regions: readonly ResolvedThemeRegion[],
): readonly ThemeRegionDiagnosticResult[] {
  return DIAGNOSTIC_THEMES.flatMap((theme) =>
    regions.flatMap((region) => {
      const labelForeground = resolveThemeRegionLabelForeground(output, region, theme);
      const background = resolveSemanticToken(output, theme, region.semantics.bg);
      const hoverBackground = resolveSemanticToken(output, theme, region.semantics["bg-hover"]);

      return [
        createSemanticDiagnostic({
          backgroundName: region.semantics.bg,
          foregroundName: region.semantics.text,
          kind: "text",
          label: "region text on region background",
          output,
          region,
          theme,
        }),
        createSemanticDiagnostic({
          backgroundName: region.semantics["bg-hover"],
          foregroundName: region.semantics.text,
          kind: "text",
          label: "region text on hover background",
          output,
          region,
          theme,
        }),
        createTokenDiagnostic({
          backgroundToken: background,
          foregroundToken: labelForeground.token,
          kind: "label",
          label: "region label text on region background",
          region,
          theme,
        }),
        createTokenDiagnostic({
          backgroundToken: hoverBackground,
          foregroundToken: labelForeground.token,
          kind: "label",
          label: "region label text on hover background",
          region,
          theme,
        }),
        createSemanticDiagnostic({
          backgroundName: region.semantics["action-bg"],
          foregroundName: region.semantics["action-text"],
          kind: "action",
          label: "region action text on action background",
          output,
          region,
          theme,
        }),
        createSemanticDiagnostic({
          backgroundName: region.semantics["action-bg-hover"],
          foregroundName: region.semantics["action-text"],
          kind: "action",
          label: "region action text on action hover",
          output,
          region,
          theme,
        }),
      ];
    }),
  );
}

export function resolveThemeRegionLabelForeground(
  output: ColorEngineOutput,
  region: ResolvedThemeRegion,
  theme: SurfaceTheme,
): ContrastForegroundResolution {
  const backgrounds = [
    resolveSemanticToken(output, theme, region.semantics.bg),
    resolveSemanticToken(output, theme, region.semantics["bg-hover"]),
  ];
  const primaryForeground = resolveSemanticToken(output, theme, region.semantics.text);
  const averageBackgroundLightness = backgrounds.reduce(
    (total, background) => total + background.oklch.l,
    0,
  ) / backgrounds.length;
  const usesDarkForeground = primaryForeground.oklch.l < averageBackgroundLightness;
  const textFamily = theme === "high-contrast" || theme === "high-contrast-dark"
    ? usesDarkForeground
      ? "hc-light-text"
      : "hc-dark-text"
    : usesDarkForeground
      ? "text-dark"
      : "text-light";
  const candidates = ["muted", "secondary", "primary", "strong"]
    .map((level) => findPrimitiveToken(output, `${textFamily}-${level}`))
    .concat(primaryForeground)
    .filter((token, index, tokens) =>
      tokens.findIndex((candidate) => candidate.name === token.name) === index
    );

  return resolveContrastForeground({
    backgrounds,
    candidates,
    threshold: 60,
  });
}

function createSemanticDiagnostic(options: {
  readonly output: ColorEngineOutput;
  readonly theme: SurfaceTheme;
  readonly region: ResolvedThemeRegion;
  readonly kind: ThemeRegionDiagnosticKind;
  readonly label: string;
  readonly foregroundName: string;
  readonly backgroundName: string;
}): ThemeRegionDiagnosticResult {
  return createTokenDiagnostic({
    foregroundToken: resolveSemanticToken(options.output, options.theme, options.foregroundName),
    backgroundToken: resolveSemanticToken(options.output, options.theme, options.backgroundName),
    kind: options.kind,
    label: options.label,
    region: options.region,
    theme: options.theme,
  });
}

function createTokenDiagnostic(options: {
  readonly theme: SurfaceTheme;
  readonly region: ResolvedThemeRegion;
  readonly kind: ThemeRegionDiagnosticKind;
  readonly label: string;
  readonly foregroundToken: ColorToken;
  readonly backgroundToken: ColorToken;
}): ThemeRegionDiagnosticResult {
  const { backgroundToken, foregroundToken } = options;
  const lc = calculateApcaLcFromOklch(foregroundToken.oklch, backgroundToken.oklch);
  const absLc = Math.abs(lc);
  const threshold = options.kind === "action" ? 45 : 60;

  return {
    id: `${options.theme}:${options.region.id}:${options.label.replaceAll(" ", "-")}:${foregroundToken.name}:on:${backgroundToken.name}`,
    kind: options.kind,
    theme: options.theme,
    region: options.region,
    label: options.label,
    foregroundName: foregroundToken.name,
    backgroundName: backgroundToken.name,
    foregroundToken,
    backgroundToken,
    lc,
    absLc,
    threshold,
    passed: absLc >= threshold,
  };
}

function resolveSemanticToken(
  output: ColorEngineOutput,
  theme: SurfaceTheme,
  semanticName: string,
): ColorToken {
  const semantics = output.semantics[theme] as Readonly<Record<string, `var(--${string})`>>;
  const semanticValue = semantics[semanticName];

  if (!semanticValue) {
    throw new Error(`Could not resolve ${theme}.${semanticName}.`);
  }

  const tokenName = parseSemanticVariableName(output.input.namespace, semanticValue);
  return findPrimitiveToken(output, tokenName);
}

function findPrimitiveToken(output: ColorEngineOutput, tokenName: string): ColorToken {
  const token = Object.values(output.primitives)
    .flatMap((tokens) => [...tokens])
    .find((candidate) => candidate.name === tokenName);

  if (!token) {
    throw new Error(`Could not resolve primitive token ${tokenName}.`);
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

function toTitleLabel(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
