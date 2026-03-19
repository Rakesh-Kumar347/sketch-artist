"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComplexityResult, PriceBreakdown } from "@/lib/complexity";

const SIZES = ["A5", "A4", "A3", "A2"] as const;
const SUBJECTS = ["1", "2", "3", "4+"] as const;

interface AnalysisResult {
  complexity: ComplexityResult;
  pricing: { basePrice: number; finalPrice: number; breakdown: PriceBreakdown };
  currency: string;
}

const complexityColors: Record<string, string> = {
  simple: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  detailed: "bg-orange-100 text-orange-800 border-orange-200",
  complex: "bg-red-100 text-red-800 border-red-200",
};

interface Props {
  onProceed?: (data: {
    imageFile: File;
    result: AnalysisResult;
    size: string;
    subjects: string;
    isRush: boolean;
  }) => void;
  showProceedButton?: boolean;
}

export default function PriceEstimator({ onProceed, showProceedButton = false }: Props) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [size, setSize] = useState<"A5" | "A4" | "A3" | "A2">("A4");
  const [subjects, setSubjects] = useState<"1" | "2" | "3" | "4+">("1");
  const [isRush, setIsRush] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("size", size);
      formData.append("subjects", subjects);
      formData.append("rush", String(isRush));

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-stone-500 bg-stone-50"
            : "border-stone-300 hover:border-stone-400 bg-white",
          preview ? "py-4" : "py-12"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={300}
              className="max-h-64 mx-auto object-contain rounded-lg"
            />
            <p className="text-xs text-stone-500 mt-2">Click to change image</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-700 font-medium">Drop your reference image here</p>
            <p className="text-stone-400 text-sm mt-1">or click to browse · PNG, JPG, WEBP up to 10MB</p>
          </>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Paper Size</label>
          <div className="grid grid-cols-4 gap-1">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "py-2 text-sm rounded-md border font-medium transition-all",
                  size === s
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Number of Subjects
          </label>
          <div className="grid grid-cols-4 gap-1">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubjects(s)}
                className={cn(
                  "py-2 text-sm rounded-md border font-medium transition-all",
                  subjects === s
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Rush */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Delivery</label>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: "Standard", value: false },
              { label: "Rush (+35%)", value: true },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setIsRush(opt.value)}
                className={cn(
                  "py-2 text-sm rounded-md border font-medium transition-all",
                  isRush === opt.value
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analyze button */}
      <Button
        onClick={analyze}
        disabled={!image || loading}
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing image...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Estimate Price
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Price header */}
          <div className="bg-stone-900 text-white px-6 py-5 text-center">
            <p className="text-stone-400 text-sm">Estimated Price</p>
            <p className="text-4xl font-bold mt-1">
              {result.currency}{result.pricing.finalPrice.toLocaleString()}
            </p>
            <p className="text-stone-400 text-xs mt-1">
              *Final price confirmed by artist after review
            </p>
          </div>

          {/* Complexity badge */}
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-700">Image Complexity</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {result.complexity.description}
              </p>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold border",
                complexityColors[result.complexity.level]
              )}
            >
              {result.complexity.label}
            </span>
          </div>

          {/* Complexity score bar */}
          <div className="px-6 py-4 border-b border-stone-100">
            <div className="flex justify-between text-xs text-stone-500 mb-1.5">
              <span>Complexity Score</span>
              <span>{result.complexity.score}/100</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div
                className="bg-stone-900 h-2 rounded-full transition-all duration-500"
                style={{ width: `${result.complexity.score}%` }}
              />
            </div>
          </div>

          {/* Price breakdown */}
          <div className="px-6 py-4">
            <p className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-1">
              <ChevronDown className="w-4 h-4" /> Price Breakdown
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Base price ({size})</span>
                <span>{result.currency}{result.pricing.breakdown.base}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Complexity ({result.complexity.label})</span>
                <span>×{result.pricing.breakdown.complexityMult}</span>
              </div>
              {result.pricing.breakdown.subjectMult > 1 && (
                <div className="flex justify-between text-stone-600">
                  <span>Subjects ({subjects})</span>
                  <span>×{result.pricing.breakdown.subjectMult}</span>
                </div>
              )}
              {isRush && (
                <div className="flex justify-between text-stone-600">
                  <span>Rush fee</span>
                  <span>×{result.pricing.breakdown.rushMult}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-900 border-t border-stone-100 pt-2 mt-2">
                <span>Total Estimate</span>
                <span>{result.currency}{result.pricing.finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          {showProceedButton && onProceed && (
            <div className="px-6 pb-5">
              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  onProceed({
                    imageFile: image!,
                    result,
                    size,
                    subjects,
                    isRush,
                  })
                }
              >
                <CheckCircle2 className="w-4 h-4" />
                Proceed to Commission
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
