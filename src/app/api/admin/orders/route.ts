import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, updateOrderStatus } from "@/lib/orderStore";
import type { OrderStatus } from "@/lib/orderStore";
import { verifyToken } from "@/lib/supabase";
import { orderAcceptedToCustomer, orderCompletedToCustomer } from "@/lib/mailer";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const user = await verifyToken(token);
  return user !== null;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = (await req.json()) as { id: string; status: OrderStatus };
  const updated = await updateOrderStatus(id, status);

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

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
