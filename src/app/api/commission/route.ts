import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { analyzeComplexity, calculatePrice } from "@/lib/complexity";
import type { SizeKey, SubjectKey } from "@/lib/complexity";
import { saveOrder } from "@/lib/orderStore";
import { newOrderToAdmin, newOrderToCustomer } from "@/lib/mailer";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name     = formData.get("name")     as string;
    const email    = formData.get("email")    as string;
    const phone    = formData.get("phone")    as string;
    const size     = (formData.get("size")    as SizeKey)    || "A4";
    const subjects = (formData.get("subjects") as SubjectKey) || "1";
    const isRush   = formData.get("rush") === "true";
    const notes    = formData.get("notes")    as string;
    const file     = formData.get("image")    as File;

    if (!name || !email || !file) {
      return NextResponse.json(
        { error: "Name, email, and image are required" },
        { status: 400 }
      );
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const complexity = await analyzeComplexity(buffer);
    const pricing    = calculatePrice(size, complexity.level, subjects, isRush);

    const { url: referenceUrl, publicId } = await uploadToCloudinary(
      buffer,
      "sketch-artist/references"
    );

    const order = await saveOrder({
      id: `ORD-${Date.now()}`,
      name,
      email,
      phone,
      size,
      subjects,
      isRush,
      notes,
      referenceUrl,
      referencePublicId: publicId,
      complexity: complexity.level,
      complexityScore: complexity.score,
      estimatedPrice: pricing.finalPrice,
      currency: "₹",
      submittedAt: new Date().toISOString(),
    });

    // Send emails (non-critical — never fail the request)
    Promise.allSettled([
      newOrderToAdmin(order),
      newOrderToCustomer(order),
    ]).then((results) => {
      results.forEach((r) => {
        if (r.status === "rejected") console.warn("Email error:", r.reason);
      });
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Commission error:", error);
    return NextResponse.json(
      { error: "Failed to submit commission" },
      { status: 500 }
    );
  }
}
