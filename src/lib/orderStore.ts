import { createAdminClient } from "@/lib/supabase";

export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Order {
  id: string;
  name: string;
  email: string;
  phone?: string;
  size: string;
  subjects: string;
  isRush: boolean;
  rushDays?: number;
  notes?: string;
  referenceUrl: string;
  referencePath: string;
  complexity: string;
  complexityScore: number;
  estimatedPrice: number;
  currency: string;
  status: OrderStatus;
  submittedAt: string;
  updatedAt: string;
}

// snake_case DB row → camelCase Order
function rowToOrder(r: Record<string, unknown>): Order {
  return {
    id:             r.id             as string,
    name:           r.name           as string,
    email:          r.email          as string,
    phone:          r.phone          as string | undefined,
    size:           r.size           as string,
    subjects:       r.subjects       as string,
    isRush:         r.is_rush        as boolean,
    rushDays:       r.rush_days      as number | undefined,
    notes:          r.notes          as string | undefined,
    referenceUrl:   r.reference_url  as string,
    referencePath:  r.reference_path as string,
    complexity:     r.complexity     as string,
    complexityScore:r.complexity_score as number,
    estimatedPrice: r.estimated_price  as number,
    currency:       r.currency       as string,
    status:         r.status         as OrderStatus,
    submittedAt:    r.submitted_at   as string,
    updatedAt:      r.updated_at     as string,
  };
}

export async function saveOrder(
  order: Omit<Order, "status" | "updatedAt">
): Promise<Order> {
  const { data, error } = await createAdminClient()
    .from("orders")
    .insert({
      id:               order.id,
      name:             order.name,
      email:            order.email,
      phone:            order.phone ?? null,
      size:             order.size,
      subjects:         order.subjects,
      is_rush:          order.isRush,
      rush_days:        order.rushDays ?? null,
      notes:            order.notes ?? null,
      reference_url:    order.referenceUrl,
      reference_path:   order.referencePath,
      complexity:       order.complexity,
      complexity_score: order.complexityScore,
      estimated_price:  order.estimatedPrice,
      currency:         order.currency,
      status:           "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return rowToOrder(data as Record<string, unknown>);
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => rowToOrder(r as Record<string, unknown>));
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => rowToOrder(r as Record<string, unknown>));
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const { data, error } = await createAdminClient()
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  return rowToOrder(data as Record<string, unknown>);
}
