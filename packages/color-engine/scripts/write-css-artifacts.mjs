import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createColorEngineCssArtifacts,
  createColorEngineTheme,
} from "../dist/index.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(packageRoot, process.argv[2] ?? ".generated/default");
const themeOutput = createColorEngineTheme();
const artifacts = createColorEngineCssArtifacts(themeOutput);
const manifest = artifacts.map(({ css: _css, ...metadata }) => metadata);

await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  artifacts.map((artifact) =>
    writeFile(resolve(outputDirectory, artifact.fileName), artifact.css, "utf8"),
  ),
);

await writeFile(
  resolve(outputDirectory, "manifest.json"),
  `${JSON.stringify({ files: manifest }, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${artifacts.length} CSS artifacts to ${outputDirectory}`);
