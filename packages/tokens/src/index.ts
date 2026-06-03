import type {
  EngineOutput,
  PrimitiveTokenName,
  SemanticThemeKey,
  SemanticTokenName,
} from "@puzzlefactory/color-engine-1";

export type TokenCssFileName =
  | "tokens.css"
  | "tokens-p3.css"
  | "theme-light.css"
  | "theme-dark.css"
  | "theme-high-contrast.css"
  | "theme-high-contrast-dark.css";

export type ThemeCssFileName = Exclude<
  TokenCssFileName,
  "tokens.css" | "tokens-p3.css"
>;

export type ThemeCssSelector =
  | ":root,\n[data-theme=\"light\"]"
  | "[data-theme=\"dark\"]"
  | "[data-theme=\"high-contrast\"]"
  | "[data-theme=\"high-contrast-dark\"]";

export interface TokenCssFiles {
  readonly "tokens.css": string;
  readonly "tokens-p3.css": string;
  readonly "theme-light.css": string;
  readonly "theme-dark.css": string;
  readonly "theme-high-contrast.css": string;
  readonly "theme-high-contrast-dark.css": string;
}

export interface TokenCssThemeFile {
  readonly fileName: ThemeCssFileName;
  readonly theme: SemanticThemeKey;
  readonly selector: ThemeCssSelector;
  readonly css: string;
}

export interface TokenCssRenderResult {
  readonly namespace: string;
  readonly files: TokenCssFiles;
}

export function createTokenCssFiles(output: EngineOutput): TokenCssFiles {
  return createTokenCssOutput(output).files;
}

export function createTokenCssOutput(output: EngineOutput): TokenCssRenderResult {
  const namespace = inferNamespace(output);

  return {
    namespace,
    files: {
      "tokens.css": createPrimitiveTokenCss(output, namespace),
      "tokens-p3.css": createP3TokenCss(output, namespace),
      "theme-light.css": createThemeCss(output, "light", namespace),
      "theme-dark.css": createThemeCss(output, "dark", namespace),
      "theme-high-contrast.css": createThemeCss(output, "highContrast", namespace),
      "theme-high-contrast-dark.css": createThemeCss(
        output,
        "highContrastDark",
        namespace,
      ),
    },
  };
}

export function createPrimitiveTokenCss(
  output: EngineOutput,
  namespace = inferNamespace(output),
): string {
  return createCssRule(
    ":root",
    primitiveEntries(output.primitives.srgb).map(([name, value]) => [
      customPropertyName(namespace, name),
      value,
    ]),
  );
}

export function createP3TokenCss(
  output: EngineOutput,
  namespace = inferNamespace(output),
): string {
  const body = indentCss(
    createCssRule(
      ":root",
      primitiveEntries(output.primitives.p3).map(([name, value]) => [
        customPropertyName(namespace, name),
        value,
      ]),
    ),
  );

  return `@supports (color: color(display-p3 0 0 0)) {\n${body}\n}`;
}

export function createThemeCss(
  output: EngineOutput,
  theme: SemanticThemeKey,
  namespace = inferNamespace(output),
): string {
  return createCssRule(
    themeSelector(theme),
    semanticEntries(output.semantic[theme]).map(([name, value]) => [
      customPropertyName(namespace, name),
      value,
    ]),
  );
}

export function createThemeCssFiles(output: EngineOutput): readonly TokenCssThemeFile[] {
  const namespace = inferNamespace(output);

  return [
    {
      fileName: "theme-light.css",
      theme: "light",
      selector: themeSelector("light"),
      css: createThemeCss(output, "light", namespace),
    },
    {
      fileName: "theme-dark.css",
      theme: "dark",
      selector: themeSelector("dark"),
      css: createThemeCss(output, "dark", namespace),
    },
    {
      fileName: "theme-high-contrast.css",
      theme: "highContrast",
      selector: themeSelector("highContrast"),
      css: createThemeCss(output, "highContrast", namespace),
    },
    {
      fileName: "theme-high-contrast-dark.css",
      theme: "highContrastDark",
      selector: themeSelector("highContrastDark"),
      css: createThemeCss(output, "highContrastDark", namespace),
    },
  ];
}

export function inferNamespace(output: EngineOutput): string {
  const primitiveNames = new Set(Object.keys(output.primitives.srgb));

  for (const semanticValue of Object.values(output.semantic.light)) {
    const namespace = namespaceFromSemanticValue(semanticValue, primitiveNames);

    if (namespace !== undefined) {
      return namespace;
    }
  }

  return "ds";
}

function namespaceFromSemanticValue(
  value: string,
  primitiveNames: ReadonlySet<string>,
): string | undefined {
  const match = /^var\(--(.+)\)$/.exec(value);

  if (!match) {
    return undefined;
  }

  const tokenReference = match[1] ?? "";

  for (const primitiveName of primitiveNames) {
    const suffix = `-${primitiveName}`;

    if (tokenReference.endsWith(suffix)) {
      return tokenReference.slice(0, -suffix.length);
    }
  }

  return undefined;
}

function themeSelector(theme: SemanticThemeKey): ThemeCssSelector {
  switch (theme) {
    case "light":
      return ":root,\n[data-theme=\"light\"]";
    case "dark":
      return "[data-theme=\"dark\"]";
    case "highContrast":
      return "[data-theme=\"high-contrast\"]";
    case "highContrastDark":
      return "[data-theme=\"high-contrast-dark\"]";
  }
}

function customPropertyName(namespace: string, name: string): `--${string}` {
  return `--${namespace}-${name}`;
}

function createCssRule(
  selector: string,
  declarations: readonly (readonly [string, string])[],
): string {
  return `${selector} {\n${formatDeclarations(declarations)}\n}`;
}

function formatDeclarations(
  declarations: readonly (readonly [string, string])[],
): string {
  return declarations
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");
}

function indentCss(css: string): string {
  return css
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function primitiveEntries<T extends string>(
  record: Partial<Record<PrimitiveTokenName, T>>,
): readonly (readonly [PrimitiveTokenName, T])[] {
  return Object.entries(record)
    .filter((entry): entry is [PrimitiveTokenName, T] => entry[1] !== undefined)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
}

function semanticEntries(
  record: Record<SemanticTokenName, `var(--${string})`>,
): readonly (readonly [SemanticTokenName, `var(--${string})`])[] {
  return (Object.entries(record) as [SemanticTokenName, `var(--${string})`][])
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
}
