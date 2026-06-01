import type {
  EngineInput,
  HarmonyStrategy,
  Mood,
  PaletteSlot,
  PrimitiveTokenName,
  SemanticTokenName,
  StatusHueAnchors,
  TaperConfig,
} from "./index.js";
import { ColorEngineValidationError } from "./errors.js";
import {
  detectSeedFormat,
  parseOklchSeed,
  validateOklchSeed,
  type OklchSeedValidationResult,
  type ParsedSeedFormat,
} from "./seed.js";

export interface InputValidationResult {
  readonly input: EngineInput;
  readonly seedFormat: ParsedSeedFormat;
  readonly oklchSeed?: OklchSeedValidationResult;
}

const HARMONY_STRATEGIES = new Set<HarmonyStrategy>([
  "complementary",
  "analogous",
  "triadic",
  "split-complementary",
  "monochromatic",
]);

const MOODS = new Set<Mood>(["vibrant", "muted", "neutral"]);

const PALETTE_SLOTS = new Set<PaletteSlot>([
  "palette-a",
  "palette-b",
  "palette-c",
  "palette-a-mid",
  "palette-a-subtle",
  "neutral",
  "status-danger",
  "status-warning",
  "status-success",
  "status-info",
]);

const SEMANTIC_TOKEN_PATTERN =
  /^(surface-(?:base|raised|overlay|tinted)|text-(?:primary|secondary|disabled)|interactive-(?:bg-(?:rest|hover|active|disabled)|text|border)|focus-ring|border-(?:strong|subtle)|status-(?:danger|warning|success|info)-(?:bg|text|container|on-container|border))$/;

const PRIMITIVE_TOKEN_PATTERN =
  /^(?:palette-a|palette-b|palette-c|palette-a-mid|palette-a-subtle|neutral|status-danger|status-warning|status-success|status-info)-[ld]-(?:[1-9]|1[0-2])$/;

const TAPER_PAIRS: readonly (readonly [keyof TaperConfig, keyof TaperConfig])[] = [
  ["lightUpperFadeStart", "lightUpperFadeEnd"],
  ["lightLowerFadeStart", "lightLowerFadeEnd"],
  ["darkUpperFadeStart", "darkUpperFadeEnd"],
  ["darkLowerFadeStart", "darkLowerFadeEnd"],
];

export function validateEngineInput(input: unknown): InputValidationResult {
  if (!isRecord(input)) {
    throw validationError("INVALID_SEED_FORMAT", "input", input, "Input must be an object.");
  }

  validateSeedValue(input.seed);
  const seedFormat = detectSeedFormat(input.seed);
  const oklchSeed =
    seedFormat.format === "oklch"
      ? validateOklchSeed(parseOklchSeed(seedFormat.value))
      : undefined;

  validateHarmony(input.harmony);
  validateMood(input.mood);
  validateNamespace(input.namespace);
  validateOverrides(input.overrides);

  const typedInput = input as unknown as EngineInput;

  if (oklchSeed) {
    return {
      input: typedInput,
      seedFormat,
      oklchSeed,
    };
  }

  return {
    input: typedInput,
    seedFormat,
  };
}

export function validateTaperConfig(taperParams: Partial<TaperConfig>): void {
  for (const [startKey, endKey] of TAPER_PAIRS) {
    const start = taperParams[startKey];
    const end = taperParams[endKey];

    if (start === undefined && end === undefined) {
      continue;
    }

    if (
      (start !== undefined && !isFiniteNumber(start)) ||
      (end !== undefined && !isFiniteNumber(end))
    ) {
      throw validationError(
        "INVALID_TAPER_CONFIG",
        `overrides.taperParams.${String(startKey)}`,
        taperParams,
        `${String(startKey)} and ${String(endKey)} must be finite numbers when provided.`,
      );
    }

    if (start !== undefined && end !== undefined && start >= end) {
      throw validationError(
        "INVALID_TAPER_CONFIG",
        `overrides.taperParams.${String(startKey)}`,
        taperParams,
        `${String(startKey)} must be less than ${String(endKey)}.`,
      );
    }
  }
}

function validateSeedValue(seed: unknown): asserts seed is string {
  if (typeof seed !== "string" || seed.trim() === "") {
    throw validationError("INVALID_SEED_FORMAT", "seed", seed, "Seed is required.");
  }
}

function validateHarmony(harmony: unknown): asserts harmony is HarmonyStrategy {
  if (typeof harmony !== "string" || !HARMONY_STRATEGIES.has(harmony as HarmonyStrategy)) {
    throw validationError(
      "INVALID_HARMONY",
      "harmony",
      harmony,
      "Harmony strategy is required and must be supported.",
    );
  }
}

function validateMood(mood: unknown): asserts mood is Mood | undefined {
  if (mood !== undefined && (typeof mood !== "string" || !MOODS.has(mood as Mood))) {
    throw validationError("INVALID_HARMONY", "mood", mood, "Mood must be supported.");
  }
}

function validateNamespace(namespace: unknown): asserts namespace is string | undefined {
  if (namespace !== undefined && (typeof namespace !== "string" || namespace.trim() === "")) {
    throw validationError(
      "INVALID_SEED_FORMAT",
      "namespace",
      namespace,
      "Namespace must be a non-empty string when provided.",
    );
  }
}

function validateOverrides(overrides: unknown): void {
  if (overrides === undefined) {
    return;
  }

  if (!isRecord(overrides)) {
    throw validationError(
      "INVALID_OVERRIDE_REFERENCE",
      "overrides",
      overrides,
      "Overrides must be an object.",
    );
  }

  validateStatusHues(overrides.statusHues);
  validateDarkHueShift(overrides.darkHueShift);
  validateTaperParams(overrides.taperParams);
  validateSemanticMapping(overrides.semanticMapping);
}

function validateStatusHues(statusHues: unknown): asserts statusHues is Partial<StatusHueAnchors> | undefined {
  if (statusHues === undefined) {
    return;
  }

  if (!isRecord(statusHues)) {
    throw validationError(
      "INVALID_OVERRIDE_REFERENCE",
      "overrides.statusHues",
      statusHues,
      "Status hue overrides must be an object.",
    );
  }

  for (const [name, value] of Object.entries(statusHues)) {
    if (!["danger", "warning", "success", "info"].includes(name) || !isHue(value)) {
      throw validationError(
        "INVALID_OVERRIDE_REFERENCE",
        `overrides.statusHues.${name}`,
        value,
        "Status hue overrides must use danger, warning, success, or info with hue values in [0, 360).",
      );
    }
  }
}

function validateDarkHueShift(darkHueShift: unknown): void {
  if (darkHueShift === undefined) {
    return;
  }

  if (!isRecord(darkHueShift)) {
    throw validationError(
      "INVALID_OVERRIDE_REFERENCE",
      "overrides.darkHueShift",
      darkHueShift,
      "Dark hue shift overrides must be an object.",
    );
  }

  for (const [slot, value] of Object.entries(darkHueShift)) {
    if (!PALETTE_SLOTS.has(slot as PaletteSlot) || !isFiniteNumber(value)) {
      throw validationError(
        "INVALID_OVERRIDE_REFERENCE",
        `overrides.darkHueShift.${slot}`,
        value,
        "Dark hue shift overrides must reference valid palette slots with finite numeric shifts.",
      );
    }
  }
}

function validateTaperParams(taperParams: unknown): void {
  if (taperParams === undefined) {
    return;
  }

  if (!isRecord(taperParams)) {
    throw validationError(
      "INVALID_TAPER_CONFIG",
      "overrides.taperParams",
      taperParams,
      "Taper parameters must be an object.",
    );
  }

  validateTaperConfig(taperParams as Partial<TaperConfig>);
}

function validateSemanticMapping(semanticMapping: unknown): void {
  if (semanticMapping === undefined) {
    return;
  }

  if (!isRecord(semanticMapping)) {
    throw validationError(
      "INVALID_OVERRIDE_REFERENCE",
      "overrides.semanticMapping",
      semanticMapping,
      "Semantic mapping overrides must be an object.",
    );
  }

  for (const [semanticName, primitiveName] of Object.entries(semanticMapping)) {
    if (
      !SEMANTIC_TOKEN_PATTERN.test(semanticName as SemanticTokenName) ||
      typeof primitiveName !== "string" ||
      !PRIMITIVE_TOKEN_PATTERN.test(primitiveName as PrimitiveTokenName)
    ) {
      throw validationError(
        "INVALID_OVERRIDE_REFERENCE",
        `overrides.semanticMapping.${semanticName}`,
        primitiveName,
        "Semantic mapping overrides must map known semantic token names to primitive token names.",
      );
    }
  }
}

function validationError(
  code: ColorEngineValidationError["code"],
  field: string,
  value: unknown,
  message: string,
): ColorEngineValidationError {
  return new ColorEngineValidationError({ code, field, value, message });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHue(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value < 360;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
