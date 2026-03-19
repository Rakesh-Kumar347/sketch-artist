import { NextRequest, NextResponse } from "next/server";
import { analyzeComplexity, calculatePrice, PRICING } from "@/lib/complexity";
import { detectObjects } from "@/lib/objectDetection";
import type { SizeKey } from "@/lib/complexity";

// COCO-SSD model loading can take 10–20s on cold start
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const size = (formData.get("size") as SizeKey) || "A4";
    const isRush = formData.get("rush") === "true";

    // subjectOverride: if user manually overrides the auto-detected count
    const subjectOverride = formData.get("subjectOverride") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Run both in parallel: Sharp complexity + COCO-SSD detection
    const [complexity, detection] = await Promise.all([
      analyzeComplexity(buffer),
      detectObjects(buffer),
    ]);

    // Use override if provided, otherwise use auto-detected subject key
    const subjectKey = (subjectOverride as "1" | "2" | "3" | "4+") || detection.subjectKey;

    // Boost complexity score if background is complex (lots of non-subject objects)
    if (detection.backgroundComplexity > 0.4) {
      const boost = Math.round(detection.backgroundComplexity * 10);
      complexity.score = Math.min(complexity.score + boost, 100);
    }

    const pricing = calculatePrice(size, complexity.level, subjectKey, isRush);

    return NextResponse.json({
      complexity,
      pricing,
      detection,
      currency: PRICING.currency,
      sizes: PRICING.basePrices,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
