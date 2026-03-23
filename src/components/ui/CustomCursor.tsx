"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useStore } from "@/store/useStore";

const LABELS: Record<string, string> = {
  default: "",
  view: "VIEW",
  drag: "DRAG",
  order: "ORDER",
  play: "PLAY",
};

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const cursorType = useStore((s) => s.cursorType);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    if (cursorType !== "default") {
      gsap.to(ring, { scale: 3, borderColor: "rgba(201,169,110,0.6)", duration: 0.3, ease: "power2.out" });
      gsap.to(cursor, { scale: 0.3, duration: 0.3 });
    } else {
      gsap.to(ring, { scale: 1, borderColor: "rgba(201,169,110,0.8)", duration: 0.3 });
      gsap.to(cursor, { scale: 1, duration: 0.3 });
    }
  }, [cursorType]);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="w-2 h-2 bg-[#c9a96e] rounded-full" />
      </div>

      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="w-10 h-10 rounded-full border border-[rgba(201,169,110,0.8)] flex items-center justify-center">
          <span ref={labelRef} className="text-[8px] font-medium text-[#c9a96e] tracking-widest">
            {LABELS[cursorType]}
          </span>
        </div>
      </div>
    </>
  );
}
