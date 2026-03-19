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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-stone-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-stone-100 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-stone-600 text-sm font-medium mb-6">
            <Pencil className="w-4 h-4" />
            Handcrafted Pencil Sketches
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-900 leading-tight tracking-tight">
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
                  stroke="#78716c"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            With Love
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
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
      <section className="py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900">How It Works</h2>
            <p className="text-stone-500 mt-2">
              From photo to masterpiece in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl p-7 shadow-sm border border-stone-100 group hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-stone-900 text-white rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <div className="absolute top-7 right-7 text-4xl font-bold text-stone-100 group-hover:text-stone-200 transition-colors">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 bg-stone-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to turn your photo into art?
          </h2>
          <p className="text-stone-400 mb-8">
            Upload your image and get an instant price estimate. No commitment
            required.
          </p>
          <Link href="/commission">
            <Button
              size="lg"
              className="bg-white text-stone-900 hover:bg-stone-100 text-base px-10"
            >
              Try the Estimator Free
              <Sparkles className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900">
              What Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-stone-50 rounded-2xl p-6 border border-stone-100"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="text-stone-900 font-semibold text-sm">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
