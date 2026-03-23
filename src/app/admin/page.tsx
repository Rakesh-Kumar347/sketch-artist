"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Lock, LogOut, Upload, Trash2, Loader2, CheckCircle2,
  AlertCircle, Plus, ShoppingBag, Clock, LayoutGrid,
  ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortfolioImage } from "@/lib/cloudinary";
import type { Order } from "@/lib/orderStore";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Portrait", "Animal", "Landscape", "Couple", "Child", "Other"];

type Tab = "portfolio" | "orders" | "history";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100   text-blue-800   border-blue-200",
  completed:   "bg-green-100  text-green-800  border-green-200",
  cancelled:   "bg-red-100    text-red-800    border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending:     "Pending",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", STATUS_STYLES[status])}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Login ───────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth")) setAuthed(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("admin_auth", password);
        setAuthed(true);
      } else {
        setLoginError("Incorrect password");
      }
    } catch {
      setLoginError("Connection error");
    } finally {
      setLoginLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 w-full max-w-sm">
          <div className="flex items-center justify-center w-12 h-12 bg-stone-900 text-white rounded-xl mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 text-center mb-6">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            {loginError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />{loginError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      adminPassword={sessionStorage.getItem("admin_auth") || ""}
      onLogout={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }}
    />
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function AdminDashboard({ adminPassword, onLogout }: { adminPassword: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Admin Panel</h1>
          <p className="text-stone-500 text-sm">Manage orders &amp; portfolio</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="text-stone-500">
          <LogOut className="w-4 h-4" />Logout
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 border-b border-stone-200">
        {([
          { key: "orders",    label: "Orders",        icon: ShoppingBag },
          { key: "history",   label: "Order History", icon: Clock },
          { key: "portfolio", label: "Portfolio",     icon: LayoutGrid },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === key
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-700"
            )}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === "orders"    && <OrdersTab adminPassword={adminPassword} active />}
      {tab === "history"   && <OrdersTab adminPassword={adminPassword} active={false} />}
      {tab === "portfolio" && <PortfolioTab adminPassword={adminPassword} />}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ adminPassword, active }: { adminPassword: string; active: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": adminPassword },
      });
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "x-admin-password": adminPassword, "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => o.id === id ? data.order : o));
      }
    } finally {
      setUpdating(null);
    }
  };

  const visible = orders.filter((o) =>
    active
      ? o.status === "pending" || o.status === "in_progress"
      : o.status === "completed" || o.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 bg-stone-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="text-center py-20 text-stone-400">
        <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>{active ? "No active orders right now." : "No completed or cancelled orders yet."}</p>
      </div>
    );
  }

  // Stats bar (history only)
  const totalRevenue = visible
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.estimatedPrice, 0);

  return (
    <div className="space-y-4">
      {!active && visible.some((o) => o.status === "completed") && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Orders" value={String(visible.length)} />
          <StatCard label="Completed" value={String(visible.filter((o) => o.status === "completed").length)} />
          <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
        </div>
      )}

      {visible.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          active={active}
          updating={updating === order.id}
          onUpdateStatus={updateStatus}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function OrderCard({
  order, active, updating, onUpdateStatus,
}: {
  order: Order;
  active: boolean;
  updating: boolean;
  onUpdateStatus: (id: string, status: Order["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-stone-400">{order.id}</span>
              <StatusBadge status={order.status} />
              {order.isRush && (
                <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                  Rush
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-stone-900 mt-0.5">{order.name}</p>
            <p className="text-xs text-stone-500">{order.email}{order.phone && ` · ${order.phone}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-lg font-bold text-stone-900">₹{order.estimatedPrice.toLocaleString()}</p>
            <p className="text-xs text-stone-500">{order.size} · {order.subjects} subject{order.subjects !== "1" ? "s" : ""}</p>
          </div>
          <button onClick={() => setExpanded((v) => !v)} className="text-stone-400 hover:text-stone-700 p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-stone-100 px-5 py-4 space-y-4">
          {/* Order details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              ["Paper Size", order.size],
              ["Subjects", order.subjects],
              ["Complexity", order.complexity],
              ["Score", `${order.complexityScore}/100`],
              ["Rush", order.isRush ? "Yes" : "No"],
              ["Price", `₹${order.estimatedPrice.toLocaleString()}`],
              ["Submitted", fmt(order.submittedAt)],
              ["Updated", fmt(order.updatedAt)],
            ].map(([label, value]) => (
              <div key={label} className="bg-stone-50 rounded-lg p-2.5">
                <p className="text-xs text-stone-400 mb-0.5">{label}</p>
                <p className="font-medium text-stone-800 capitalize">{value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-xs text-stone-400 mb-1">Special Instructions</p>
              <p className="text-sm text-stone-700">{order.notes}</p>
            </div>
          )}

          {/* Reference image */}
          <div className="flex items-center gap-3">
            <a
              href={order.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Reference Image
            </a>
          </div>

          {/* Actions */}
          {active && (
            <div className="flex flex-wrap gap-2 pt-1">
              {order.status === "pending" && (
                <button
                  onClick={() => onUpdateStatus(order.id, "in_progress")}
                  disabled={updating}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Start Working
                </button>
              )}
              {order.status === "in_progress" && (
                <button
                  onClick={() => onUpdateStatus(order.id, "completed")}
                  disabled={updating}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => onUpdateStatus(order.id, "cancelled")}
                disabled={updating}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Portfolio Tab ────────────────────────────────────────────────────────────

function PortfolioTab({ adminPassword }: { adminPassword: string }) {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Portrait");
  const [description, setDescription] = useState("");

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      setImages(data.images || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      const res = await fetch("/api/portfolio/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setUploadSuccess(true);
      setFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setTimeout(() => setUploadSuccess(false), 3000);
      fetchImages();
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Delete this image from portfolio?")) return;
    setDeleting(publicId);
    try {
      await fetch("/api/portfolio/upload", {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword, "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      setImages((prev) => prev.filter((img) => img.id !== publicId));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Upload form */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sticky top-24">
          <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Artwork
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors",
                preview ? "border-stone-300" : "border-stone-300 hover:border-stone-400"
              )}
              onClick={() => document.getElementById("admin-file")?.click()}
            >
              <input
                id="admin-file" type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }}
              />
              {preview ? (
                <Image src={preview} alt="Preview" width={300} height={200}
                  className="max-h-40 mx-auto object-contain rounded-lg" />
              ) : (
                <div className="py-6">
                  <Upload className="w-7 h-7 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">Click to select artwork</p>
                </div>
              )}
            </div>

            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Artwork title"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />

            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)" rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none" />

            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />{error}
              </p>
            )}
            {uploadSuccess && (
              <p className="text-green-600 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />Uploaded successfully!
              </p>
            )}

            <Button type="submit" className="w-full" disabled={!file || !title || uploading}>
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
                : <><Upload className="w-4 h-4" />Upload to Portfolio</>}
            </Button>
          </form>
        </div>
      </div>

      {/* Portfolio grid */}
      <div className="lg:col-span-3">
        <h2 className="font-semibold text-stone-900 mb-4">
          Portfolio ({images.length} artworks)
        </h2>
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}
        {!loading && images.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p>No artworks yet. Upload your first piece!</p>
          </div>
        )}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden bg-stone-100 aspect-square">
                <Image src={img.url} alt={img.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <p className="text-white text-xs font-medium text-center px-2 truncate w-full">{img.title}</p>
                  <span className="text-xs text-stone-300 bg-black/40 px-2 py-0.5 rounded-full">{img.category}</span>
                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={deleting === img.id}
                    className="mt-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1 transition-colors"
                  >
                    {deleting === img.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
