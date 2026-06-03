import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

test("package is published under the puzzlefactory tokens name", () => {
  assert.equal(packageJson.name, "@puzzlefactory/tokens");
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

test("package uses color-engine only as a development type/test dependency", () => {
  assert.deepEqual(packageJson.devDependencies, {
    "@puzzlefactory/color-engine": "0.0.0",
  });
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

test("package test script includes type-level API checks", () => {
  assert.match(packageJson.scripts.test, /tsconfig\.test\.json/);
});

test("package test script builds before runtime checks", () => {
  assert.match(packageJson.scripts.test, /npm run build/);
});

test("package test script includes runtime validation checks", () => {
  assert.match(packageJson.scripts.test, /node --test test\/\*\.test\.mjs/);
});
