"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  {
    number: "01",
    title: "Concept",
    description:
      "We begin with a conversation — understanding the story you want told. What emotion should breathe from the canvas? Who is the subject beyond the photograph?",
    icon: "◯",
    color: "#c9a96e",
  },
  {
    number: "02",
    title: "Sketch",
    description:
      "Thumbnails and rough studies. Finding the composition that honors the subject's spirit. This is where instinct and technique begin their dialogue.",
    icon: "✦",
    color: "#d4a5a5",
  },
  {
    number: "03",
    title: "Refine",
    description:
      "Layer by layer, stroke by stroke. Every shadow placed with intention, every highlight chosen with care. The portrait begins to breathe.",
    icon: "◈",
    color: "#c9a96e",
  },
  {
    number: "04",
    title: "Deliver",
    description:
      "High-resolution file delivery with optional physical print. A portrait crafted to become a family heirloom.",
    icon: "✓",
    color: "#f0ece4",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(lineRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "bottom 30%",
          scrub: 1,
        },
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.from(".process-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6 md:px-16 lg:px-24 bg-[#1a1917] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4">The Process</p>
          <h2
            className="text-5xl md:text-6xl font-thin text-[#f0ece4]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            How a Portrait
            <br />
            <span className="text-[#c9a96e]">Comes to Life</span>
          </h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-[rgba(201,169,110,0.12)] overflow-hidden">
            <div
              ref={lineRef}
              className="h-full bg-gradient-to-r from-[#c9a96e] to-[#d4a5a5]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="process-card relative"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div
                  className="w-12 h-12 rounded-full border flex items-center justify-center mb-6 text-xl relative z-10 bg-[#1a1917]"
                  style={{ borderColor: `${step.color}40`, color: step.color }}
                >
                  {step.icon}
                </div>

                <span className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase mb-3 block opacity-60">
                  {step.number}
                </span>
                <h3
                  className="text-2xl font-thin text-[#f0ece4] mb-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-[#7a7570] text-sm leading-relaxed">{step.description}</p>

                {i < STEPS.length - 1 && (
                  <div className="md:hidden absolute left-6 top-12 w-px h-full bg-[rgba(201,169,110,0.15)]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
