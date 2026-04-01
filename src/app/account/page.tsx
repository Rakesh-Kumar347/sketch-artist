"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User, ShoppingBag, Edit3, Save, X, Loader2, AlertCircle,
  CheckCircle2, Clock, Brush, Ban, XCircle, MapPin, Plus, Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { SavedAddress } from "@/context/AuthContext";
import type { Order, OrderStatus } from "@/lib/orderStore";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:     { label: "Pending Review",  color: "text-[#c9a96e] bg-[rgba(201,169,110,0.1)] border-[rgba(201,169,110,0.3)]",  icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress",     color: "text-blue-400 bg-blue-400/10 border-blue-400/30",                           icon: <Brush className="w-3.5 h-3.5" /> },
  completed:   { label: "Completed",       color: "text-green-400 bg-green-400/10 border-green-400/30",                        icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled:   { label: "Cancelled",       color: "text-[#7a7570] bg-[rgba(122,117,112,0.1)] border-[rgba(122,117,112,0.3)]",  icon: <Ban className="w-3.5 h-3.5" /> },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onCancelled }: { order: Order; onCancelled: (id: string) => void }) {
  const [cancelling, setCancelling] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const status = STATUS_CONFIG[order.status];

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    setErr(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: order.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCancelled(order.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="border border-[rgba(201,169,110,0.12)] bg-[#0f0f0f] hover:border-[rgba(201,169,110,0.25)] transition-colors">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1">Order ID</p>
            <p className="text-[#c9a96e] text-sm font-mono">{order.id}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase border rounded-full ${status.color}`}>
            {status.icon}{status.label}
          </span>
        </div>

        <div className="flex gap-4">
          <div className="shrink-0 w-20 h-20 bg-[#1a1917] border border-[rgba(201,169,110,0.08)] overflow-hidden">
            <Image src={order.referenceUrl} alt="Reference" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            {([
              ["Size", order.size],
              ["Complexity", order.complexity.charAt(0).toUpperCase() + order.complexity.slice(1)],
              ["Delivery", order.isRush ? `Rush (${order.rushDays ?? 3}d)` : "Standard"],
              ["Submitted", formatDate(order.submittedAt)],
              ["Price", `${order.currency}${order.estimatedPrice.toLocaleString("en-IN")}`],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] text-[#7a7570] tracking-[0.2em] uppercase">{label}</p>
                <p className="text-[#f0ece4] font-light mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 pt-4 border-t border-[rgba(201,169,110,0.08)]">
            <p className="text-[10px] text-[#7a7570] tracking-[0.2em] uppercase mb-1">Notes</p>
            <p className="text-[#7a7570] text-sm font-light">{order.notes}</p>
          </div>
        )}

        {err && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{err}
          </div>
        )}

        {order.status === "pending" && (
          <div className="mt-4 pt-4 border-t border-[rgba(201,169,110,0.08)] flex justify-end">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all disabled:opacity-50"
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

// ─── Address card ─────────────────────────────────────────────────────────────

function AddressCard({
  addr,
  onSave,
  onDelete,
}: {
  addr: SavedAddress;
  onSave: (id: string, label: string, address: string) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(addr.label);
  const [editAddress, setEditAddress] = useState(addr.address);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const inputCls = "w-full bg-[#080808] border border-[rgba(201,169,110,0.2)] text-[#f0ece4] placeholder:text-[#7a7570] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors";

  const handleSave = async () => {
    if (!editLabel.trim() || !editAddress.trim()) {
      setErr("Both label and address are required.");
      return;
    }
    setSaving(true);
    setErr(null);
    const error = await onSave(addr.id, editLabel.trim(), editAddress.trim());
    if (error) {
      setErr(error);
    } else {
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete address "${addr.label}"?`)) return;
    setDeleting(true);
    await onDelete(addr.id);
  };

  if (editing) {
    return (
      <div className="border border-[#c9a96e]/30 bg-[#0f0f0f] p-4 space-y-3">
        <div>
          <label className="block text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1.5">Label</label>
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            placeholder="Home, Office, etc."
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1.5">Address</label>
          <textarea
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            placeholder="House/Flat No., Street, City, State, PIN"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
        {err && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{err}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c9a96e] text-[#080808] text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#d4b87a] transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => { setEditing(false); setEditLabel(addr.label); setEditAddress(addr.address); setErr(null); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[rgba(201,169,110,0.2)] text-[#7a7570] text-[10px] tracking-[0.2em] uppercase hover:text-[#f0ece4] transition-colors"
          >
            <X className="w-3 h-3" />Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[rgba(201,169,110,0.12)] bg-[#0f0f0f] p-4 hover:border-[rgba(201,169,110,0.25)] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <MapPin className="w-4 h-4 text-[#c9a96e] mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[#c9a96e] text-[10px] tracking-[0.25em] uppercase mb-1">{addr.label}</p>
            <p className="text-[#f0ece4] text-sm font-light whitespace-pre-line leading-relaxed">{addr.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setEditing(true); setErr(null); }}
            className="text-[#7a7570] hover:text-[#c9a96e] transition-colors"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[#7a7570] hover:text-red-400 transition-colors disabled:opacity-40"
            title="Delete"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add address form ─────────────────────────────────────────────────────────

function AddAddressForm({ onAdd }: { onAdd: (label: string, address: string) => Promise<string | null> }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const inputCls = "w-full bg-[#0f0f0f] border border-[rgba(201,169,110,0.2)] text-[#f0ece4] placeholder:text-[#7a7570] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !address.trim()) {
      setErr("Both label and address are required.");
      return;
    }
    setSaving(true);
    setErr(null);
    const error = await onAdd(label.trim(), address.trim());
    if (error) {
      setErr(error);
    } else {
      setLabel("");
      setAddress("");
      setOpen(false);
    }
    setSaving(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[rgba(201,169,110,0.25)] text-[#7a7570] text-xs tracking-[0.2em] uppercase hover:border-[rgba(201,169,110,0.5)] hover:text-[#c9a96e] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />Add New Address
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#c9a96e]/30 bg-[#0f0f0f] p-4 space-y-3">
      <p className="text-[#f0ece4] text-xs tracking-[0.2em] uppercase mb-1">New Address</p>
      <div>
        <label className="block text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1.5">Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Home, Office, Parents' house…"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1.5">Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="House/Flat No., Street, City, State, PIN"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>
      {err && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{err}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c9a96e] text-[#080808] text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#d4b87a] transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          {saving ? "Saving..." : "Save Address"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setLabel(""); setAddress(""); setErr(null); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[rgba(201,169,110,0.2)] text-[#7a7570] text-[10px] tracking-[0.2em] uppercase hover:text-[#f0ece4] transition-colors"
        >
          <X className="w-3 h-3" />Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main account page ────────────────────────────────────────────────────────

type Tab = "profile" | "orders";

export default function AccountPage() {
  const { user, profile, loading, signOut, updateProfile, fetchAddresses, addAddress, updateAddress, deleteAddress } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // Load addresses when profile tab is active
  useEffect(() => {
    if (!loading && user && tab === "profile" && addresses.length === 0) {
      setAddressesLoading(true);
      fetchAddresses().then((data) => {
        setAddresses(data);
        setAddressesLoading(false);
      });
    }
  }, [tab, loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch orders when tab switches to orders
  useEffect(() => {
    if (tab === "orders" && profile?.email && orders.length === 0) {
      setOrdersLoading(true);
      fetch(`/api/orders/lookup?email=${encodeURIComponent(profile.email)}`)
        .then((r) => r.json())
        .then((d) => setOrders(d.orders ?? []))
        .catch(() => setOrdersError("Failed to load orders"))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, profile?.email, orders.length]);

  const startEdit = () => {
    setEditName(profile?.name ?? "");
    setEditPhone(profile?.phone ?? "");
    setEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const err = await updateProfile({ name: editName, phone: editPhone });
    if (err) {
      setSaveError(err);
    } else {
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleAddAddress = async (label: string, address: string) => {
    const err = await addAddress(label, address);
    if (!err) {
      const updated = await fetchAddresses();
      setAddresses(updated);
    }
    return err;
  };

  const handleUpdateAddress = async (id: string, label: string, address: string) => {
    const err = await updateAddress(id, label, address);
    if (!err) {
      setAddresses((prev) => prev.map((a) => a.id === id ? { ...a, label, address } : a));
    }
    return err;
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCancelled = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o));
  };

  if (loading || !user || !profile) {
    return (
      <div className="bg-[#080808] min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#c9a96e] animate-spin" />
      </div>
    );
  }

  const inputCls = "w-full bg-[#0f0f0f] border border-[rgba(201,169,110,0.2)] text-[#f0ece4] placeholder:text-[#7a7570] px-4 py-3 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors";

  return (
    <div className="bg-[#080808] min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-2">My Account</p>
            <h1
              className="text-4xl font-thin text-[#f0ece4]"
              style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
            >
              {profile.name || "Welcome"}
            </h1>
            <p className="text-[#7a7570] text-sm mt-1">{profile.email}</p>
          </div>
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="text-[#7a7570] text-xs tracking-[0.2em] uppercase hover:text-[#f0ece4] transition-colors border border-[rgba(201,169,110,0.15)] px-4 py-2 hover:border-[rgba(201,169,110,0.4)]"
          >
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(201,169,110,0.12)] mb-8">
          {([
            { key: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
            { key: "orders",  label: "My Orders", icon: <ShoppingBag className="w-4 h-4" /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs tracking-[0.2em] uppercase border-b-2 -mb-px transition-colors ${
                tab === key
                  ? "border-[#c9a96e] text-[#c9a96e]"
                  : "border-transparent text-[#7a7570] hover:text-[#f0ece4]"
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="border border-[rgba(201,169,110,0.12)] bg-[#0f0f0f] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#f0ece4] text-sm tracking-[0.2em] uppercase">Personal Information</h2>
                {!editing && (
                  <button
                    onClick={startEdit}
                    className="inline-flex items-center gap-1.5 text-[#c9a96e] text-xs tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
                  >
                    <Edit3 className="w-3.5 h-3.5" />Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1.5">Full Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1.5">Email</label>
                    <input type="email" value={profile.email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
                    <p className="text-[10px] text-[#7a7570] mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1.5">Phone</label>
                    <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputCls} />
                  </div>

                  {saveError && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />{saveError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c9a96e] text-[#080808] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#d4b87a] transition-colors disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-[rgba(201,169,110,0.2)] text-[#7a7570] text-xs tracking-[0.2em] uppercase hover:text-[#f0ece4] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {saveSuccess && (
                    <div className="col-span-2 flex items-center gap-2 text-green-400 text-xs bg-green-400/10 border border-green-400/20 px-3 py-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />Profile updated successfully
                    </div>
                  )}
                  {([
                    ["Full Name", profile.name || "—"],
                    ["Email",     profile.email],
                    ["Phone",     profile.phone || "—"],
                    ["Member Since", new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1">{label}</p>
                      <p className="text-[#f0ece4] font-light">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Addresses */}
            <div className="border border-[rgba(201,169,110,0.12)] bg-[#0f0f0f] p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-4 h-4 text-[#c9a96e]" />
                <h2 className="text-[#f0ece4] text-sm tracking-[0.2em] uppercase">Saved Addresses</h2>
              </div>

              {addressesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 text-[#c9a96e] animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      addr={addr}
                      onSave={handleUpdateAddress}
                      onDelete={handleDeleteAddress}
                    />
                  ))}
                  <AddAddressForm onAdd={handleAddAddress} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders tab */}
        {tab === "orders" && (
          <div>
            {ordersLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-[#c9a96e] animate-spin" />
              </div>
            )}
            {ordersError && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{ordersError}
              </div>
            )}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="text-center py-16 border border-[rgba(201,169,110,0.08)] bg-[#0f0f0f]">
                <ShoppingBag className="w-8 h-8 text-[#7a7570] mx-auto mb-3 opacity-40" />
                <p className="text-[#7a7570] text-sm">No orders yet.</p>
                <a href="/commission" className="text-[#c9a96e] text-xs tracking-[0.2em] uppercase mt-4 inline-block hover:underline">
                  Place a Commission →
                </a>
              </div>
            )}
            {!ordersLoading && orders.length > 0 && (
              <div className="space-y-4">
                <p className="text-[#7a7570] text-xs tracking-[0.3em] uppercase mb-5">
                  {orders.length} order{orders.length > 1 ? "s" : ""}
                </p>
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} onCancelled={handleCancelled} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
