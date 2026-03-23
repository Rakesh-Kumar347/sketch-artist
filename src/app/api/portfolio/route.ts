import { NextResponse } from "next/server";
import { getPortfolioImages } from "@/lib/storage";

export async function GET() {
  try {
    const images = await getPortfolioImages();
    return NextResponse.json({ images });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json({ images: [] });
  }
}
