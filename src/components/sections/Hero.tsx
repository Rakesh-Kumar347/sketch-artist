"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { useStore } from "@/store/useStore";
import Link from "next/link";

const HeroCanvas = dynamic(() => import("@/components/canvas/HeroCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#080808]" />,
});

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const setCursorType = useStore((s) => s.setCursorType);
  const preloaderDone = useStore((s) => s.preloaderDone);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      if (titleRef.current) {
        const text = titleRef.current.innerText;
        titleRef.current.innerHTML = text
          .split("")
          .map((c) =>
            c === " "
              ? "&nbsp;"
              : `<span class="inline-block overflow-hidden"><span class="inline-block" style="transform:translateY(100%)">${c}</span></span>`
          )
          .join("");

        const charSpans = titleRef.current.querySelectorAll("span > span");
        tl.to(charSpans, {
          y: 0,
          duration: 0.8,
          stagger: 0.03,
          ease: "power3.out",
        });
      }

      tl.from(
        labelRef.current,
        { opacity: 0, y: 20, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      );

      tl.from(
        sublineRef.current,
        { opacity: 0, y: 20, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      );

      tl.from(
        ctasRef.current,
        { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#080808]"
    >
      <HeroCanvas />

      <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/20 via-transparent to-[#080808]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/60 via-transparent to-[#080808]/20 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-end h-full pb-20 px-8 md:px-16 lg:px-24 max-w-7xl">
        <div className="max-w-2xl">
          <p ref={labelRef} className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-6">
            Portfolio 2024
          </p>

          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-[7rem] font-thin text-[#f0ece4] leading-[0.9] mb-6 tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            Art That Breathes
          </h1>

          <p
            ref={sublineRef}
            className="text-[#7a7570] text-sm tracking-[0.3em] uppercase mb-10"
          >
            Portraits · Illustrations · Commissions
          </p>

          <div ref={ctasRef} className="flex flex-wrap gap-4">
            <Link
              href="/portfolio"
              onMouseEnter={() => setCursorType("view")}
              onMouseLeave={() => setCursorType("default")}
              className="px-8 py-3.5 border border-[rgba(201,169,110,0.4)] text-[#f0ece4] text-sm tracking-[0.2em] uppercase hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-500"
            >
              Explore Works
            </Link>
            <Link
              href="/commission"
              onMouseEnter={() => setCursorType("order")}
              onMouseLeave={() => setCursorType("default")}
              className="px-8 py-3.5 bg-[#c9a96e] text-[#080808] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#d4a5a5] transition-all duration-500"
            >
              Order Portrait
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-3 text-[#7a7570]">
        <span className="text-[10px] tracking-[0.4em] uppercase rotate-90 origin-center mb-4">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-[#c9a96e] to-transparent animate-pulse" />
      </div>

      <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden lg:block">
        <p
          className="text-[#7a7570] text-[10px] tracking-[0.5em] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Art From Heart Studio
        </p>
      </div>
    </section>
  );
}
