import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

test("package uses the puzzlefactory color-engine v2 name", () => {
  assert.equal(packageJson.name, "@puzzlefactory/color-engine");
});

test("package declares no runtime dependencies", () => {
  assert.equal("dependencies" in packageJson, false);
  assert.equal("peerDependencies" in packageJson, false);
  assert.equal("optionalDependencies" in packageJson, false);
});

test("package exposes the built public entrypoint", () => {
  assert.deepEqual(packageJson.exports, {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    },
  });
});
