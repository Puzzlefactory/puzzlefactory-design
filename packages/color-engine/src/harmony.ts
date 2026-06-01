import type { HarmonyStrategy, Mood, PaletteSlot } from "./index.js";
import { moodScale } from "./ramp.js";

export type HarmonyPaletteSlot =
  | "palette-a"
  | "palette-b"
  | "palette-c"
  | "palette-a-mid"
  | "palette-a-subtle";

export interface HarmonyPaletteDescriptor {
  readonly slot: HarmonyPaletteSlot;
  readonly hue: number;
  readonly chromaScale: number;
}

export interface DeriveHarmonyOptions {
  readonly hue: number;
  readonly strategy: HarmonyStrategy;
  readonly mood?: Mood;
}

export function deriveHarmony(options: DeriveHarmonyOptions): readonly HarmonyPaletteDescriptor[] {
  const hue = normalizeHue(options.hue);
  const scale = moodScale(options.mood ?? "vibrant");

  switch (options.strategy) {
    case "complementary":
      return [
        createDescriptor("palette-a", hue, scale),
        createDescriptor("palette-b", hue + 180, scale),
      ];
    case "analogous":
      return [
        createDescriptor("palette-a", hue, scale),
        createDescriptor("palette-b", hue - 30, scale),
        createDescriptor("palette-c", hue + 30, scale),
      ];
    case "triadic":
      return [
        createDescriptor("palette-a", hue, scale),
        createDescriptor("palette-b", hue + 120, scale),
        createDescriptor("palette-c", hue + 240, scale),
      ];
    case "split-complementary":
      return [
        createDescriptor("palette-a", hue, scale),
        createDescriptor("palette-b", hue + 150, scale),
        createDescriptor("palette-c", hue + 210, scale),
      ];
    case "monochromatic":
      return [
        createDescriptor("palette-a", hue, 1),
        createDescriptor("palette-a-mid", hue, 0.5),
        createDescriptor("palette-a-subtle", hue, 0.2),
      ];
  }
}

export function isHarmonyPaletteSlot(slot: PaletteSlot): slot is HarmonyPaletteSlot {
  return (
    slot === "palette-a" ||
    slot === "palette-b" ||
    slot === "palette-c" ||
    slot === "palette-a-mid" ||
    slot === "palette-a-subtle"
  );
}

function createDescriptor(
  slot: HarmonyPaletteSlot,
  hue: number,
  chromaScale: number,
): HarmonyPaletteDescriptor {
  return {
    slot,
    hue: normalizeHue(hue),
    chromaScale,
  };
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}
