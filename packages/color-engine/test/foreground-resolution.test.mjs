import assert from "node:assert/strict";
import test from "node:test";
import {
  parseColorSeed,
  resolveContrastForeground,
} from "../dist/index.js";

function token(name, seed) {
  return {
    name,
    value: seed,
    oklch: parseColorSeed(seed),
    description: name,
  };
}

const white = token("white", "oklch(0.995 0 0)");
const midSurface = token("mid-surface", "oklch(0.7 0 0)");
const quietDark = token("quiet-dark", "oklch(0.58 0 0)");
const secondaryDark = token("secondary-dark", "oklch(0.38 0 0)");
const strongDark = token("strong-dark", "oklch(0.03 0 0)");

test("selects the first caller-ordered candidate that passes every background", () => {
  const result = resolveContrastForeground({
    backgrounds: [white],
    candidates: [quietDark, secondaryDark, strongDark],
    threshold: 80,
  });

  assert.equal(result.token.name, "secondary-dark");
  assert.equal(result.passed, true);
  assert.equal(result.candidateIndex, 1);
  assert.ok(result.minimumLc >= 80);
});

test("requires a candidate to pass across multiple backgrounds", () => {
  const result = resolveContrastForeground({
    backgrounds: [white, midSurface],
    candidates: [quietDark, secondaryDark, strongDark],
    threshold: 45,
  });

  assert.equal(result.token.name, "strong-dark");
  assert.equal(result.passed, true);
});

test("returns the strongest available fallback when no candidate passes", () => {
  const result = resolveContrastForeground({
    backgrounds: [white, midSurface],
    candidates: [quietDark, secondaryDark, strongDark],
    threshold: 110,
  });

  assert.equal(result.token.name, "strong-dark");
  assert.equal(result.passed, false);
});

test("rejects empty inputs and invalid thresholds", () => {
  assert.throws(
    () => resolveContrastForeground({ backgrounds: [], candidates: [strongDark], threshold: 60 }),
    /at least one background/,
  );
  assert.throws(
    () => resolveContrastForeground({ backgrounds: [white], candidates: [], threshold: 60 }),
    /at least one candidate/,
  );
  assert.throws(
    () => resolveContrastForeground({ backgrounds: [white], candidates: [strongDark], threshold: -1 }),
    /finite non-negative/,
  );
});
