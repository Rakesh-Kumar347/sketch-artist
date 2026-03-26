"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useStore } from "@/store/useStore";

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(false);
  const setPreloaderDone = useStore((s) => s.setPreloaderDone);

  useEffect(() => {
    if (sessionStorage.getItem("preloaderSeen")) {
      setSkip(true);
      setPreloaderDone();
      return;
    }

    const ctx = gsap.context(() => {
      const counter = { val: 0 };
      gsap.to(counter, {
        val: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => setCount(Math.round(counter.val)),
        onComplete: () => {
          sessionStorage.setItem("preloaderSeen", "1");
          gsap.timeline()
            .to(topPanelRef.current, { y: "-100%", duration: 0.6, ease: "power3.in" })
            .to(bottomPanelRef.current, { y: "100%", duration: 0.6, ease: "power3.in" }, "<0.1")
            .to(containerRef.current, {
              opacity: 0,
              pointerEvents: "none",
              duration: 0.4,
              onComplete: setPreloaderDone,
            });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [setPreloaderDone]);

  if (skip) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center overflow-hidden"
    >
      <div
        ref={topPanelRef}
        className="absolute top-0 left-0 right-0 bg-[#080808]"
        style={{ height: "50%" }}
      />
      <div
        ref={bottomPanelRef}
        className="absolute bottom-0 left-0 right-0 bg-[#080808]"
        style={{ height: "50%" }}
      />

      <div className="relative z-10 text-center">
        <div className="mb-8">
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto mb-4">
            <circle cx="40" cy="40" r="38" fill="none" stroke="#c9a96e" strokeWidth="1" opacity="0.3" />
            <path
              d="M20,40 Q30,20 40,40 Q50,60 60,40"
              fill="none"
              stroke="#c9a96e"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                strokeDasharray: 80,
                strokeDashoffset: 80,
                animation: "drawPath 2s ease forwards",
              }}
            />
          </svg>
          <style>{`
            @keyframes drawPath {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </div>

        <p className="text-[#7a7570] text-xs tracking-[0.4em] uppercase mb-6">
          Art From Heart
        </p>

        <div className="flex items-center gap-4">
          <div className="h-px bg-[#7a7570] w-16 opacity-30" />
          <span
            className="text-[#c9a96e] text-4xl font-thin tabular-nums"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {count}
          </span>
          <span className="text-[#7a7570] text-sm">%</span>
          <div className="h-px bg-[#7a7570] w-16 opacity-30" />
        </div>

        <div className="mt-6 w-64 h-px bg-[rgba(201,169,110,0.15)] mx-auto overflow-hidden">
          <div
            className="h-full bg-[#c9a96e] transition-all duration-100"
            style={{ width: `${count}%` }}
          />
        </div>
      </div>
    </div>
  );
}
