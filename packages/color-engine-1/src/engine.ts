import type {
  EngineInput,
  EngineOutput,
  EngineWarning,
  GamutMappedWarningData,
  OklchCssString,
  PaletteSlot,
  PrimitiveTokenName,
  SemanticTokenName,
} from "./index.js";
import { runContrastAssertions } from "./assertions.js";
import { deriveHarmony } from "./harmony.js";
import {
  assemblePrimitiveTokens,
  type PrimitiveTokenGamutMapping,
} from "./primitives.js";
import {
  primitiveNamesFromTokens,
  resolveSemanticMappings,
  type SemanticMappingRecord,
  type SemanticThemeMappings,
} from "./semantic.js";
import { validateEngineInput } from "./validate.js";

export function createColorEngineTheme(input: EngineInput): EngineOutput {
  const validation = validateEngineInput(input);
  const normalizedSeed = validation.oklchSeed.normalizedSeed;
  const adjustedSeed = validation.oklchSeed.adjustedSeed;
  const overrides = validation.input.overrides;
  const primitives = assemblePrimitiveTokens({
    seed: adjustedSeed,
    harmony: validation.input.harmony,
    ...(validation.input.mood === undefined ? {} : { mood: validation.input.mood }),
    ...(overrides?.statusHues === undefined ? {} : { statusHues: overrides.statusHues }),
    ...(overrides?.darkHueShift === undefined ? {} : { darkHueShift: overrides.darkHueShift }),
    ...(overrides?.taperParams === undefined ? {} : { taperParams: overrides.taperParams }),
  });
  const semanticMappings = resolveSemanticMappings({
    primitiveNames: primitiveNamesFromTokens(primitives.tokens),
    ...(overrides?.semanticMapping === undefined
      ? {}
      : { overrides: overrides.semanticMapping }),
  });
  const assertions = runContrastAssertions({
    primitives: primitives.tokens,
    mappings: semanticMappings,
    ...(overrides?.semanticMapping === undefined
      ? {}
      : { overrides: overrides.semanticMapping }),
  });
  const warnings = [
    ...validation.oklchSeed.warnings,
    ...createGamutMappedWarnings(primitives.gamutMappings),
    ...createStatusContrastLimitWarnings(assertions, semanticMappings),
  ];

  return {
    primitives: {
      srgb: Object.fromEntries(
        primitives.tokens.map((token) => [token.name, token.srgb]),
      ) as Record<PrimitiveTokenName, OklchCssString>,
      p3: createP3PrimitiveOutput(primitives),
    },
    semantic: createSemanticOutput(semanticMappings, validation.input.namespace?.trim() ?? "ds"),
    assertions,
    warnings,
    metadata: {
      inputSeed: validation.input.seed,
      normalizedSeed,
      adjustedSeed,
      seedAdjusted: validation.oklchSeed.seedAdjusted,
      harmonyHues: deriveHarmony({
        hue: adjustedSeed.h,
        strategy: validation.input.harmony,
        ...(validation.input.mood === undefined ? {} : { mood: validation.input.mood }),
      }).map((descriptor) => descriptor.hue),
      gamutMappedCount: primitives.gamutMappings.length,
    },
  };
}

function createP3PrimitiveOutput(
  primitives: ReturnType<typeof assemblePrimitiveTokens>,
): EngineOutput["primitives"]["p3"] {
  return Object.fromEntries(
    primitives.gamutMappings.flatMap((mapping) => {
      const token = primitives.byName.get(mapping.name);

      return token === undefined ? [] : [[mapping.name, token.p3]];
    }),
  ) as EngineOutput["primitives"]["p3"];
}

function createSemanticOutput(
  mappings: SemanticThemeMappings,
  namespace: string,
): EngineOutput["semantic"] {
  return {
    light: createSemanticThemeOutput(mappings.light, namespace),
    dark: createSemanticThemeOutput(mappings.dark, namespace),
    highContrast: createSemanticThemeOutput(mappings.highContrast, namespace),
    highContrastDark: createSemanticThemeOutput(mappings.highContrastDark, namespace),
  };
}

function createSemanticThemeOutput(
  mapping: SemanticMappingRecord,
  namespace: string,
): Record<SemanticTokenName, `var(--${string})`> {
  return Object.fromEntries(
    Object.entries(mapping).map(([semanticName, primitiveName]) => [
      semanticName,
      `var(--${namespace}-${primitiveName})`,
    ]),
  ) as Record<SemanticTokenName, `var(--${string})`>;
}

function createGamutMappedWarnings(
  mappings: readonly PrimitiveTokenGamutMapping[],
): readonly EngineWarning[] {
  const mappingsBySlot = new Map<PaletteSlot, PrimitiveTokenGamutMapping[]>();

  for (const mapping of mappings) {
    const slotMappings = mappingsBySlot.get(mapping.slot) ?? [];
    slotMappings.push(mapping);
    mappingsBySlot.set(mapping.slot, slotMappings);
  }

  return [...mappingsBySlot.entries()].map(([slot, slotMappings]) => {
    const reductions = slotMappings.map((mapping) => mapping.chromaReduction);
    const data: GamutMappedWarningData = {
      count: slotMappings.length,
      minCReduction: Math.min(...reductions),
      maxCReduction: Math.max(...reductions),
    };

    return {
      code: "GAMUT_MAPPED",
      message: `Gamut mapping affected one or more ${slot} primitive tokens.`,
      affectedTokens: slotMappings.map((mapping) => mapping.name),
      data,
    };
  });
}

function createStatusContrastLimitWarnings(
  assertions: EngineOutput["assertions"],
  mappings: SemanticThemeMappings,
): readonly EngineWarning[] {
  const warningAssertions = assertions.filter(
    (assertion) =>
      assertion.status === "warning" &&
      assertion.tokenA === "status-warning-text" &&
      assertion.tokenB === "status-warning-bg",
  );

  if (warningAssertions.length === 0) {
    return [];
  }

  const affectedTokens = uniquePrimitiveNames(
    warningAssertions.flatMap((assertion) => {
      const themeMapping = mappings[assertion.theme];

      return [themeMapping[assertion.tokenA], themeMapping[assertion.tokenB]];
    }),
  );

  return [
    {
      code: "STATUS_CONTRAST_LIMIT",
      message:
        "Warning status text reached the configured contrast floor before the target contrast.",
      affectedTokens,
      data: {
        themes: warningAssertions.map((assertion) => assertion.theme),
        requiredLc: uniqueNumbers(warningAssertions.map((assertion) => assertion.requiredLc)),
        minActualLc: Math.min(...warningAssertions.map((assertion) => assertion.actualLc)),
      },
    },
  ];
}

function uniquePrimitiveNames(
  values: readonly PrimitiveTokenName[],
): readonly PrimitiveTokenName[] {
  return [...new Set(values)];
}

function uniqueNumbers(values: readonly number[]): readonly number[] {
  return [...new Set(values)];
}
