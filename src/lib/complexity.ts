import sharp from "sharp";

export type ComplexityLevel = "simple" | "moderate" | "detailed" | "complex";

export interface ComplexityResult {
  level: ComplexityLevel;
  score: number; // 0–100
  entropy: number;
  edgeDensity: number;
  detailVariance: number;
  label: string;
  description: string;
}

/**
 * Analyzes an image buffer and returns a complexity score.
 * Uses entropy, edge density, and channel variance — all local, no API calls.
 */
export async function analyzeComplexity(
  imageBuffer: Buffer
): Promise<ComplexityResult> {
  // Resize to a standard analysis size to normalize results
  const analysisBuffer = await sharp(imageBuffer)
    .resize(512, 512, { fit: "inside" })
    .toBuffer();

  // --- 1. Entropy via Sharp stats ---
  const stats = await sharp(analysisBuffer).stats();
  // Use stdev as a proxy for entropy if entropy is not available in this version
  const channelStats = stats.channels as Array<{ stdev: number; entropy?: number }>;
  const entropy =
    channelStats.reduce((sum, ch) => sum + (ch.entropy ?? ch.stdev / 32), 0) /
    channelStats.length;

  // --- 2. Edge density via Laplacian convolution ---
  const edgeDensity = await computeEdgeDensity(analysisBuffer);

  // --- 3. Detail variance (std deviation of pixel values) ---
  const detailVariance =
    stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) /
    stats.channels.length;

  // --- Normalize each metric to 0–100 ---
  const entropyScore = Math.min((entropy / 8) * 100, 100);
  const edgeScore = Math.min(edgeDensity * 100, 100);
  const varianceScore = Math.min((detailVariance / 128) * 100, 100);

  // Weighted composite score
  const score = entropyScore * 0.4 + edgeScore * 0.35 + varianceScore * 0.25;

  // Map score to complexity level
  let level: ComplexityLevel;
  let label: string;
  let description: string;

  if (score < 30) {
    level = "simple";
    label = "Simple";
    description = "Plain background, minimal detail — quick sketch";
  } else if (score < 52) {
    level = "moderate";
    label = "Moderate";
    description = "Some background detail, medium complexity";
  } else if (score < 72) {
    level = "detailed";
    label = "Detailed";
    description = "Rich detail, complex textures or multiple subjects";
  } else {
    level = "complex";
    label = "Highly Complex";
    description = "Dense textures, hyperrealistic detail, or many elements";
  }

  return {
    level,
    score: Math.round(score),
    entropy: Math.round(entropy * 100) / 100,
    edgeDensity: Math.round(edgeDensity * 1000) / 1000,
    detailVariance: Math.round(detailVariance * 100) / 100,
    label,
    description,
  };
}

/**
 * Computes edge density using a Laplacian-style approach via Sharp's convolve.
 * Returns a normalized value 0–1.
 */
async function computeEdgeDensity(imageBuffer: Buffer): Promise<number> {
  // Convert to grayscale
  const grayBuffer = await sharp(imageBuffer).grayscale().raw().toBuffer();

  const { width, height } = await sharp(imageBuffer)
    .grayscale()
    .metadata()
    .then((m) => ({ width: m.width || 512, height: m.height || 512 }));

  // Sobel-like edge detection on raw pixel data
  let edgeSum = 0;
  const pixels = new Uint8Array(grayBuffer);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // Horizontal gradient (Sobel X)
      const gx =
        -pixels[idx - width - 1] +
        pixels[idx - width + 1] +
        -2 * pixels[idx - 1] +
        2 * pixels[idx + 1] +
        -pixels[idx + width - 1] +
        pixels[idx + width + 1];
      // Vertical gradient (Sobel Y)
      const gy =
        -pixels[idx - width - 1] +
        -2 * pixels[idx - width] +
        -pixels[idx - width + 1] +
        pixels[idx + width - 1] +
        2 * pixels[idx + width] +
        pixels[idx + width + 1];

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edgeSum += magnitude;
    }
  }

  const maxPossible = 255 * Math.sqrt(2) * width * height;
  return edgeSum / maxPossible;
}

/**
 * Pricing configuration (can be overridden from admin panel in future).
 */
export const PRICING = {
  basePrices: {
    A5: 600,
    A4: 900,
    A3: 1400,
    A2: 2200,
  },
  complexityMultipliers: {
    simple: 1.0,
    moderate: 1.4,
    detailed: 1.9,
    complex: 2.7,
  },
  subjectMultipliers: {
    "1": 1.0,
    "2": 1.3,
    "3": 1.6,
    "4+": 2.0,
  },
  rushFeeMultiplier: 1.35,
  currency: "₹",
};

export type SizeKey = keyof typeof PRICING.basePrices;
export type SubjectKey = keyof typeof PRICING.subjectMultipliers;

export function calculatePrice(
  size: SizeKey,
  complexity: ComplexityLevel,
  subjects: SubjectKey,
  isRush: boolean
): { basePrice: number; finalPrice: number; breakdown: PriceBreakdown } {
  const base = PRICING.basePrices[size];
  const complexityMult = PRICING.complexityMultipliers[complexity];
  const subjectMult = PRICING.subjectMultipliers[subjects];
  const rushMult = isRush ? PRICING.rushFeeMultiplier : 1;

  const afterComplexity = base * complexityMult;
  const afterSubjects = afterComplexity * subjectMult;
  const finalPrice = Math.round(afterSubjects * rushMult);

  return {
    basePrice: base,
    finalPrice,
    breakdown: {
      base,
      complexityMult,
      subjectMult,
      rushMult,
      afterComplexity: Math.round(afterComplexity),
      afterSubjects: Math.round(afterSubjects),
      finalPrice,
    },
  };
}

export interface PriceBreakdown {
  base: number;
  complexityMult: number;
  subjectMult: number;
  rushMult: number;
  afterComplexity: number;
  afterSubjects: number;
  finalPrice: number;
}
