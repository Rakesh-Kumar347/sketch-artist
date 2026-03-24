import { Pencil, Award, Clock, Heart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About — Art From Heart",
  description: "Meet the artist behind Art From Heart.",
};

const stats = [
  { icon: <Pencil className="w-5 h-5" />, value: "500+", label: "Portraits" },
  { icon: <Clock className="w-5 h-5" />, value: "8+", label: "Years" },
  { icon: <Award className="w-5 h-5" />, value: "100%", label: "Satisfaction" },
  { icon: <Heart className="w-5 h-5" />, value: "∞", label: "Passion" },
];

const process = [
  {
    step: "01",
    title: "Reference Collection",
    desc: "The artist studies your reference photo carefully, noting the lighting, shadows, and key details that make the subject unique.",
  },
  {
    step: "02",
    title: "Sketching the Foundation",
    desc: "Starting with light strokes, the composition and proportions are laid out with precision before committing to details.",
  },
  {
    step: "03",
    title: "Building Depth",
    desc: "Layer by layer, shading and tone are added to bring the sketch to life with realistic depth and dimension.",
  },
  {
    step: "04",
    title: "Final Detailing",
    desc: "The finishing touches — fine lines, highlights, and texture — transform the sketch into a complete work of art.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#080808] min-h-screen pt-16">
      {/* Hero */}
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4">The Artist</p>
        <h1
          className="text-5xl md:text-7xl font-thin text-[#f0ece4] leading-tight mb-16"
          style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
        >
          Passion Drawn<br />
          <span className="text-[#c9a96e]">on Paper</span>
        </h1>

        {/* Bio grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start mb-24">
          <div className="bg-[#1a1917] border border-[rgba(201,169,110,0.15)] aspect-[4/5] flex items-center justify-center">
            <div className="text-center text-[#7a7570]">
              <Pencil className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-xs tracking-[0.3em] uppercase opacity-50">Artist Photo</p>
            </div>
          </div>

          <div className="py-4">
            <div className="space-y-5 text-[#7a7570] leading-relaxed text-sm mb-10">
              <p>
                A self-taught sketch artist with over 8 years of experience capturing the human
                spirit in graphite and digital media. Based in India, creating portraits that
                transcend photography to reveal the emotional truth beneath the surface.
              </p>
              <p>
                Each commission is a deeply personal collaboration — studying the subject&apos;s
                essence before a single line is drawn, finding the light that makes them
                uniquely alive.
              </p>
              <p>
                From pencil sketches to detailed digital illustrations, every piece is crafted
                with the obsessive attention to detail that transforms a portrait into an heirloom.
              </p>
            </div>

            <Link
              href="/commission"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#c9a96e] text-[#080808] text-xs tracking-[0.3em] uppercase font-medium hover:bg-[#d4a5a5] transition-colors duration-300 group"
            >
              Commission Your Portrait
              <span className="w-5 h-px bg-current transition-all duration-300 group-hover:w-8" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[#1a1917] border border-[rgba(201,169,110,0.12)] p-6 text-center"
            >
              <div className="w-10 h-10 border border-[rgba(201,169,110,0.2)] flex items-center justify-center mx-auto mb-4 text-[#c9a96e]">
                {s.icon}
              </div>
              <p
                className="text-3xl font-thin text-[#c9a96e] mb-1"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {s.value}
              </p>
              <p className="text-[#7a7570] text-[10px] tracking-[0.3em] uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Process */}
        <div>
          <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4">The Process</p>
          <h2
            className="text-4xl md:text-5xl font-thin text-[#f0ece4] mb-12"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            How a Portrait Comes to Life
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {process.map((p) => (
              <div
                key={p.step}
                className="bg-[#1a1917] border border-[rgba(201,169,110,0.12)] p-6 flex gap-5"
              >
                <div
                  className="text-4xl font-thin text-[rgba(201,169,110,0.2)] leading-none shrink-0 pt-1"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {p.step}
                </div>
                <div>
                  <h3 className="text-[#f0ece4] font-light mb-2 tracking-wide">{p.title}</h3>
                  <p className="text-[#7a7570] text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
