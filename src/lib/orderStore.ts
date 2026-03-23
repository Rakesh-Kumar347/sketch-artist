/**
 * Order store with dual backend:
 *  - Vercel KV (Redis) when KV_REST_API_URL is set → production on Vercel
 *  - Local JSON file otherwise → local development
 */

export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Order {
  id: string;
  name: string;
  email: string;
  phone?: string;
  size: string;
  subjects: string;
  isRush: boolean;
  notes?: string;
  referenceUrl: string;
  referencePublicId: string;
  complexity: string;
  complexityScore: number;
  estimatedPrice: number;
  currency: string;
  status: OrderStatus;
  submittedAt: string;
  updatedAt: string;
}

const KV_KEY = "orders";
const useKV = () => Boolean(process.env.KV_REST_API_URL);

// ─── KV backend ───────────────────────────────────────────────────────────────

async function kvRead(): Promise<Order[]> {
  const { kv } = await import("@vercel/kv");
  return (await kv.get<Order[]>(KV_KEY)) ?? [];
}

async function kvWrite(orders: Order[]): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set(KV_KEY, orders);
}

// ─── File backend (local dev) ─────────────────────────────────────────────────

function fileRead(): Order[] {
  const fs = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");
  const file = path.join(process.cwd(), "data", "orders.json");
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as Order[];
  } catch {
    return [];
  }
}

function fileWrite(orders: Order[]): void {
  const fs = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");
  const file = path.join(process.cwd(), "data", "orders.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(orders, null, 2));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function saveOrder(order: Omit<Order, "status" | "updatedAt">): Promise<Order> {
  const full: Order = { ...order, status: "pending", updatedAt: new Date().toISOString() };
  if (useKV()) {
    const orders = await kvRead();
    orders.unshift(full);
    await kvWrite(orders);
  } else {
    const orders = fileRead();
    orders.unshift(full);
    fileWrite(orders);
  }
  return full;
}

export async function getAllOrders(): Promise<Order[]> {
  return useKV() ? kvRead() : fileRead();
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  if (useKV()) {
    const orders = await kvRead();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    await kvWrite(orders);
    return orders[idx];
  } else {
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const file = path.join(process.cwd(), "data", "orders.json");
    const orders = fileRead();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    fs.writeFileSync(file, JSON.stringify(orders, null, 2));
    return orders[idx];
  }
}
