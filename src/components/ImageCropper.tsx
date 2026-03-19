"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { ZoomIn, ZoomOut, RotateCcw, Check, FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getCroppedImageFile,
  getPaperAspectRatio,
  getBorderFraction,
  PAPER_DIMENSIONS,
  FRAME_BORDER_MM,
  type PixelCrop,
} from "@/lib/cropImage";
import type { Area } from "react-easy-crop";

const CONTAINER_HEIGHT = 380;

interface Props {
  imageSrc: string;
  fileName: string;
  selectedSize: "A5" | "A4" | "A3" | "A2";
  onConfirm: (croppedFile: File, previewUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageSrc,
  fileName,
  selectedSize,
  onConfirm,
  onCancel,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showBorder, setShowBorder] = useState(true);

  // Track container width to accurately calculate crop box screen position
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const aspect = getPaperAspectRatio(orientation);

  // Calculate where the crop box sits within the container (px)
  // react-easy-crop centers the crop area, fitting it inside the container
  const cropBoxW = Math.min(containerWidth, CONTAINER_HEIGHT * aspect);
  const cropBoxH = Math.min(CONTAINER_HEIGHT, containerWidth / aspect);
  const cropBoxLeft = (containerWidth - cropBoxW) / 2;
  const cropBoxTop = (CONTAINER_HEIGHT - cropBoxH) / 2;

  // Convert 1cm border to pixel fractions
  const borderFrac = getBorderFraction(selectedSize, orientation);
  const borderPxX = cropBoxW * borderFrac.x;
  const borderPxY = cropBoxH * borderFrac.y;

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels as PixelCrop);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedFile = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName);
      const previewUrl = URL.createObjectURL(croppedFile);
      onConfirm(croppedFile, previewUrl);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text)]">Crop your image</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {selectedSize} · {PAPER_DIMENSIONS[selectedSize].mm} ·{" "}
            {orientation === "portrait" ? "Portrait" : "Landscape"}
          </p>
        </div>
        <button
          onClick={() => setOrientation((o) => o === "portrait" ? "landscape" : "portrait")}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
          {orientation === "portrait" ? "Landscape" : "Portrait"}
        </button>
      </div>

      {/* Crop canvas */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden bg-stone-900"
        style={{ height: `${CONTAINER_HEIGHT}px` }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          cropShape="rect"
          showGrid
          style={{
            containerStyle: { borderRadius: "0.75rem" },
            cropAreaStyle: {
              border: "2px solid rgba(255,255,255,0.7)",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            },
          }}
        />

        {/* ── Frame border overlay ────────────────────────────────── */}
        {showBorder && containerWidth > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: cropBoxLeft + borderPxX,
              top:  cropBoxTop  + borderPxY,
              width:  cropBoxW - 2 * borderPxX,
              height: cropBoxH - 2 * borderPxY,
            }}
          >
            {/* Dashed inner border rectangle */}
            <div
              className="absolute inset-0 rounded-[1px]"
              style={{
                border: "1.5px dashed rgba(251,191,36,0.9)", // amber dashed line
                boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.15)",
              }}
            />

            {/* Corner accents */}
            {[
              "top-0 left-0 border-t-2 border-l-2",
              "top-0 right-0 border-t-2 border-r-2",
              "bottom-0 left-0 border-b-2 border-l-2",
              "bottom-0 right-0 border-b-2 border-r-2",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 border-amber-400 ${cls}`}
              />
            ))}

            {/* Shaded margins (the 1cm zones between crop edge and drawable area) */}
            {/* Top strip */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: -borderPxY,
                left: -borderPxX,
                width: cropBoxW - 2 * borderPxX + 2 * borderPxX,
                height: borderPxY,
                background: "rgba(251,191,36,0.08)",
                borderBottom: "1px dashed rgba(251,191,36,0.4)",
              }}
            />
            {/* Bottom strip */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: -borderPxY,
                left: -borderPxX,
                width: cropBoxW,
                height: borderPxY,
                background: "rgba(251,191,36,0.08)",
                borderTop: "1px dashed rgba(251,191,36,0.4)",
              }}
            />
            {/* Left strip */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: 0,
                left: -borderPxX,
                width: borderPxX,
                height: cropBoxH - 2 * borderPxY,
                background: "rgba(251,191,36,0.08)",
                borderRight: "1px dashed rgba(251,191,36,0.4)",
              }}
            />
            {/* Right strip */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: 0,
                right: -borderPxX,
                width: borderPxX,
                height: cropBoxH - 2 * borderPxY,
                background: "rgba(251,191,36,0.08)",
                borderLeft: "1px dashed rgba(251,191,36,0.4)",
              }}
            />

            {/* "1cm" label — top margin */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: -borderPxY,
                left: "50%",
                transform: "translateX(-50%)",
                height: borderPxY,
                fontSize: "9px",
                color: "rgba(251,191,36,0.9)",
                whiteSpace: "nowrap",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {FRAME_BORDER_MM}mm
            </div>

            {/* "1cm" label — left margin (rotated) */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                left: -borderPxX,
                top: "50%",
                transform: "translateY(-50%) rotate(-90deg)",
                width: borderPxX,
                fontSize: "9px",
                color: "rgba(251,191,36,0.9)",
                whiteSpace: "nowrap",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {FRAME_BORDER_MM}mm
            </div>
          </div>
        )}

        {/* ── Info chips ─────────────────────────────────────────── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            {selectedSize} — {PAPER_DIMENSIONS[selectedSize].mm}
          </div>
          {showBorder && (
            <div className="bg-amber-500/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
              <span className="inline-block w-2 h-2 border border-white rounded-sm opacity-80" />
              {FRAME_BORDER_MM}mm frame margin
            </div>
          )}
        </div>

        {/* Toggle border visibility */}
        <button
          onClick={() => setShowBorder((v) => !v)}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm transition-colors"
        >
          {showBorder ? "Hide border" : "Show border"}
        </button>
      </div>

      {/* Legend */}
      {showBorder && (
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-4 h-0 border-t-2 border-dashed border-amber-400" />
            <span>Frame border ({FRAME_BORDER_MM}mm each side)</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-4 h-3 bg-amber-400/20 border border-amber-400/50 rounded-[1px]" />
            <span>Margin area</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <div className="w-4 h-0 border-t-2 border-white/70" />
            <span>Sketch area</span>
          </div>
        </div>
      )}

      {/* Zoom slider */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
          className="p-1.5 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <input
            type="range" min={1} max={3} step={0.05} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent) ${((zoom - 1) / 2) * 100}%, var(--border) 0%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
            <span>1×</span>
            <span className="font-medium text-[var(--text)]">{zoom.toFixed(2)}×</span>
            <span>3×</span>
          </div>
        </div>
        <button
          onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
          className="p-1.5 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset} title="Reset zoom & position"
          className="p-1.5 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Paper size reference tiles */}
      <div className="grid grid-cols-4 gap-2">
        {(["A5", "A4", "A3", "A2"] as const).map((s) => (
          <div
            key={s}
            className={cn(
              "rounded-lg border p-2 text-center transition-colors",
              s === selectedSize
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                : "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)]"
            )}
          >
            <p className="text-xs font-bold">{s}</p>
            <p className="text-[10px] leading-tight mt-0.5 opacity-70">
              {PAPER_DIMENSIONS[s].mm.replace(" × ", "×")}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center -mt-1">
        Drag to reposition · Use slider or pinch to zoom
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleConfirm} disabled={processing} className="flex-1">
          {processing ? "Applying..." : <><Check className="w-4 h-4" />Use this crop</>}
        </Button>
      </div>
    </div>
  );
}
