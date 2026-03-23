"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";

const P5Background = dynamic(() => import("@/components/canvas/P5Background"), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const QUOTE = "Every stroke carries\na piece of the soul.\nEvery portrait holds\nan eternal moment.";

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = quoteRef.current?.querySelectorAll(".word");
      if (words) {
        gsap.from(words, {
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 75%",
            end: "bottom 25%",
            scrub: 1,
          },
          opacity: 0.1,
          y: 10,
          stagger: 0.05,
        });
      }

      gsap.from(bioRef.current?.querySelectorAll(".bio-para") ?? [], {
        scrollTrigger: {
          trigger: bioRef.current,
          start: "top 80%",
        },
        x: -30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-28 overflow-hidden bg-[#111010]">
      <div className="absolute inset-0 opacity-30">
        <P5Background />
      </div>

      <div className="relative z-10 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          <div ref={quoteRef}>
            <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-8">The Artist</p>
            <div
              className="text-4xl md:text-5xl lg:text-6xl font-thin text-[#f0ece4] leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              {QUOTE.split("\n").map((line, li) => (
                <div key={li}>
                  {line.split(" ").map((word, wi) => (
                    <span key={wi} className="word inline-block mr-[0.3em]">
                      {word}
                    </span>
                  ))}
                  <br />
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="h-px w-12 bg-[#c9a96e] opacity-60" />
              <span
                className="text-[#c9a96e] text-xl font-thin"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
              >
                The Artist
              </span>
            </div>
          </div>

          <div ref={bioRef} className="space-y-6">
            {[
              "A self-taught sketch artist with over 8 years of experience capturing the human spirit in graphite and digital media. Based in India, creating portraits that transcend photography to reveal the emotional truth beneath the surface.",
              "Each commission is a deeply personal collaboration — studying the subject's essence before a single line is drawn, finding the light that makes them uniquely alive.",
              "From pencil sketches to detailed digital illustrations, every piece is crafted with the obsessive attention to detail that transforms a portrait into an heirloom.",
            ].map((para, i) => (
              <p key={i} className="bio-para text-[#7a7570] leading-relaxed text-sm">
                {para}
              </p>
            ))}

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[rgba(201,169,110,0.12)]">
              {[
                { num: "500+", label: "Portraits" },
                { num: "8+", label: "Years" },
                { num: "98%", label: "Happy Clients" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p
                    className="text-3xl font-thin text-[#c9a96e] mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {num}
                  </p>
                  <p className="text-[#7a7570] text-xs tracking-[0.3em] uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
