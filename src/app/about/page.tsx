import { Pencil, Award, Clock, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — ArtFromHeart",
  description: "Meet the artist behind ArtFromHeart.",
};

const stats = [
  { icon: <Pencil className="w-5 h-5" />, value: "200+", label: "Sketches Completed" },
  { icon: <Clock className="w-5 h-5" />, value: "5+", label: "Years of Experience" },
  { icon: <Award className="w-5 h-5" />, value: "100%", label: "Satisfaction Rate" },
  { icon: <Heart className="w-5 h-5" />, value: "∞", label: "Passion for Art" },
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--text)]">About the Artist</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-xl mx-auto">
          Every sketch is a story. Here&apos;s the story behind the artist.
        </p>
      </div>

      {/* Artist bio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl aspect-[4/5] flex items-center justify-center">
          <div className="text-center text-[var(--text-muted)]">
            <Pencil className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Artist Photo</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Passion Drawn on Paper
          </h2>
          <div className="space-y-4 text-[var(--text-muted)] leading-relaxed text-sm">
            <p>
              I&apos;ve been drawing since I was a child, filling notebooks with
              faces, landscapes, and everything that caught my eye. What started
              as a hobby has grown into a deep passion for pencil art.
            </p>
            <p>
              I specialize in detailed pencil portraits — capturing not just the
              likeness of a person, but their expression, emotion, and
              personality. Each sketch takes hours of careful work, and I pour
              my heart into every single one.
            </p>
            <p>
              Whether it&apos;s a family portrait, a beloved pet, or a memorable
              moment — I believe every image has a story worth telling through
              art.
            </p>
          </div>
          <div className="mt-8">
            <Link href="/commission">
              <Button size="lg">Commission Your Sketch</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 text-center"
          >
            <div className="w-10 h-10 bg-[var(--bg-subtle)] rounded-lg flex items-center justify-center mx-auto mb-3 text-[var(--text-muted)]">
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Process */}
      <div>
        <h2 className="text-3xl font-bold text-[var(--text)] text-center mb-10">
          The Process
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {process.map((p) => (
            <div
              key={p.step}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex gap-4"
            >
              <div className="text-4xl font-bold text-[var(--border)] leading-none shrink-0 pt-1">
                {p.step}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)] mb-1.5">{p.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
