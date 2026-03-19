import Link from "next/link";
import {
  Pencil,
  Sparkles,
  Image as ImageIcon,
  Send,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: <ImageIcon className="w-6 h-6" />,
    title: "Upload Your Photo",
    description:
      "Share any reference image — portrait, couple, pet, or landscape.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Instant Price Estimate",
    description:
      "Our local AI analyzes your image complexity and gives an instant quote.",
  },
  {
    icon: <Send className="w-6 h-6" />,
    title: "Commission the Sketch",
    description:
      "Submit your details. The artist reviews and confirms within 24 hours.",
  },
];

const testimonials = [
  {
    name: "Priya S.",
    text: "The portrait was stunning. Every strand of hair was perfectly captured. Absolutely worth it!",
    rating: 5,
  },
  {
    name: "Rahul M.",
    text: "Got a couple sketch done for our anniversary. My wife cried happy tears. Highly recommend!",
    rating: 5,
  },
  {
    name: "Anjali K.",
    text: "Amazing attention to detail. The pet portrait looked exactly like my dog. Will order again.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[var(--bg)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--bg-subtle)] rounded-full blur-3xl opacity-80" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[var(--bg-subtle)] rounded-full blur-3xl opacity-80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-full text-[var(--text-muted)] text-sm font-medium mb-6">
            <Pencil className="w-4 h-4" />
            Handcrafted Pencil Sketches
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--text)] leading-tight tracking-tight">
            Your Moments,{" "}
            <span className="relative inline-block">
              Sketched
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
              >
                <path
                  d="M2 8 C50 2, 150 12, 298 6"
                  stroke="var(--text-muted)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            With Love
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Transform your favorite photos into timeless pencil artwork. Upload
            an image, get an instant price — powered by local AI complexity
            analysis.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/commission">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Get a Sketch
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8"
              >
                View Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-[var(--bg-subtle)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)]">How It Works</h2>
            <p className="text-[var(--text-muted)] mt-2">
              From photo to masterpiece in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="relative bg-[var(--bg-card)] rounded-2xl p-7 border border-[var(--border)] group hover:border-[var(--text-muted)] transition-colors"
              >
                <div className="w-12 h-12 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <div className="absolute top-7 right-7 text-4xl font-bold text-[var(--border)] group-hover:text-[var(--text-muted)] transition-colors">
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-2">
                  {f.title}
                </h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 bg-[var(--accent)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[var(--accent-fg)]">
            Ready to turn your photo into art?
          </h2>
          <p className="text-[var(--accent-fg)] opacity-70 mb-8">
            Upload your image and get an instant price estimate. No commitment
            required.
          </p>
          <Link href="/commission">
            <Button
              size="lg"
              className="bg-[var(--bg)] text-[var(--text)] hover:opacity-90 text-base px-10"
            >
              Try the Estimator Free
              <Sparkles className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[var(--bg)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)]">
              What Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="text-[var(--text)] font-semibold text-sm">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
