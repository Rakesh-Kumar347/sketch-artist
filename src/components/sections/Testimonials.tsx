"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TESTIMONIALS = [
  {
    text: "The portrait captured something photographs never could — the quiet strength in my daughter's eyes, the way her smile holds a secret. This is not just art. It is memory made permanent.",
    author: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
  },
  {
    text: "I commissioned a portrait of my late father and received something that made my entire family weep — not with sadness, but with the profound recognition of having him back, alive in graphite.",
    author: "Rohan Mehta",
    location: "Bangalore",
    rating: 5,
  },
  {
    text: "The detail is extraordinary. Every line, every shadow placed with surgical precision yet impossible warmth. My wife and I will treasure this anniversary gift for generations.",
    author: "Arjun Nair",
    location: "Chennai",
    rating: 5,
  },
  {
    text: "As an interior designer, I commission art constantly. I have never encountered an artist who combines technical mastery with such emotional intelligence. Truly exceptional.",
    author: "Kavya Reddy",
    location: "Hyderabad",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const testimonial = TESTIMONIALS[current];

  return (
    <section className="py-28 px-6 md:px-16 lg:px-24 bg-[#111010] relative overflow-hidden">
      <div
        className="absolute top-12 left-10 text-[20rem] font-thin text-[rgba(201,169,110,0.03)] leading-none select-none pointer-events-none"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        &ldquo;
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-12">Kind Words</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p
              className="text-2xl md:text-3xl font-thin text-[#f0ece4] leading-relaxed mb-10"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              &ldquo;{testimonial.text}&rdquo;
            </p>

            <div className="flex items-center justify-center gap-1 mb-5">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <span key={i} className="text-[#c9a96e] text-sm">
                  ★
                </span>
              ))}
            </div>

            <p className="text-[#f0ece4] text-sm font-medium tracking-wider">{testimonial.author}</p>
            <p className="text-[#7a7570] text-xs tracking-[0.3em] uppercase mt-1">{testimonial.location}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3 mt-12">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                if (timerRef.current) clearInterval(timerRef.current);
              }}
              aria-label={`Go to testimonial ${i + 1}`}
              className="transition-all duration-300"
              style={{
                width: i === current ? "24px" : "6px",
                height: "6px",
                borderRadius: i === current ? "3px" : "50%",
                background: i === current ? "#c9a96e" : "rgba(201,169,110,0.3)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
