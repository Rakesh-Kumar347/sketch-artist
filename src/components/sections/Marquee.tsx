"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const ITEMS = [
  "PORTRAITS",
  "DIGITAL ART",
  "COMMISSIONS",
  "ILLUSTRATIONS",
  "FINE ART",
  "PENCIL SKETCHES",
  "WATERCOLOR",
  "CHARCOAL",
];

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    animRef.current = gsap.to(track, {
      xPercent: -50,
      repeat: -1,
      duration: 30,
      ease: "none",
    });

    const container = track.parentElement;
    if (!container) return;

    const onEnter = () => animRef.current?.timeScale(0.3);
    const onLeave = () => animRef.current?.timeScale(1);

    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      animRef.current?.kill();
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const allItems = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="relative w-full overflow-hidden bg-[#111010] border-y border-[rgba(201,169,110,0.12)] py-5">
      <div ref={trackRef} className="flex items-center gap-0 whitespace-nowrap" style={{ width: "200%" }}>
        {allItems.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span
              className="text-xs tracking-[0.5em] uppercase px-8"
              style={{
                color: i % 3 === 1 ? "#c9a96e" : "#7a7570",
                fontStyle: i % 4 === 2 ? "italic" : "normal",
                fontFamily: i % 4 === 2 ? "'Cormorant Garamond', serif" : undefined,
                fontSize: i % 4 === 2 ? "14px" : "10px",
              }}
            >
              {item}
            </span>
            <span className="text-[#c9a96e] text-xs opacity-40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
