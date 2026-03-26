"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2, AlertCircle, XCircle, Clock, Brush, CheckCircle2, Ban } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/orderStore";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:     { label: "Pending Review",  color: "text-[#c9a96e] bg-[rgba(201,169,110,0.1)] border-[rgba(201,169,110,0.3)]",  icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress",     color: "text-blue-400 bg-blue-400/10 border-blue-400/30",                           icon: <Brush className="w-3.5 h-3.5" /> },
  completed:   { label: "Completed",       color: "text-green-400 bg-green-400/10 border-green-400/30",                        icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled:   { label: "Cancelled",       color: "text-[#7a7570] bg-[rgba(122,117,112,0.1)] border-[rgba(122,117,112,0.3)]",  icon: <Ban className="w-3.5 h-3.5" /> },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function OrderCard({ order, onCancelled }: { order: Order; onCancelled: (id: string) => void }) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = STATUS_CONFIG[order.status];

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: order.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      onCancelled(order.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="border border-[rgba(201,169,110,0.12)] bg-[#0f0f0f] hover:border-[rgba(201,169,110,0.25)] transition-colors duration-300">
      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1">Order ID</p>
            <p className="text-[#c9a96e] text-sm font-mono">{order.id}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase border rounded-full ${status.color}`}>
            {status.icon}{status.label}
          </span>
        </div>

        {/* Main content */}
        <div className="flex gap-4">
          {/* Reference image */}
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#1a1917] border border-[rgba(201,169,110,0.08)] overflow-hidden">
            <Image
              src={order.referenceUrl}
              alt="Reference"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            {[
              ["Size",       order.size],
              ["Complexity", order.complexity.charAt(0).toUpperCase() + order.complexity.slice(1)],
              ["Delivery",   order.isRush ? `Rush (${order.rushDays ?? 3} days)` : "Standard"],
              ["Submitted",  formatDate(order.submittedAt)],
              ["Price",      `${order.currency}${order.estimatedPrice.toLocaleString("en-IN")}`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] text-[#7a7570] tracking-[0.2em] uppercase">{label}</p>
                <p className="text-[#f0ece4] font-light mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-4 pt-4 border-t border-[rgba(201,169,110,0.08)]">
            <p className="text-[10px] text-[#7a7570] tracking-[0.2em] uppercase mb-1">Notes</p>
            <p className="text-[#7a7570] text-sm font-light">{order.notes}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
          </div>
        )}

        {/* Cancel button — only for pending */}
        {order.status === "pending" && (
          <div className="mt-4 pt-4 border-t border-[rgba(201,169,110,0.08)] flex justify-end">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Cancelling...</>
                : <><XCircle className="w-3.5 h-3.5" />Cancel Order</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersLookup() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/lookup?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setOrders(data.orders);
      setSearched(trimmed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelled = (id: string) => {
    setOrders((prev) =>
      prev ? prev.map((o) => o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o) : prev
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Lookup form */}
      <form onSubmit={handleLookup} className="mb-10">
        <p className="text-[#7a7570] text-sm mb-6 leading-relaxed">
          Enter the email address you used when placing your commission to view your orders.
        </p>
        <div className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-[#0f0f0f] border border-[rgba(201,169,110,0.2)] text-[#f0ece4] placeholder:text-[#7a7570] px-4 py-3 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a96e] text-[#080808] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#d4b87a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
            {loading ? "Looking up..." : "Look Up"}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
      </form>

      {/* Results */}
      {orders !== null && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-[#7a7570] text-xs tracking-[0.3em] uppercase">
              {orders.length === 0
                ? "No orders found"
                : `${orders.length} order${orders.length > 1 ? "s" : ""} for ${searched}`}
            </p>
            {orders.length > 0 && (
              <div className="h-px flex-1 ml-6 bg-[rgba(201,169,110,0.12)]" />
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 border border-[rgba(201,169,110,0.08)] bg-[#0f0f0f]">
              <p className="text-[#7a7570] text-sm">No commissions found for this email address.</p>
              <p className="text-[#7a7570] text-xs mt-2 opacity-60">
                Make sure you&apos;re using the same email you entered during checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onCancelled={handleCancelled} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
