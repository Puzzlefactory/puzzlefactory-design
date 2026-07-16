import {
  calculateApcaLcFromOklch,
  resolveContrastForeground,
  type ContrastForegroundResolution,
  type ColorEngineOutput,
  type ColorToken,
  type SurfaceTheme,
} from "@puzzlefactory/color-engine";
import type { RegionId, RegionTreatment } from "./authoring-model";

export type RegionSemanticPart =
  | "bg"
  | "bg-hover"
  | "border"
  | "text"
  | "action-bg"
  | "action-bg-hover"
  | "action-text";

export type RegionResolvedMapping = {
  readonly id: RegionId;
  readonly roleKey: string;
  readonly treatment: RegionTreatment;
  readonly label: string;
  readonly description: string;
  readonly namespace: string;
  readonly roleLabel: string;
  readonly semantics: Readonly<Record<RegionSemanticPart, string>>;
};

export type RegionDiagnosticResult = {
  readonly id: string;
  readonly theme: SurfaceTheme;
  readonly region: RegionResolvedMapping;
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

const REGION_DIAGNOSTIC_THEMES = [
  "light",
  "dark",
  "high-contrast",
  "high-contrast-dark",
] as const satisfies readonly SurfaceTheme[];

export function createRegionDiagnostics(
  output: ColorEngineOutput,
  regions: readonly RegionResolvedMapping[],
): readonly RegionDiagnosticResult[] {
  return REGION_DIAGNOSTIC_THEMES.flatMap((theme) =>
    regions.flatMap((region) => {
      const labelForeground = resolveRegionLabelForeground(output, region, theme);
      const background = resolveSemanticToken(output, theme, region.semantics.bg);
      const hoverBackground = resolveSemanticToken(output, theme, region.semantics["bg-hover"]);

      return [
      createRegionDiagnostic({
        backgroundName: region.semantics.bg,
        foregroundName: region.semantics.text,
        label: "region text on region background",
        output,
        region,
        theme,
      }),
      createRegionDiagnostic({
        backgroundName: region.semantics["bg-hover"],
        foregroundName: region.semantics.text,
        label: "region text on hover background",
        output,
        region,
        theme,
      }),
      createRegionDiagnosticFromTokens({
        backgroundToken: background,
        foregroundToken: labelForeground.token,
        label: "region label text on region background",
        region,
        theme,
      }),
      createRegionDiagnosticFromTokens({
        backgroundToken: hoverBackground,
        foregroundToken: labelForeground.token,
        label: "region label text on hover background",
        region,
        theme,
      }),
      createRegionDiagnostic({
        backgroundName: region.semantics["action-bg"],
        foregroundName: region.semantics["action-text"],
        label: "region action text on action background",
        output,
        region,
        theme,
      }),
      createRegionDiagnostic({
        backgroundName: region.semantics["action-bg-hover"],
        foregroundName: region.semantics["action-text"],
        label: "region action text on action hover",
        output,
        region,
        theme,
      }),
      ];
    }),
  );
}

export function resolveRegionLabelForeground(
  output: ColorEngineOutput,
  region: RegionResolvedMapping,
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
  const candidateNames = ["muted", "secondary", "primary", "strong"]
    .map((level) => `${textFamily}-${level}`);
  const candidates = candidateNames
    .map((name) => findPrimitiveToken(output, name))
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

function createRegionDiagnostic(options: {
  readonly output: ColorEngineOutput;
  readonly theme: SurfaceTheme;
  readonly region: RegionResolvedMapping;
  readonly label: string;
  readonly foregroundName: string;
  readonly backgroundName: string;
}): RegionDiagnosticResult {
  const foregroundToken = resolveSemanticToken(options.output, options.theme, options.foregroundName);
  const backgroundToken = resolveSemanticToken(options.output, options.theme, options.backgroundName);

  return createRegionDiagnosticFromTokens({
    backgroundToken,
    foregroundToken,
    label: options.label,
    region: options.region,
    theme: options.theme,
  });
}

function createRegionDiagnosticFromTokens(options: {
  readonly theme: SurfaceTheme;
  readonly region: RegionResolvedMapping;
  readonly label: string;
  readonly foregroundToken: ColorToken;
  readonly backgroundToken: ColorToken;
}): RegionDiagnosticResult {
  const { backgroundToken, foregroundToken } = options;
  const lc = calculateApcaLcFromOklch(foregroundToken.oklch, backgroundToken.oklch);
  const absLc = Math.abs(lc);
  const threshold = options.label.includes("action") ? 45 : 60;

  return {
    id: `${options.theme}:${options.region.id}:${options.label.replaceAll(" ", "-")}:${foregroundToken.name}:on:${backgroundToken.name}`,
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
