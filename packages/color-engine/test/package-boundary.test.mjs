import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

test("package is published under the puzzlefactory color-engine name", () => {
  assert.equal(packageJson.name, "@puzzlefactory/color-engine");
});

test("package declares no runtime dependencies", () => {
  assert.ok(!("dependencies" in packageJson), "dependencies must be absent");
  assert.ok(
    !("peerDependencies" in packageJson),
    "peerDependencies must be absent until explicitly justified",
  );
  assert.ok(
    !("optionalDependencies" in packageJson),
    "optionalDependencies must be absent",
  );
});

test("package exposes the built public entrypoint", () => {
  assert.deepEqual(packageJson.exports, {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    },
  });
  assert.equal(packageJson.types, "./dist/index.d.ts");
});
