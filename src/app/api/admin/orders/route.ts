import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, updateOrderStatus } from "@/lib/orderStore";
import type { OrderStatus } from "@/lib/orderStore";
import { orderAcceptedToCustomer, orderCompletedToCustomer } from "@/lib/mailer";

function isAuthed(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = (await req.json()) as { id: string; status: OrderStatus };
  const updated = await updateOrderStatus(id, status);

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Fire status-change emails (non-critical)
  if (status === "in_progress") {
    orderAcceptedToCustomer(updated).catch((e) =>
      console.warn("orderAccepted email error:", e)
    );
  } else if (status === "completed") {
    orderCompletedToCustomer(updated).catch((e) =>
      console.warn("orderCompleted email error:", e)
    );
  }

  return NextResponse.json({ order: updated });
}
