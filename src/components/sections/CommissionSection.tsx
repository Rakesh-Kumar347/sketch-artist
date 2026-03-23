"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useMouseParallax } from "@/hooks/useMouseParallax";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PACKAGES = [
  {
    name: "Pencil Sketch",
    price: "₹1,499",
    priceNote: "starting from",
    features: ["A4 / A5 Size", "1 Subject", "Graphite on Paper", "5–7 Days", "Digital Scan"],
    accent: "#7a7570",
    popular: false,
  },
  {
    name: "Color Portrait",
    price: "₹3,999",
    priceNote: "starting from",
    features: [
      "A3 Size",
      "Up to 2 Subjects",
      "Colored Pencil / Pastel",
      "7–10 Days",
      "High-Res Digital + Print",
    ],
    accent: "#c9a96e",
    popular: true,
  },
  {
    name: "Detailed Digital",
    price: "₹5,999",
    priceNote: "starting from",
    features: [
      "Any Size",
      "Up to 4 Subjects",
      "Digital Painting",
      "10–14 Days",
      "Unlimited Revisions",
    ],
    accent: "#d4a5a5",
    popular: false,
  },
];

export default function CommissionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const setCursorType = useStore((s) => s.setCursorType);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".price-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        rotateX: 25,
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
        transformOrigin: "top center",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6 md:px-16 lg:px-24 bg-[#080808]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4">Commission a Portrait</p>
          <h2
            className="text-5xl md:text-6xl font-thin text-[#f0ece4] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            Invest in Timeless Art
          </h2>
          <p className="text-[#7a7570] text-sm max-w-lg mx-auto leading-relaxed">
            Each portrait is crafted with obsessive care. Choose a package that fits your vision
            — or use our AI estimator for a custom quote.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {PACKAGES.map((pkg) => (
            <PriceCard
              key={pkg.name}
              pkg={pkg}
              onMouseEnter={() => setCursorType("order")}
              onMouseLeave={() => setCursorType("default")}
            />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/commission"
            onMouseEnter={() => setCursorType("order")}
            onMouseLeave={() => setCursorType("default")}
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#c9a96e] text-[#080808] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#d4a5a5] transition-colors duration-500 group"
          >
            Start Your Commission
            <span className="w-6 h-px bg-current transition-all duration-300 group-hover:w-10" />
          </Link>
          <p className="text-[#7a7570] text-xs mt-4">
            Use our AI price estimator on the commission page for an instant custom quote
          </p>
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  pkg,
  onMouseEnter,
  onMouseLeave,
}: {
  pkg: (typeof PACKAGES)[0];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const parallax = useMouseParallax(0.02);

  return (
    <motion.div
      className="price-card relative p-8 border overflow-hidden"
      style={{
        borderColor: pkg.popular ? "rgba(201,169,110,0.4)" : "rgba(201,169,110,0.12)",
        background: pkg.popular
          ? "linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(26,25,23,1) 100%)"
          : "#111010",
        transform: `perspective(1000px) rotateX(${parallax.y * 8}deg) rotateY(${parallax.x * 8}deg)`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ y: -8, borderColor: `${pkg.accent}60` }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `conic-gradient(from 180deg at 50% 50%, ${pkg.accent}, transparent, ${pkg.accent})`,
          animation: "rotateMesh 8s linear infinite",
        }}
      />

      {pkg.popular && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-[#c9a96e] text-[#080808] text-[9px] tracking-[0.3em] uppercase font-medium">
          Popular
        </div>
      )}

      <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: pkg.accent }}>
        {pkg.name}
      </p>

      <div className="mb-8">
        <span
          className="text-4xl font-thin"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: pkg.accent }}
        >
          {pkg.price}
        </span>
        <span className="text-[#7a7570] text-xs ml-2">{pkg.priceNote}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-[#7a7570] text-sm">
            <span style={{ color: pkg.accent }} className="text-xs">
              ◆
            </span>
            {f}
          </li>
        ))}
      </ul>

      <style>{`
        @keyframes rotateMesh {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
