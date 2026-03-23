"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/store/useStore";
import { ARTWORKS, type Artwork } from "@/lib/artworks";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Gallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { openModal, setCursorType } = useStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll(".artwork-card");
      if (!cards) return;

      cards.forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          y: 60,
          opacity: 0,
          duration: 0.9,
          delay: i * 0.12,
          ease: "power3.out",
        });
      });

      gsap.from(headingRef.current, {
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6 md:px-16 lg:px-24 bg-[#080808]">
      <div ref={headingRef} className="mb-16">
        <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4">Selected Works</p>
        <div className="flex items-end justify-between">
          <h2
            className="text-5xl md:text-7xl font-thin text-[#f0ece4] leading-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            Featured
            <br />
            <span className="text-[#c9a96e]">Artworks</span>
          </h2>
          <Link
            href="/portfolio"
            onMouseEnter={() => setCursorType("view")}
            onMouseLeave={() => setCursorType("default")}
            className="hidden md:flex items-center gap-2 text-[#7a7570] text-sm tracking-[0.2em] uppercase hover:text-[#c9a96e] transition-colors duration-300 group"
          >
            View All
            <span className="w-8 h-px bg-current transition-all duration-300 group-hover:w-12" />
          </Link>
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ARTWORKS.map((artwork, i) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            index={i}
            onOpen={() => openModal(artwork)}
          />
        ))}
      </div>

      <ArtworkModal />
    </section>
  );
}

function ArtworkCard({
  artwork,
  index,
  onOpen,
}: {
  artwork: Artwork;
  index: number;
  onOpen: () => void;
}) {
  const { setCursorType } = useStore();
  const isLarge = index === 0 || index === 3;

  return (
    <motion.div
      className={`artwork-card relative overflow-hidden cursor-pointer group ${
        isLarge ? "md:col-span-1 lg:row-span-2" : ""
      }`}
      style={{ aspectRatio: isLarge ? "3/4" : "4/3" }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onOpen}
      onMouseEnter={() => setCursorType("view")}
      onMouseLeave={() => setCursorType("default")}
    >
      <Image
        src={artwork.image}
        alt={artwork.title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-[#080808]/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <span className="text-[#c9a96e] text-[10px] tracking-[0.4em] uppercase mb-1 block">
          {artwork.category} · {artwork.year}
        </span>
        <h3
          className="text-[#f0ece4] text-xl font-light mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {artwork.title}
        </h3>
        <p className="text-[#7a7570] text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
          {artwork.medium}
        </p>
      </div>

      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[rgba(201,169,110,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[rgba(201,169,110,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}

function ArtworkModal() {
  const { modalOpen, activeArtwork, closeModal, setCursorType } = useStore();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeModal]);

  return (
    <AnimatePresence>
      {modalOpen && activeArtwork && (
        <motion.div
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-xl" />

          <motion.div
            className="relative z-10 w-full max-w-5xl bg-[#1a1917] border border-[rgba(201,169,110,0.15)] overflow-hidden"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-square md:aspect-auto" style={{ minHeight: "300px" }}>
                <Image
                  src={activeArtwork.image}
                  alt={activeArtwork.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase mb-4">
                    {activeArtwork.category} · {activeArtwork.year}
                  </p>
                  <h2
                    className="text-4xl md:text-5xl font-thin text-[#f0ece4] mb-3 leading-tight"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
                  >
                    {activeArtwork.title}
                  </h2>
                  <p className="text-[#7a7570] text-sm mb-6">{activeArtwork.medium}</p>
                  <p className="text-[#f0ece4]/70 text-sm leading-relaxed">
                    {activeArtwork.description}
                  </p>
                </div>

                <div className="space-y-4 mt-8">
                  <p
                    className="text-[#c9a96e] text-2xl font-light"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {activeArtwork.price}
                  </p>
                  <Link
                    href="/commission"
                    onClick={closeModal}
                    onMouseEnter={() => setCursorType("order")}
                    onMouseLeave={() => setCursorType("default")}
                    className="block w-full text-center py-3.5 bg-[#c9a96e] text-[#080808] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#d4a5a5] transition-colors duration-300"
                  >
                    Order Similar Portrait
                  </Link>
                  <button
                    onClick={closeModal}
                    className="block w-full text-center py-3.5 border border-[rgba(201,169,110,0.3)] text-[#7a7570] text-sm tracking-[0.2em] uppercase hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
