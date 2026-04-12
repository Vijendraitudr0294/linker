/**
 * colorExtractor.ts
 * Instant, pixel-accurate color + design style extraction from any image
 * using the browser Canvas API — zero API calls, zero latency.
 *
 * Outputs both the colour palette AND the design style attributes so a
 * perfect theme can be built WITHOUT using the image as a background.
 */

export interface ExtractedPalette {
  background: string;          // Dominant neutral color → use as bg
  primary: string;             // Most vivid/saturated → buttons/accents
  secondary: string;           // Second dominant → cards / gradient end
  card: string;                // Computed card surface color
  text: string;                // Auto-contrast: white or black
  subText: string;             // Lighter version of text color
  gradient: [string, string];  // Best two colors for gradient bg
  isDark: boolean;             // Predominantly dark palette
  contrastLevel: "low" | "medium" | "high"; // Contrast style of the design
  name: string;
  allColors: string[];         // All swatches (up to 8)
  // Design style hints derived from color analysis
  style: {
    buttonShape: "pill" | "rounded" | "square" | "shadow";
    cardStyle:   "glass" | "glass-premium" | "classic" | "neon";
    hasBoldAccent: boolean;   // Strong single accent color
    hasGradient:  boolean;   // Multiple distinct colors → gradient bg
    isMinimal:    boolean;   // Very low saturation throughout
    isVibrant:    boolean;   // High saturation, rich colors
    isMonochrome: boolean;   // All colors in same hue family
    isMusicUi:    boolean;   // Playlist-like UI: pastel shell + colorful list accents
  };
}

interface RGB { r: number; g: number; b: number }
type ScoredColor = {
  rgb: RGB;
  hex: string;
  sat: number;
  lum: number;
  count: number;
  weight: number;
};

// ── Colour math ───────────────────────────────────────────────────────────────

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")
  ).join("");
}

function luminance(r: number, g: number, b: number): number {
  return [r, g, b].reduce((acc, c, i) => {
    const s = c / 255;
    const v = s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    return acc + v * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

function contrastRatio(l1: number, l2: number): number {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function isNearNeutral(hex: string, sat: number): boolean {
  if (sat > 0.14) return false;
  const { r, g, b } = hexToRgb(hex);
  return Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && Math.abs(r - b) < 18;
}

/** RGB distance of two hex colors */
function hexDistance(h1: string, h2: string): number {
  return colorDistance(hexToRgb(h1), hexToRgb(h2));
}

/** Blend hex color toward another hex by t (0-1) */
function blendHex(a: string, b: string, t: number): string {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  return rgbToHex(
    ra.r + (rb.r - ra.r) * t,
    ra.g + (rb.g - ra.g) * t,
    ra.b + (rb.b - ra.b) * t,
  );
}

/** Lighten (positive amount) or darken (negative) a hex color */
function nudge(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

/**
 * Prefer a "canvas" color over content-white when screenshots contain large white cards/lists.
 * This keeps generated themes closer to the uploaded UI mood (e.g., mint/pastel shells).
 */
export function selectThemeBackground(
  scored: ScoredColor[],
  edgeHexes: string[],
  zoneHexes: string[] = []
): ScoredColor {
  const fallback = scored[0];
  if (!fallback) throw new Error("No scored colors");
  if (edgeHexes.length === 0 && zoneHexes.length === 0) return fallback;

  // Edge hits can be polluted by phone/device frames; center-zone hits capture app canvas.
  const hitMap = scored.map((color) => ({
    color,
    edgeHits: edgeHexes.filter((hex) => hexDistance(hex, color.hex) <= 28).length,
    zoneHits: zoneHexes.filter((hex) => hexDistance(hex, color.hex) <= 28).length,
  }));
  const scoredHits = hitMap.map((h) => ({
    ...h,
    score: h.zoneHits * 2 + h.edgeHits,
  }));
  const best = [...scoredHits].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.zoneHits !== a.zoneHits) return b.zoneHits - a.zoneHits;
    return b.color.count - a.color.count;
  })[0];

  const minEvidence = Math.max(4, Math.floor((edgeHexes.length + zoneHexes.length) * 0.08));
  if (!best || best.score < minEvidence) {
    return fallback;
  }

  // If dominant is a neutral white/gray and edge color is more chromatic, prefer edge.
  const dominantIsNeutral = isNearNeutral(fallback.hex, fallback.sat) && fallback.lum > 0.84;
  const candidateIsUsable = best.color.sat > 0.16 || best.color.lum < 0.8;
  if (dominantIsNeutral && candidateIsUsable) return best.color;

  // Also prefer edge when it clearly has stronger presence than dominant near edges.
  const dominant = scoredHits.find((e) => e.color.hex === fallback.hex);
  const dominantScore = dominant ? dominant.score : 0;
  if (best.score - dominantScore >= 4) return best.color;

  return fallback;
}

// ── K-means ───────────────────────────────────────────────────────────────────

function kMeans(pixels: RGB[], k: number, iterations = 10): { centroid: RGB; count: number }[] {
  if (pixels.length === 0) return [];
  const step = Math.floor(pixels.length / k);
  let centroids: RGB[] = Array.from({ length: k }, (_, i) => ({ ...pixels[Math.min(i * step, pixels.length - 1)] }));

  let clusters: RGB[][] = [];
  for (let iter = 0; iter < iterations; iter++) {
    clusters = Array.from({ length: k }, () => []);
    for (const px of pixels) {
      let best = 0, bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = colorDistance(px, centroids[c]);
        if (d < bestDist) { bestDist = d; best = c; }
      }
      clusters[best].push(px);
    }
    centroids = clusters.map((cluster, ci) => {
      if (cluster.length === 0) return centroids[ci];
      const s = cluster.reduce((a, p) => ({ r: a.r + p.r, g: a.g + p.g, b: a.b + p.b }), { r: 0, g: 0, b: 0 });
      return { r: s.r / cluster.length, g: s.g / cluster.length, b: s.b / cluster.length };
    });
  }
  return centroids.map((c, i) => ({ centroid: c, count: clusters[i]?.length || 0 }));
}

// ── Name generator ────────────────────────────────────────────────────────────

function nameFromPalette(isDark: boolean, primary: RGB, isVibrant: boolean, isMinimal: boolean): string {
  const { r, g, b } = primary;
  const hue = ((Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI) % 360 + 360) % 360;
  const colorWord =
    hue < 20 ? "Ruby" : hue < 45 ? "Amber" : hue < 75 ? "Gold" :
    hue < 105 ? "Lime" : hue < 150 ? "Emerald" : hue < 195 ? "Teal" :
    hue < 240 ? "Cobalt" : hue < 270 ? "Violet" : hue < 300 ? "Fuchsia" :
    hue < 330 ? "Rose" : "Crimson";
  const mood = isDark
    ? (isVibrant ? ["Neon", "Electric", "Pulse"][Math.floor(Math.random() * 3)] : ["Midnight", "Shadow", "Eclipse", "Noir"][Math.floor(Math.random() * 4)])
    : (isMinimal ? ["Bare", "Pure", "Clean"][Math.floor(Math.random() * 3)]     : ["Bloom", "Lush", "Daybreak", "Aura"][Math.floor(Math.random() * 4)]);
  return `${mood} ${colorWord}`;
}

// ── Main extract function ─────────────────────────────────────────────────────

export async function extractPaletteFromImage(dataUrl: string): Promise<ExtractedPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const SIZE = 96; // Slightly larger for better style analysis
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
        const data = imageData.data;

        // Sample every 3rd pixel
        const pixels: RGB[] = [];
        for (let i = 0; i < data.length; i += 12) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 100) continue;
          pixels.push({ r, g, b });
        }
        if (pixels.length === 0) { reject(new Error("No valid pixels")); return; }

        // ── K-means: 8 clusters, weighted by cluster size ─────────────────────
        const k = Math.min(8, pixels.length);
        const clusters = kMeans(pixels, k);

        // Sort by cluster size (most dominant first)
        const sorted = clusters
          .filter(c => c.count > 0)
          .sort((a, b) => b.count - a.count);

        const scored: ScoredColor[] = sorted.map(c => ({
          rgb:   c.centroid,
          hex:   rgbToHex(c.centroid.r, c.centroid.g, c.centroid.b),
          sat:   saturation(c.centroid.r, c.centroid.g, c.centroid.b),
          lum:   luminance(c.centroid.r, c.centroid.g, c.centroid.b),
          count: c.count,
          weight: c.count * (1 + (saturation(c.centroid.r, c.centroid.g, c.centroid.b) > 0.15 ? 0.35 : 0)), // Only boost if it's actually chromatic
        }));

        // ── Color roles ───────────────────────────────────────────────────────

        // Edge sampling helps detect the real UI canvas (avoids white-content dominance).
        const edgeHexes: string[] = [];
        const idx = (x: number, y: number) => (y * SIZE + x) * 4;
        for (let i = 0; i < SIZE; i += 4) {
          const points: [number, number][] = [
            [i, 0],
            [i, SIZE - 1],
            [0, i],
            [SIZE - 1, i],
          ];
          for (const [x, y] of points) {
            const p = idx(x, y);
            const a = data[p + 3];
            if (a >= 100) edgeHexes.push(rgbToHex(data[p], data[p + 1], data[p + 2]));
          }
        }

        // Interior zones (avoid frame edges): top band + side center bands.
        const zoneHexes: string[] = [];
        const sampleRect = (x0: number, x1: number, y0: number, y1: number) => {
          for (let y = y0; y < y1; y += 3) {
            for (let x = x0; x < x1; x += 3) {
              const p = idx(x, y);
              const a = data[p + 3];
              if (a >= 100) zoneHexes.push(rgbToHex(data[p], data[p + 1], data[p + 2]));
            }
          }
        };
        sampleRect(Math.floor(SIZE * 0.16), Math.floor(SIZE * 0.84), Math.floor(SIZE * 0.08), Math.floor(SIZE * 0.32)); // top UI shell
        sampleRect(Math.floor(SIZE * 0.16), Math.floor(SIZE * 0.84), Math.floor(SIZE * 0.40), Math.floor(SIZE * 0.60)); // center body

        // Background: prefer true canvas tone over dominant white content regions.
        const bgCandidate = selectThemeBackground(scored, edgeHexes, zoneHexes);
        const bg = bgCandidate.hex;

        // Primary accent: Usually the most vibrant, BUT if white/black is the dominant UI element color, prefer it.
        // We look for the "loudest" non-background color.
        const nonBgColors = scored.filter(s => hexDistance(s.hex, bg) > 35);
        
        // Find most saturated
        const mostVibrant = [...nonBgColors].sort((a, b) => b.sat - a.sat)[0];
        // Find most frequent
        const mostFrequent = [...nonBgColors].sort((a, b) => b.count - a.count)[0];

        // If the most frequent is a neutral (white/black) and has significantly more presence than the vibrant one, 
        // it's likely the button/UI color.
        const primaryCandidate = (mostFrequent && (mostFrequent.lum > 0.92 || mostFrequent.lum < 0.08) && (mostFrequent.count > (mostVibrant?.count || 0) * 1.5))
          ? mostFrequent 
          : (mostVibrant || scored[0]);

        // Secondary: second-distinct color
        const secondaryCandidate = scored
          .filter(s => hexDistance(s.hex, primaryCandidate.hex) > 40 && hexDistance(s.hex, bg) > 30)
          .sort((a, b) => b.weight - a.weight)[0]
          || (mostVibrant && mostVibrant.hex !== primaryCandidate.hex ? mostVibrant : scored[1])
          || scored[0];

        const primary = primaryCandidate.hex;
        const secondary = secondaryCandidate.hex;
        const isDark    = bgCandidate.lum < 0.30;

        // ── Text color (auto-contrast) ────────────────────────────────────────
        // Designer Fix: Text MUST be readable against the CARD, not just the BG.
        // If the card is light glass/white, we must use dark text regardless of BG.
        const isCardLight = !isDark; // In this extractor, non-dark themes use white cards
        const text = isCardLight ? "#0f172a" : "#ffffff";
        const subText = isCardLight ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.6)";

        // ── Card surface color ────────────────────────────────────────────────
        // Glass (dark): slightly lighter than bg, semi-transparent
        // Classic (light): white with slight tint from bg
        const card = isDark
          ? `rgba(${hexToRgb(nudge(bg, 20)).r},${hexToRgb(nudge(bg, 20)).g},${hexToRgb(nudge(bg, 20)).b},0.78)`
          : `rgba(255,255,255,${bgCandidate.sat > 0.2 ? "0.92" : "0.9"})`;

        // ── Gradient ─────────────────────────────────────────────────────────
        // Use bg → secondary if they're distinct enough, else bg → primary
        const gradDist = hexDistance(bg, secondary);
        const gradient: [string, string] = gradDist > 45
          ? [bg, secondary]
          : [bg, blendHex(bg, primary, 0.4)];

        // ── Button text contrast against primary ──────────────────────────────
        const pLum = primaryCandidate.lum;
        const btnTextColor = contrastRatio(pLum, wL) >= contrastRatio(pLum, bL) ? "#ffffff" : "#000000";

        // ── Design style analysis ─────────────────────────────────────────────

        const avgSat = scored.reduce((s, c) => s + c.sat, 0) / scored.length;
        const maxSat  = Math.max(...scored.map(c => c.sat));
        const isMinimal  = avgSat < 0.12;
        const isVibrant  = avgSat > 0.45 || maxSat > 0.65;
        const hasBoldAccent = primaryCandidate.sat > 0.55 && primaryCandidate.sat > avgSat * 2;
        const pastelCount = scored.filter((c) => c.lum > 0.6 && c.lum < 0.92 && c.sat > 0.16 && c.sat < 0.58).length;
        const accentCount = scored.filter((c) => c.sat > 0.18 && c.count / pixels.length > 0.04).length;
        const isMusicUi = !isDark && pastelCount >= 3 && accentCount >= 3;

        // Gradient: 2+ dominant colors that are very different from each other
        const topColors = scored.slice(0, 4).map(s => s.hex);
        const maxPairDist = topColors.reduce((max, a, i) =>
          topColors.slice(i + 1).reduce((m, b) => Math.max(m, hexDistance(a, b)), max), 0);
        const hasGradient = maxPairDist > 80;

        // Monochrome: all hues are within 40° of each other
        const hues = scored
          .filter(s => s.sat > 0.1)
          .map(s => {
            const { r, g, b: bl } = s.rgb;
            return ((Math.atan2(Math.sqrt(3) * (g - bl), 2 * r - g - bl) * 180 / Math.PI) % 360 + 360) % 360;
          });
        const hueRange = hues.length >= 2
          ? hues.reduce((max, h) => Math.max(max, Math.abs(h - hues[0])), 0)
          : 0;
        const isMonochrome = hueRange < 45 && hues.length >= 2;

        // Button shape: If background is a photo tone or minimalist, 'pill' is the premium default.
        const buttonShape: ExtractedPalette["style"]["buttonShape"] =
          isMusicUi           ? "rounded" :
          (isDark && isVibrant) || hasBoldAccent ? "pill" :
          // If buttons are white/black (determined by primaryCandidate) and background is chromatic, go pill
          ((primaryCandidate.lum > 0.9 || primaryCandidate.lum < 0.1) && !isMinimal) ? "pill" :
          isMinimal           ? "square" : "rounded";

        // Card style: glass for dark/photo, classic for pure minimal
        const cardStyle: ExtractedPalette["style"]["cardStyle"] =
          isMusicUi           ? "classic" :
          isDark || isVibrant ? "glass-premium" :
          // If we have a chromatic background (likely a photo or rich color), glass looks better
          (bgCandidate.sat > 0.1 || bgCandidate.lum < 0.8) ? "glass" :
                                "classic";

        const contrastLevel: ExtractedPalette["contrastLevel"] =
          bgCandidate.lum > 0.7 || bgCandidate.lum < 0.05 ? "high" :
          bgCandidate.lum > 0.5 || bgCandidate.lum < 0.15 ? "medium" : "low";

        const name = nameFromPalette(isDark, primaryCandidate.rgb, isVibrant, isMinimal);

        resolve({
          background: bg,
          primary,
          secondary,
          card,
          text,
          subText,
          gradient,
          isDark,
          contrastLevel,
          name,
          allColors: scored.map(s => s.hex).filter((c, i, a) => a.indexOf(c) === i).slice(0, 8),
          style: {
            buttonShape,
            cardStyle,
            hasBoldAccent,
            hasGradient,
            isMinimal,
            isVibrant,
            isMonochrome,
            isMusicUi,
          },
        });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.crossOrigin = "anonymous";
    img.src = dataUrl;
  });
}
