/**
 * Order store with dual backend:
 *  - Upstash Redis (REST)  when UPSTASH_REDIS_REST_URL is set  → Vercel / production
 *  - Local JSON file       otherwise                            → local dev
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

const REDIS_KEY = "orders";
const isRedis = () => Boolean(process.env.UPSTASH_REDIS_REST_URL);

// ─── Upstash Redis backend ────────────────────────────────────────────────────

async function redisRead(): Promise<Order[]> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return (await redis.get<Order[]>(REDIS_KEY)) ?? [];
}

async function redisWrite(orders: Order[]): Promise<void> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  await redis.set(REDIS_KEY, orders);
}

// ─── File backend (local dev) ─────────────────────────────────────────────────

function fileRead(): Order[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs   = require("fs")   as typeof import("fs");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path") as typeof import("path");
  const file = path.join(process.cwd(), "data", "orders.json");
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as Order[];
  } catch {
    return [];
  }
}

function fileWrite(orders: Order[]): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs   = require("fs")   as typeof import("fs");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path") as typeof import("path");
  const file = path.join(process.cwd(), "data", "orders.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(orders, null, 2));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function saveOrder(
  order: Omit<Order, "status" | "updatedAt">
): Promise<Order> {
  const full: Order = {
    ...order,
    status: "pending",
    updatedAt: new Date().toISOString(),
  };
  if (isRedis()) {
    const orders = await redisRead();
    orders.unshift(full);
    await redisWrite(orders);
  } else {
    const orders = fileRead();
    orders.unshift(full);
    fileWrite(orders);
  }
  return full;
}

export async function getAllOrders(): Promise<Order[]> {
  return isRedis() ? redisRead() : fileRead();
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  if (isRedis()) {
    const orders = await redisRead();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    await redisWrite(orders);
    return orders[idx];
  } else {
    const orders = fileRead();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    fileWrite(orders);
    return orders[idx];
  }
}
