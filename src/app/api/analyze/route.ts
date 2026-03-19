import { NextRequest, NextResponse } from "next/server";
import { analyzeComplexity, calculatePrice, PRICING } from "@/lib/complexity";
import type { SizeKey, SubjectKey } from "@/lib/complexity";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const size = (formData.get("size") as SizeKey) || "A4";
    const subjects = (formData.get("subjects") as SubjectKey) || "1";
    const isRush = formData.get("rush") === "true";

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const complexity = await analyzeComplexity(buffer);
    const pricing = calculatePrice(size, complexity.level, subjects, isRush);

    return NextResponse.json({
      complexity,
      pricing,
      sizes: PRICING.basePrices,
      currency: PRICING.currency,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
