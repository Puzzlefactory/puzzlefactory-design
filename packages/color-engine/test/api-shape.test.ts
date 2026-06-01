import type {
  AssertionResult,
  CreateColorEngineTheme,
  EngineInput,
  EngineOutput,
  EngineWarning,
  HarmonyStrategy,
  PrimitiveTokenName,
  SemanticMappingOverrides,
  SemanticTokenName,
  StatusHueAnchors,
  TaperConfig,
  ThemeVariant,
  ValidationError,
  WarningCode,
} from "../src/index";

type Assert<T extends true> = T;
type IsAssignable<T, U> = T extends U ? true : false;

const harmony: HarmonyStrategy = "split-complementary";
const theme: ThemeVariant = "high-contrast-dark";
const primitive: PrimitiveTokenName = "status-warning-d-12";
const semantic: SemanticTokenName = "status-warning-on-container";
const warning: WarningCode = "GAMUT_MAPPED";

const taper: TaperConfig = {
  lightUpperFadeStart: 0.7,
  lightUpperFadeEnd: 0.92,
  lightLowerFadeStart: 0.55,
  lightLowerFadeEnd: 0.68,
  darkUpperFadeStart: 0.42,
  darkUpperFadeEnd: 0.55,
  darkLowerFadeStart: 0.08,
  darkLowerFadeEnd: 0.25,
};

const statusHues: StatusHueAnchors = {
  danger: 29,
  warning: 65,
  success: 145,
  info: 245,
};

const semanticOverrides: SemanticMappingOverrides = {
  "surface-base": "neutral-l-1",
  "status-danger-text": "neutral-l-1",
};

const input: EngineInput = {
  seed: "#7c3aed",
  harmony,
  mood: "vibrant",
  namespace: "ds",
  overrides: {
    statusHues,
    darkHueShift: {
      "palette-a": 8,
    },
    taperParams: taper,
    semanticMapping: semanticOverrides,
  },
};

const assertion: AssertionResult = {
  tokenA: "text-primary",
  tokenB: "surface-base",
  requiredLc: 75,
  actualLc: 86,
  polarity: "CORRECT",
  status: "pass",
  source: "reference",
};

const engineWarning: EngineWarning = {
  code: warning,
  message: "Gamut mapping affected one or more primitive tokens.",
  affectedTokens: [primitive],
  data: {
    count: 1,
    minCReduction: 0.001,
    maxCReduction: 0.004,
  },
};

const output: EngineOutput = {
  primitives: {
    srgb: {
      [primitive]: "oklch(0.55 0.12 65)",
    } as EngineOutput["primitives"]["srgb"],
    p3: {
      [primitive]: "color(display-p3 0.7 0.6 0.2)",
    } as EngineOutput["primitives"]["p3"],
  },
  semantic: {
    light: ({
      [semantic]: `var(--ds-${primitive})`,
    } as unknown) as EngineOutput["semantic"]["light"],
    dark: ({
      [semantic]: `var(--ds-${primitive})`,
    } as unknown) as EngineOutput["semantic"]["dark"],
    highContrast: ({
      [semantic]: `var(--ds-${primitive})`,
    } as unknown) as EngineOutput["semantic"]["highContrast"],
    highContrastDark: ({
      [semantic]: `var(--ds-${primitive})`,
    } as unknown) as EngineOutput["semantic"]["highContrastDark"],
  },
  assertions: [assertion],
  warnings: [engineWarning],
  metadata: {
    inputSeed: input.seed,
    normalizedSeed: { l: 0.55, c: 0.12, h: 280 },
    adjustedSeed: { l: 0.55, c: 0.12, h: 280 },
    seedAdjusted: false,
    harmonyHues: [280, 100],
    gamutMappedCount: 1,
  },
};

const createTheme: CreateColorEngineTheme = () => output;
const validationError: ValidationError = {
  ...new Error("Invalid seed"),
  name: "ValidationError",
  message: "Invalid seed",
  code: "INVALID_SEED_FORMAT",
  field: "seed",
  value: "rebeccapurple",
};

void createTheme(input);
void theme;
void validationError;

type _PrimitiveNameIncludesSteps = Assert<
  IsAssignable<"palette-a-l-12", PrimitiveTokenName>
>;
type _SemanticNameIncludesStatus = Assert<
  IsAssignable<"status-info-on-container", SemanticTokenName>
>;
type _EntryPointReturnsOutput = Assert<
  IsAssignable<ReturnType<CreateColorEngineTheme>, EngineOutput>
>;
