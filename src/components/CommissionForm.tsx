"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import PriceEstimator from "@/components/PriceEstimator";
import type { ComplexityResult, PriceBreakdown } from "@/lib/complexity";

interface AnalysisResult {
  complexity: ComplexityResult;
  pricing: { basePrice: number; finalPrice: number; breakdown: PriceBreakdown };
  currency: string;
}

type Step = "estimate" | "details" | "success";

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors";

export default function CommissionForm() {
  const [step, setStep] = useState<Step>("estimate");
  const [estimateData, setEstimateData] = useState<{
    imageFile: File;
    result: AnalysisResult;
    size: string;
    subjects: string;
    isRush: boolean;
  } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleProceed = (data: typeof estimateData) => {
    setEstimateData(data);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimateData) return;
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

  const steps = [
    { id: "estimate", label: "1. Estimate" },
    { id: "details", label: "2. Details" },
    { id: "success", label: "3. Done" },
  ];

  const currentStepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step progress */}
      <div className="flex items-center gap-3 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < currentStepIdx ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                : i === currentStepIdx ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                : "bg-[var(--border)] text-[var(--text-muted)]"
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

      {/* Step 1 */}
      {step === "estimate" && <PriceEstimator onProceed={handleProceed} showProceedButton />}

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
              </p>
            </div>
            <button onClick={() => setStep("estimate")}
              className="text-xs text-[var(--text-muted)] underline hover:text-[var(--text)]">
              Change
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Full Name *</label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Email *</label>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Phone (optional)</label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Special Instructions</label>
              <textarea value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any specific requirements, style preferences, or notes..."
                rows={4} className={`${inputCls} resize-none`} />
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
          <Button className="mt-8" onClick={() => {
            setStep("estimate"); setEstimateData(null);
            setForm({ name: "", email: "", phone: "", notes: "" }); setOrderId(null);
          }}>
            Submit Another
          </Button>
        </div>
      )}
    </div>
  );
}
