"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioImage } from "@/lib/cloudinary";

const CATEGORIES = ["All", "Portrait", "Animal", "Landscape", "Couple", "Child", "Other"];

interface Props {
  initialImages?: PortfolioImage[];
}

export default function PortfolioGallery({ initialImages = [] }: Props) {
  const [images, setImages] = useState<PortfolioImage[]>(initialImages);
  const [filtered, setFiltered] = useState<PortfolioImage[]>(initialImages);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<PortfolioImage | null>(null);
  const [loading, setLoading] = useState(initialImages.length === 0);

  useEffect(() => {
    if (initialImages.length === 0) {
      fetch("/api/portfolio")
        .then((r) => r.json())
        .then((data) => {
          setImages(data.images || []);
          setFiltered(data.images || []);
        })
        .finally(() => setLoading(false));
    }
  }, [initialImages.length]);

  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(images);
    } else {
      setFiltered(images.filter((img) => img.category === activeCategory));
    }
  }, [activeCategory, images]);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
              activeCategory === cat
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-stone-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No artworks yet in this category.</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      )}

      {/* Gallery grid */}
      {!loading && filtered.length > 0 && (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((img) => (
            <div
              key={img.id}
              className="group relative break-inside-avoid cursor-pointer rounded-lg overflow-hidden bg-stone-100"
              onClick={() => setLightbox(img)}
            >
              <Image
                src={img.url}
                alt={img.title}
                width={400}
                height={400}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-medium text-sm truncate">
                    {img.title}
                  </p>
                  <p className="text-stone-300 text-xs">{img.category}</p>
                </div>
                <ZoomIn className="absolute top-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-stone-300 transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.url}
              alt={lightbox.title}
              width={1200}
              height={900}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">{lightbox.title}</h3>
              <p className="text-stone-400 text-sm mt-1">{lightbox.category}</p>
              {lightbox.description && (
                <p className="text-stone-300 text-sm mt-2 max-w-lg mx-auto">
                  {lightbox.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
