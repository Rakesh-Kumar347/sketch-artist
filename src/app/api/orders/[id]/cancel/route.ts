import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { updateOrderStatus } from "@/lib/orderStore";
import { orderCancelledToCustomer } from "@/lib/mailer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email } = (await req.json()) as { email: string };

  if (!email || !id) {
    return NextResponse.json({ error: "Order ID and email are required" }, { status: 400 });
  }

  // Verify the order belongs to this email
  const { data: row, error } = await createAdminClient()
    .from("orders")
    .select("id, email, status")
    .eq("id", id)
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (row.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending orders can be cancelled" },
      { status: 400 }
    );
  }

  const updated = await updateOrderStatus(id, "cancelled");
  if (!updated) {
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }

  orderCancelledToCustomer(updated).catch((e) =>
    console.warn("Cancel email error:", e)
  );

  return NextResponse.json({ order: updated });
}
