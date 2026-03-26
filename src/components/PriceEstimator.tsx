"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Upload, Loader2, AlertCircle, CheckCircle2,
  ChevronDown, ScanSearch, Crop, RefreshCw, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageCropper from "@/components/ImageCropper";
import type { ComplexityResult, PriceBreakdown } from "@/lib/complexity";
import type { DetectionResult } from "@/lib/objectDetection";

const SIZES = ["A5", "A4", "A3", "A2"] as const;

type Stage = "upload" | "crop" | "result";

interface AnalysisResult {
  complexity: ComplexityResult;
  pricing: { basePrice: number; finalPrice: number; breakdown: PriceBreakdown };
  detection: DetectionResult;
  currency: string;
}

const complexityColors: Record<string, string> = {
  simple:   "bg-green-100  text-green-800  border-green-200  dark:bg-green-900/30  dark:text-green-400  dark:border-green-800",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  detailed: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  complex:  "bg-red-100    text-red-800    border-red-200    dark:bg-red-900/30    dark:text-red-400    dark:border-red-800",
};

const optionBtn = (active: boolean) =>
  cn(
    "py-2 text-sm rounded-md border font-medium transition-all",
    active
      ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]"
      : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
  );

interface Props {
  onProceed?: (data: {
    imageFile: File;
    result: AnalysisResult;
    size: string;
    subjects: string;
    isRush: boolean;
    rushDays: number;
  }) => void;
  showProceedButton?: boolean;
}

export default function PriceEstimator({ onProceed, showProceedButton = false }: Props) {
  // Raw uploaded file + its object URL (for the cropper)
  const [rawImage, setRawImage] = useState<File | null>(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);

  // Final file after crop (what gets analyzed)
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("upload");
  const [size, setSize] = useState<"A5" | "A4" | "A3" | "A2">("A3");
  const [isRush, setIsRush] = useState(false);
  const [rushDays, setRushDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeAutoUpgraded, setSizeAutoUpgraded] = useState(false);

  const detectedSubjectKey = result?.detection.subjectKey ?? "1";

  // A4/A5 are too small for 3+ subjects
  const tooManyForSmall = result !== null && (detectedSubjectKey === "3" || detectedSubjectKey === "4+");

  // Step 1: User picks a file → go to crop stage
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("File too large. Max 10MB."); return; }
    setRawImage(file);
    setRawPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setStage("crop");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 2: Cropper confirms → save cropped file, go to result stage
  const handleCropConfirm = (croppedFile: File, croppedPreviewUrl: string) => {
    setImage(croppedFile);
    setPreview(croppedPreviewUrl);
    setStage("result");
  };

  // Step 3: Analyze the cropped image
  const analyze = async (overrideSize?: string, overrideRush?: boolean) => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const sizeToUse = overrideSize ?? size;
      const formData = new FormData();
      formData.append("image", image);
      formData.append("size", sizeToUse);
      formData.append("rush", String(overrideRush ?? isRush));
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      // Auto-upgrade to A3 if >2 subjects detected and current size is A4/A5
      const detectedCount: number = data.detection?.subjectCount ?? 0;
      if (detectedCount > 2 && (sizeToUse === "A4" || sizeToUse === "A5")) {
        setSize("A3");
        setSizeAutoUpgraded(true);
        const fd2 = new FormData();
        fd2.append("image", image);
        fd2.append("size", "A3");
        fd2.append("rush", String(overrideRush ?? isRush));
        const res2 = await fetch("/api/analyze", { method: "POST", body: fd2 });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error || "Analysis failed");
        setResult(data2);
      } else {
        setSizeAutoUpgraded(false);
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setRawImage(null);
    setRawPreviewUrl(null);
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setSizeAutoUpgraded(false);
    setStage("upload");
  };

  // ─── STAGE: UPLOAD ───────────────────────────────────────────────
  if (stage === "upload") {
    return (
      <div className="space-y-5">
        <div
          className={cn(
            "border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer",
            dragOver
              ? "border-[var(--text-muted)] bg-[var(--bg-subtle)]"
              : "border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-card)]",
            "p-12"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById("file-input-up")?.click()}
        >
          <input id="file-input-up" type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text)] font-medium">Drop your reference image here</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            or click to browse · PNG, JPG, WEBP up to 10MB
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
      </div>
    );
  }

  // ─── STAGE: CROP ─────────────────────────────────────────────────
  if (stage === "crop" && rawImage && rawPreviewUrl) {
    return (
      <div className="space-y-5">
        {/* Size selector + picture actions */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
              Paper Size — sets crop ratio
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZES.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={optionBtn(size === s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <input id="change-file-crop" type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <button
              onClick={() => document.getElementById("change-file-crop")?.click()}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />Change
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />Remove
            </button>
          </div>
        </div>

        <ImageCropper
          imageSrc={rawPreviewUrl}
          fileName={rawImage.name}
          selectedSize={size}
          onConfirm={handleCropConfirm}
          onCancel={resetAll}
        />
      </div>
    );
  }

  // ─── STAGE: RESULT ───────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Cropped preview + actions */}
      {preview && (
        <div className="space-y-2">
          <div className="relative group rounded-xl overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border)]">
            <Image src={preview} alt="Cropped preview" width={600} height={400}
              className="w-full max-h-52 object-contain" />
            <button
              onClick={() => { setStage("crop"); setResult(null); }}
              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5" />Re-crop image
              </span>
            </button>
          </div>
          {/* Change / Remove */}
          <div className="flex gap-2">
            <input id="change-file-result" type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <button
              onClick={() => document.getElementById("change-file-result")?.click()}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />Change Picture
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />Remove Picture
            </button>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Paper Size</label>
          <div className="grid grid-cols-4 gap-1">
            {SIZES.map((s) => {
              const disabled = tooManyForSmall && (s === "A4" || s === "A5");
              return (
                <button
                  key={s}
                  disabled={disabled}
                  onClick={() => { setSize(s); if (result) analyze(s); }}
                  className={cn(optionBtn(size === s), disabled && "opacity-40 cursor-not-allowed")}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {tooManyForSmall && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              A4 &amp; A5 unavailable for 3+ subjects{sizeAutoUpgraded && " · auto-upgraded to A3"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Delivery</label>
          <div className="grid grid-cols-2 gap-1">
            {[{ label: "Standard", value: false }, { label: "Rush +35%", value: true }].map((opt) => (
              <button key={String(opt.value)} onClick={() => { setIsRush(opt.value); if (result) analyze(undefined, opt.value); }}
                className={optionBtn(isRush === opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
          {isRush && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
                Delivery in how many days? <span className="text-[var(--accent)]">(min. 3)</span>
              </label>
              <input
                type="number"
                min={3}
                value={rushDays}
                onChange={(e) => setRushDays(Math.max(3, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-md border border-[var(--accent)] bg-[var(--bg-card)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Standard delivery is 7–21 days. Rush orders are prioritised.
              </p>
            </div>
          )}
        </div>
      </div>

      <Button onClick={() => analyze()} disabled={!image || loading} size="lg" className="w-full">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing with AI...</>
          : <><ScanSearch className="w-4 h-4" />Detect & Estimate Price</>}
      </Button>

      {loading && (
        <p className="text-xs text-[var(--text-muted)] text-center">
          Running TensorFlow COCO-SSD + complexity analysis...
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-card)]">
          {/* Price header */}
          <div className="bg-[var(--accent)] text-[var(--accent-fg)] px-6 py-5 text-center">
            <p className="text-sm opacity-60">Estimated Price</p>
            <p className="text-4xl font-bold mt-1">
              {result.currency}{result.pricing.finalPrice.toLocaleString()}
            </p>
            <p className="text-xs opacity-50 mt-1">*Artist confirms final price after review</p>
          </div>

          {/* AI Detection */}
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide flex items-center gap-1.5">
                <ScanSearch className="w-3.5 h-3.5" />COCO-SSD Detected
              </p>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                TensorFlow.js
              </span>
            </div>

            {result.detection.detectedLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {result.detection.allObjects
                  .filter((o) => o.score >= 0.4)
                  .sort((a, b) => b.score - a.score)
                  .map((obj, i) => (
                    <span key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text)]">
                      {obj.label}
                      <span className="text-[var(--text-muted)]">{Math.round(obj.score * 100)}%</span>
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] mb-3">
                No subjects detected with high confidence.
              </p>
            )}

            {result.detection.subjectCount > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {result.detection.subjectCount} foreground subject{result.detection.subjectCount > 1 ? "s" : ""} detected
              </p>
            )}
          </div>

          {/* Complexity */}
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text)]">Image Complexity</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{result.complexity.description}</p>
            </div>
            <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", complexityColors[result.complexity.level])}>
              {result.complexity.label}
            </span>
          </div>

          {/* Score bar */}
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
              <span>Complexity Score</span><span>{result.complexity.score}/100</span>
            </div>
            <div className="w-full bg-[var(--bg-subtle)] rounded-full h-1.5">
              <div className="bg-[var(--accent)] h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${result.complexity.score}%` }} />
            </div>
          </div>

          {/* Breakdown */}
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1 uppercase tracking-wide">
              <ChevronDown className="w-3.5 h-3.5" />Price Breakdown
            </p>
            <div className="space-y-2 text-sm">
              {[
                [`Base (${size})`, `${result.currency}${result.pricing.breakdown.base}`],
                [`Complexity (${result.complexity.label})`, `×${result.pricing.breakdown.complexityMult}`],
                ...(result.pricing.breakdown.subjectMult > 1
                  ? [[`Subjects (${detectedSubjectKey})`, `×${result.pricing.breakdown.subjectMult}`]]
                  : []),
                ...(isRush ? [["Rush fee", `×${result.pricing.breakdown.rushMult}`]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-[var(--text-muted)]">
                  <span>{label}</span><span>{val}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-[var(--text)] border-t border-[var(--border)] pt-2 mt-1">
                <span>Total Estimate</span>
                <span>{result.currency}{result.pricing.finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {showProceedButton && onProceed && (
            <div className="px-5 pb-5">
              <Button className="w-full" size="lg"
                onClick={() => onProceed({ imageFile: image!, result, size, subjects: detectedSubjectKey, isRush, rushDays })}>
                <CheckCircle2 className="w-4 h-4" />Proceed to Commission
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
