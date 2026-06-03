import type { EngineOutput } from "@puzzlefactory/color-engine-1";
import type {
  ThemeCssFileName,
  ThemeCssSelector,
  TokenCssFileName,
  TokenCssFiles,
  TokenCssRenderResult,
  TokenCssThemeFile,
} from "../src/index.js";
import {
  createPrimitiveTokenCss,
  createP3TokenCss,
  createThemeCss,
  createThemeCssFiles,
  createTokenCssFiles,
  createTokenCssOutput,
  inferNamespace,
} from "../src/index.js";

type Assert<T extends true> = T;
type IsAssignable<T, U> = T extends U ? true : false;

declare const output: EngineOutput;

const fileName: TokenCssFileName = "theme-high-contrast-dark.css";
const themeFileName: ThemeCssFileName = "theme-light.css";
const selector: ThemeCssSelector = ":root,\n[data-theme=\"light\"]";
const files: TokenCssFiles = createTokenCssFiles(output);
const renderResult: TokenCssRenderResult = createTokenCssOutput(output);
const themeFiles: readonly TokenCssThemeFile[] = createThemeCssFiles(output);
const primitiveCss: string = createPrimitiveTokenCss(output);
const p3Css: string = createP3TokenCss(output);
const lightCss: string = createThemeCss(output, "light");
const namespace: string = inferNamespace(output);

void fileName;
void themeFileName;
void selector;
void files;
void renderResult;
void themeFiles;
void primitiveCss;
void p3Css;
void lightCss;
void namespace;

type _TokenFilesIncludeP3 = Assert<IsAssignable<"tokens-p3.css", TokenCssFileName>>;
type _ThemeFilesExcludePrimitive = Assert<
  IsAssignable<"tokens.css", ThemeCssFileName> extends false ? true : false
>;
