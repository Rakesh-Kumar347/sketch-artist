"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, Send, Lock, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PriceEstimator from "@/components/PriceEstimator";
import type { ComplexityResult, PriceBreakdown } from "@/lib/complexity";
import { useAuth } from "@/context/AuthContext";
import type { SavedAddress } from "@/context/AuthContext";

interface AnalysisResult {
  complexity: ComplexityResult;
  pricing: { basePrice: number; finalPrice: number; breakdown: PriceBreakdown };
  currency: string;
}

type Step = "estimate" | "details" | "success";
type AddressMode = "saved" | "new";

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors";

const emptyForm = {
  name: "", email: "", phone: "", notes: "",
  addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
};

export default function CommissionForm() {
  const topRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, fetchAddresses } = useAuth();
  const [step, setStep] = useState<Step>("estimate");
  const [estimateData, setEstimateData] = useState<{
    imageFile: File;
    result: AnalysisResult;
    size: string;
    subjects: string;
    isRush: boolean;
    rushDays: number;
  } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressMode, setAddressMode] = useState<AddressMode>("saved");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Pre-fill from profile when user is logged in
  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [profile]);

  const handleProceed = (data: typeof estimateData) => {
    setEstimateData(data);
    setStep("details");
    // Fetch saved addresses when moving to details step
    if (user) {
      setAddressesLoading(true);
      fetchAddresses().then((addrs) => {
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setAddressMode("saved");
          setSelectedAddressId(addrs[0].id);
        } else {
          setAddressMode("new");
        }
        setAddressesLoading(false);
      });
    }
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimateData) return;

    // Validate address
    const usingSaved = addressMode === "saved" && selectedAddressId;
    const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId);
    if (usingSaved && !selectedAddr) {
      setError("Please select a delivery address.");
      return;
    }
    if (!usingSaved && !form.addressLine1.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", estimateData.imageFile);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("notes", form.notes);
      formData.append("size", estimateData.size);
      formData.append("subjects", estimateData.subjects);
      formData.append("rush", String(estimateData.isRush));
      if (estimateData.isRush) formData.append("rushDays", String(estimateData.rushDays));

      if (usingSaved && selectedAddr) {
        formData.append("shippingAddress", JSON.stringify({ line1: selectedAddr.address }));
      } else {
        formData.append("shippingAddress", JSON.stringify({
          line1: form.addressLine1,
          line2: form.addressLine2 || undefined,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        }));
      }

      const res = await fetch("/api/commission", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setOrderId(data.order.id);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof emptyForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const steps = [
    { id: "estimate", label: "1. Estimate" },
    { id: "details",  label: "2. Details"  },
    { id: "success",  label: "3. Done"     },
  ];
  const currentStepIdx = steps.findIndex((s) => s.id === step);

  // ─── Auth wall ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#c9a96e] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 border border-[rgba(201,169,110,0.15)] bg-[#0a0a0a]">
        <div className="w-14 h-14 rounded-full border border-[rgba(201,169,110,0.3)] flex items-center justify-center mx-auto mb-6">
          <Lock className="w-6 h-6 text-[#c9a96e]" />
        </div>
        <h2
          className="text-2xl font-thin text-[#f0ece4] mb-3"
          style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
        >
          Sign In to Commission
        </h2>
        <p className="text-[#7a7570] text-sm mb-8 leading-relaxed">
          You need an account to place a commission order. Sign in or create a free account to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login?redirect=/commission"
            className="px-8 py-3 bg-[#c9a96e] text-[#080808] text-xs tracking-[0.25em] uppercase font-medium hover:bg-[#d4b87a] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register?redirect=/commission"
            className="px-8 py-3 border border-[rgba(201,169,110,0.4)] text-[#c9a96e] text-xs tracking-[0.25em] uppercase hover:border-[#c9a96e] transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────
  return (
    <div ref={topRef} className="max-w-2xl mx-auto" style={{ scrollMarginTop: "80px" }}>
      {/* Step progress */}
      <div className="flex items-center gap-3 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= currentStepIdx ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-[var(--border)] text-[var(--text-muted)]"
              }`}>
                {i < currentStepIdx ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                i === currentStepIdx ? "text-[var(--text)]" : "text-[var(--text-muted)]"
              }`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px transition-colors ${i < currentStepIdx ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — always mounted to preserve state */}
      <div className={step === "estimate" ? "" : "hidden"}>
        <PriceEstimator onProceed={handleProceed} showProceedButton />
      </div>

      {/* Step 2 */}
      {step === "details" && estimateData && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Estimated Price</p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {estimateData.result.currency}{estimateData.result.pricing.finalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {estimateData.size} · {estimateData.subjects} subject(s) · {estimateData.result.complexity.label}
                {estimateData.isRush && ` · Rush (${estimateData.rushDays} days)`}
              </p>
            </div>
            <button onClick={() => setStep("estimate")} className="text-xs text-[var(--text-muted)] underline hover:text-[var(--text)]">
              Change
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Full Name *</label>
                <input type="text" required placeholder="Your name" className={inputCls} {...field("name")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Email *</label>
                <input type="email" required placeholder="you@example.com" className={inputCls} {...field("email")} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Phone *</label>
              <input type="tel" required placeholder="+91 XXXXX XXXXX" className={inputCls} {...field("phone")} />
            </div>

            {/* Shipping address */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Shipping Address</span>
              </div>

              {addressesLoading ? (
                <div className="flex items-center gap-2 py-4 text-[var(--text-muted)] text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />Loading saved addresses…
                </div>
              ) : (
                <>
                  {/* Saved address cards */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = addressMode === "saved" && selectedAddressId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => { setAddressMode("saved"); setSelectedAddressId(addr.id); }}
                            className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors ${
                              isSelected
                                ? "border-[#c9a96e] bg-[rgba(201,169,110,0.06)]"
                                : "border-[var(--border)] hover:border-[rgba(201,169,110,0.4)]"
                            }`}
                          >
                            <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#c9a96e]" : "border-[var(--text-muted)]"
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-[#c9a96e] tracking-[0.2em] uppercase mb-0.5">{addr.label}</p>
                              <p className="text-sm text-[var(--text)] font-light whitespace-pre-line leading-relaxed">{addr.address}</p>
                            </div>
                          </button>
                        );
                      })}

                      {/* Enter a different address toggle */}
                      <button
                        type="button"
                        onClick={() => { setAddressMode("new"); setSelectedAddressId(null); }}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                          addressMode === "new"
                            ? "border-[#c9a96e] bg-[rgba(201,169,110,0.06)]"
                            : "border-[var(--border)] hover:border-[rgba(201,169,110,0.4)]"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                          addressMode === "new" ? "border-[#c9a96e]" : "border-[var(--text-muted)]"
                        }`}>
                          {addressMode === "new" && <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Enter a different address</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Manual address form — shown when no saved addresses or "Enter a different address" selected */}
                  {addressMode === "new" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Address Line 1 *</label>
                        <input type="text" required placeholder="House / Flat no., Street name" className={inputCls} {...field("addressLine1")} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Address Line 2</label>
                        <input type="text" placeholder="Landmark, Area (optional)" className={inputCls} {...field("addressLine2")} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">City *</label>
                          <input type="text" required placeholder="City" className={inputCls} {...field("city")} />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">State *</label>
                          <input type="text" required placeholder="State" className={inputCls} {...field("state")} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Pincode *</label>
                          <input type="text" required placeholder="000000" maxLength={6} className={inputCls} {...field("pincode")} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Special Instructions</label>
              <textarea
                placeholder="Any specific requirements, style preferences, or notes..."
                rows={3}
                className={`${inputCls} resize-none`}
                {...field("notes")}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("estimate")} className="flex-1">Back</Button>
              <Button type="submit" disabled={submitting} className="flex-1" size="lg">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                  : <><Send className="w-4 h-4" />Submit Commission</>}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3 */}
      {step === "success" && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Commission Submitted!</h2>
          <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
            The artist will review your reference image and confirm the final price within 24 hours.
          </p>
          {orderId && (
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Order ID: <span className="font-mono font-medium text-[var(--text)]">{orderId}</span>
            </p>
          )}
          <div className="flex gap-3 justify-center mt-8">
            <Button variant="outline" onClick={() => {
              setStep("estimate"); setEstimateData(null);
              setForm(emptyForm); setOrderId(null);
            }}>
              Submit Another
            </Button>
            <Link
              href="/account"
              className="inline-flex items-center justify-center px-4 py-2 bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              View My Orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
