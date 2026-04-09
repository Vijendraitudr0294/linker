import { describe, expect, it } from "vitest";
import { selectThemeBackground } from "@/lib/colorExtractor";

type ScoredColor = {
  rgb: { r: number; g: number; b: number };
  hex: string;
  sat: number;
  lum: number;
  count: number;
  weight: number;
};

describe("selectThemeBackground", () => {
  it("prefers colored edge canvas over dominant white content", () => {
    const scored: ScoredColor[] = [
      { rgb: { r: 247, g: 247, b: 247 }, hex: "#f7f7f7", sat: 0.01, lum: 0.94, count: 5400, weight: 5416 },
      { rgb: { r: 159, g: 222, b: 194 }, hex: "#9fdec2", sat: 0.42, lum: 0.63, count: 2200, weight: 2477 },
      { rgb: { r: 18, g: 18, b: 18 }, hex: "#121212", sat: 0.0, lum: 0.01, count: 900, weight: 900 },
    ];
    const edges = new Array(20).fill("#9fdec2").concat(new Array(8).fill("#f7f7f7"));

    const bg = selectThemeBackground(scored, edges);
    expect(bg.hex).toBe("#9fdec2");
  });

  it("keeps dominant when edges do not strongly indicate another canvas", () => {
    const scored: ScoredColor[] = [
      { rgb: { r: 235, g: 235, b: 235 }, hex: "#ebebeb", sat: 0.01, lum: 0.88, count: 4500, weight: 4510 },
      { rgb: { r: 173, g: 173, b: 173 }, hex: "#adadad", sat: 0.01, lum: 0.46, count: 2300, weight: 2305 },
      { rgb: { r: 90, g: 180, b: 255 }, hex: "#5ab4ff", sat: 0.8, lum: 0.43, count: 600, weight: 744 },
    ];
    const edges = new Array(20).fill("#ebebeb").concat(new Array(4).fill("#adadad"));

    const bg = selectThemeBackground(scored, edges);
    expect(bg.hex).toBe("#ebebeb");
  });

  it("ignores dark phone-frame edges when center zones show app canvas color", () => {
    const scored: ScoredColor[] = [
      { rgb: { r: 10, g: 10, b: 10 }, hex: "#0a0a0a", sat: 0.0, lum: 0.01, count: 3000, weight: 3000 },
      { rgb: { r: 158, g: 222, b: 194 }, hex: "#9edec2", sat: 0.43, lum: 0.62, count: 2600, weight: 2935 },
      { rgb: { r: 245, g: 245, b: 245 }, hex: "#f5f5f5", sat: 0.01, lum: 0.93, count: 2200, weight: 2206 },
    ];
    const edges = new Array(24).fill("#0a0a0a").concat(new Array(8).fill("#f5f5f5"));
    const zones = new Array(28).fill("#9edec2").concat(new Array(6).fill("#f5f5f5"));

    const bg = selectThemeBackground(scored, edges, zones);
    expect(bg.hex).toBe("#9edec2");
  });
});
