import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { analyzeComplexity, calculatePrice } from "@/lib/complexity";
import type { SizeKey, SubjectKey } from "@/lib/complexity";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const size = (formData.get("size") as SizeKey) || "A4";
    const subjects = (formData.get("subjects") as SubjectKey) || "1";
    const isRush = formData.get("rush") === "true";
    const notes = formData.get("notes") as string;
    const file = formData.get("image") as File;

    if (!name || !email || !file) {
      return NextResponse.json(
        { error: "Name, email, and image are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Analyze complexity
    const complexity = await analyzeComplexity(buffer);
    const pricing = calculatePrice(size, complexity.level, subjects, isRush);

    // Upload reference image to Cloudinary (temporary folder, auto-expires conceptually)
    const { url: referenceUrl, publicId } = await uploadToCloudinary(
      buffer,
      "sketch-artist/references"
    );

    // In a real app, save to DB here. We'll return order summary.
    const order = {
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
    };

    // Try to send email notification (optional — won't fail the request)
    try {
      await sendOrderEmail(order);
    } catch (emailErr) {
      console.warn("Email send failed (non-critical):", emailErr);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Commission error:", error);
    return NextResponse.json(
      { error: "Failed to submit commission" },
      { status: 500 }
    );
  }
}

async function sendOrderEmail(order: Record<string, unknown>) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const artistEmail = process.env.ARTIST_EMAIL;

  if (!emailUser || !emailPass || !artistEmail) return;

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });

  await transporter.sendMail({
    from: emailUser,
    to: artistEmail,
    subject: `New Commission Request - ${order.id}`,
    html: `
      <h2>New Commission Request</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.name} (${order.email})</p>
      <p><strong>Phone:</strong> ${order.phone || "Not provided"}</p>
      <p><strong>Size:</strong> ${order.size}</p>
      <p><strong>Subjects:</strong> ${order.subjects}</p>
      <p><strong>Rush:</strong> ${order.isRush ? "Yes" : "No"}</p>
      <p><strong>Complexity:</strong> ${order.complexity} (score: ${order.complexityScore})</p>
      <p><strong>Estimated Price:</strong> ₹${order.estimatedPrice}</p>
      <p><strong>Notes:</strong> ${order.notes || "None"}</p>
      <p><strong>Reference Image:</strong> <a href="${order.referenceUrl}">View Image</a></p>
    `,
  });

  // Confirmation to customer
  await transporter.sendMail({
    from: emailUser,
    to: order.email as string,
    subject: `Commission Request Received - ${order.id}`,
    html: `
      <h2>Thank you for your commission request!</h2>
      <p>Hi ${order.name},</p>
      <p>We've received your request. Here's a summary:</p>
      <ul>
        <li><strong>Order ID:</strong> ${order.id}</li>
        <li><strong>Size:</strong> ${order.size}</li>
        <li><strong>Complexity:</strong> ${order.complexity}</li>
        <li><strong>Estimated Price:</strong> ₹${order.estimatedPrice}</li>
      </ul>
      <p>The artist will review your reference image and confirm the final price shortly.</p>
      <p>Thank you for choosing us!</p>
    `,
  });
}
