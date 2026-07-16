import type {
  ColorToken,
  OklchValue,
  PrimitiveSurfaceOutput,
  SurfaceGenerationTheme,
  SurfacePreset,
  SurfaceState,
} from "./index.js";

export function createPrimitiveStateToken(options: {
  readonly token: ColorToken;
  readonly state: SurfaceState;
  readonly surfacePresets: Readonly<Record<SurfaceGenerationTheme, SurfacePreset>>;
}): ColorToken {
  const theme = getPrimitiveTokenTheme(options.token.name);
  const oklch = options.token.name.startsWith("hc-light-") || options.token.name.startsWith("hc-dark-")
    ? createHighContrastStateOklch(options.token.oklch, options.state, theme)
    : createStateOklch(
        options.token.oklch,
        options.state,
        theme,
        options.surfacePresets[theme],
      );

  return {
    name: `${options.token.name}-${options.state}`,
    value: formatOklch(oklch),
    oklch,
    description: `${options.token.description} ${options.state} state`,
  };
}

export function findPrimitiveToken(
  primitives: PrimitiveSurfaceOutput,
  name: string,
): ColorToken | undefined {
  return Object.values(primitives)
    .flatMap((tokens) => [...tokens])
    .find((candidate) => candidate.name === name);
}

export function shouldCreateStateValues(tokenName: string): boolean {
  return !tokenName.endsWith("-seed")
    && !tokenName.startsWith("text-")
    && !tokenName.startsWith("hc-light-text-")
    && !tokenName.startsWith("hc-dark-text-");
}

function getPrimitiveTokenTheme(tokenName: string): SurfaceGenerationTheme {
  if (tokenName.startsWith("role-")) {
    const match = /^role-[a-z][a-z0-9-]*-(light|dark)-(?:soft|solid)-\d+$/.exec(tokenName);
    if (match?.[1] === "light" || match?.[1] === "dark") {
      return match[1];
    }
  }

  if (tokenName.startsWith("hc-light-")) {
    return "light";
  }

  if (tokenName.startsWith("hc-dark-")) {
    return "dark";
  }

  return tokenName.includes("-light-") ? "light" : "dark";
}

function createHighContrastStateOklch(
  base: OklchValue,
  state: SurfaceState,
  theme: SurfaceGenerationTheme,
): OklchValue {
  const multiplier = state === "hover" ? 1 : state === "selected" ? 1.8 : 2.6;
  const isLightSurface = theme === "light";
  const direction = isLightSurface ? -1 : 1;
  const delta = isLightSurface ? 0.025 : 0.04;

  return {
    l: roundChannel(clampNumber(base.l + direction * delta * multiplier, 0.01, 0.995)),
    c: base.c,
    h: base.h,
  };
}

function createStateOklch(
  base: OklchValue,
  state: SurfaceState,
  theme: SurfaceGenerationTheme,
  preset: SurfacePreset,
): OklchValue {
  const multiplier = state === "hover" ? 1 : state === "selected" ? 1.65 : 2.2;
  const isLightSurface = theme === "light";
  const direction = isLightSurface ? -1 : 1;
  const delta = isLightSurface ? preset.lightStateDelta : preset.darkStateDelta;

  return {
    l: roundChannel(clampNumber(base.l + direction * delta * multiplier, 0.02, 0.998)),
    c: roundChannel(clampNumber(
      base.c * (state === "hover" ? 0.98 : state === "selected" ? 0.96 : 0.94),
      0,
      0.08,
    )),
    h: base.h,
  };
}

function formatOklch(color: OklchValue): `oklch(${string})` {
  return `oklch(${formatNumber(color.l)} ${formatNumber(color.c)} ${formatNumber(color.h)})`;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(6)).toString();
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundChannel(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
