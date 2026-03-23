"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import dynamic from "next/dynamic";

const P5Thumbnail = dynamic(() => import("@/components/canvas/P5Background"), { ssr: false });

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#", icon: "◈" },
  { label: "Behance", href: "#", icon: "◉" },
  { label: "Pinterest", href: "#", icon: "◆" },
  { label: "Email", href: "mailto:ksunil7077@gmail.com", icon: "◎" },
];

function MagneticLink({ label, href, icon }: { label: string; href: string; icon: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const RADIUS = 80;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS) {
        const pull = (1 - dist / RADIUS) * 0.4;
        gsap.to(el, { x: dx * pull, y: dy * pull, duration: 0.3, ease: "power2.out" });
      } else {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className="flex flex-col items-center gap-2 text-[#7a7570] hover:text-[#c9a96e] transition-colors duration-300 group"
    >
      <span className="text-2xl group-hover:scale-125 transition-transform duration-300 inline-block">
        {icon}
      </span>
      <span className="text-[9px] tracking-[0.4em] uppercase">{label}</span>
    </a>
  );
}

export default function PortfolioFooter() {
  return (
    <footer className="bg-[#080808] border-t border-[rgba(201,169,110,0.1)]">
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <h3
              className="text-3xl font-thin text-[#f0ece4] mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              Art From Heart
            </h3>
            <p className="text-[#7a7570] text-sm leading-relaxed mb-6">
              Portraits that transcend photography.
              <br />
              Capturing souls in graphite and light.
            </p>
            <div className="w-24 h-24 rounded-full overflow-hidden opacity-50 hover:opacity-100 transition-opacity duration-500">
              <P5Thumbnail />
            </div>
          </div>

          <div>
            <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-6">Navigate</p>
            <nav className="space-y-3">
              {[
                { label: "Portfolio", href: "/portfolio" },
                { label: "Commission", href: "/commission" },
                { label: "About", href: "/about" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-[#7a7570] text-sm hover:text-[#c9a96e] hover:translate-x-1 transition-all duration-300"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-6">Connect</p>
            <div className="flex gap-8 mb-10">
              {SOCIAL_LINKS.map((link) => (
                <MagneticLink key={link.label} {...link} />
              ))}
            </div>

            <p className="text-[#7a7570] text-xs tracking-[0.3em] uppercase mb-3">New work, first.</p>
            <div className="relative">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] pb-2 text-[#f0ece4] text-sm placeholder:text-[#7a7570]/50 focus:outline-none focus:border-[#c9a96e] transition-colors duration-300"
              />
              <button
                className="absolute right-0 bottom-2 text-[#c9a96e] text-xs tracking-widest uppercase hover:text-[#f0ece4] transition-colors"
                aria-label="Subscribe"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(201,169,110,0.08)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#7a7570] text-xs tracking-wider">
            © 2024 Art From Heart. All rights reserved.
          </p>
          <p
            className="text-[#c9a96e] text-sm font-thin"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            Made with care, stroke by stroke.
          </p>
        </div>
      </div>
    </footer>
  );
}
