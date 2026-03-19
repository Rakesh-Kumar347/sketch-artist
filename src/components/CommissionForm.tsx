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

export default function CommissionForm() {
  const [step, setStep] = useState<Step>("estimate");
  const [estimateData, setEstimateData] = useState<{
    imageFile: File;
    result: AnalysisResult;
    size: string;
    subjects: string;
    isRush: boolean;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
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

  // Step indicators
  const steps = [
    { id: "estimate", label: "1. Get Estimate" },
    { id: "details", label: "2. Your Details" },
    { id: "success", label: "3. Confirmed" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step === s.id
                  ? "bg-stone-900"
                  : steps.indexOf(steps.find((x) => x.id === step)!) > i
                  ? "bg-stone-400"
                  : "bg-stone-200"
              }`}
            />
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                step === s.id ? "text-stone-900" : "text-stone-400"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Estimate */}
      {step === "estimate" && (
        <PriceEstimator onProceed={handleProceed} showProceedButton />
      )}

      {/* Step 2: Details */}
      {step === "details" && estimateData && (
        <div className="space-y-6">
          {/* Summary card */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Estimated Price</p>
              <p className="text-2xl font-bold text-stone-900">
                {estimateData.result.currency}
                {estimateData.result.pricing.finalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {estimateData.size} · {estimateData.subjects} subject(s) ·{" "}
                {estimateData.result.complexity.label}
              </p>
            </div>
            <button
              onClick={() => setStep("estimate")}
              className="text-xs text-stone-500 underline hover:text-stone-700"
            >
              Edit
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Special Instructions
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any specific requirements, style preferences, or notes for the artist..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("estimate")}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1" size="lg">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Commission
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Success */}
      {step === "success" && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Commission Submitted!
          </h2>
          <p className="text-stone-600 mb-1">
            Thank you for your order. The artist will review your reference
            image and confirm the final price within 24 hours.
          </p>
          {orderId && (
            <p className="text-sm text-stone-400 mt-3">
              Order ID: <span className="font-mono font-medium text-stone-600">{orderId}</span>
            </p>
          )}
          <Button
            className="mt-8"
            onClick={() => {
              setStep("estimate");
              setEstimateData(null);
              setForm({ name: "", email: "", phone: "", notes: "" });
              setOrderId(null);
            }}
          >
            Submit Another
          </Button>
        </div>
      )}
    </div>
  );
}
