"use client";

import { useState } from "react";
import { Mail, Instagram, Clock, Send, CheckCircle2 } from "lucide-react";

const contactInfo = [
  { icon: <Mail className="w-4 h-4" />, label: "Email", value: "ksunil7077@gmail.com", href: "mailto:ksunil7077@gmail.com" },
  { icon: <Instagram className="w-4 h-4" />, label: "Instagram", value: "@artfromheart", href: "https://instagram.com" },
  { icon: <Clock className="w-4 h-4" />, label: "Response Time", value: "Within 24 hours", href: null },
];

const inputCls =
  "w-full px-4 py-3 bg-[#1a1917] border border-[rgba(201,169,110,0.18)] text-[#f0ece4] text-sm placeholder:text-[#7a7570]/50 focus:outline-none focus:border-[#c9a96e] transition-colors duration-300";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#080808] min-h-screen pt-16">
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4">Contact</p>
        <h1
          className="text-5xl md:text-7xl font-thin text-[#f0ece4] leading-tight mb-16"
          style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
        >
          Get in Touch
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact info */}
          <div>
            <div className="space-y-4 mb-10">
              {contactInfo.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 bg-[#1a1917] border border-[rgba(201,169,110,0.12)] p-4"
                >
                  <div className="w-9 h-9 border border-[rgba(201,169,110,0.2)] flex items-center justify-center text-[#c9a96e] shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-[#7a7570] text-[10px] tracking-[0.3em] uppercase mb-0.5">{c.label}</p>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-[#f0ece4] text-sm hover:text-[#c9a96e] transition-colors duration-300"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-[#f0ece4] text-sm">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1917] border border-[rgba(201,169,110,0.12)] p-6">
              <p className="text-[#c9a96e] text-[10px] tracking-[0.4em] uppercase mb-3">Commission Inquiries</p>
              <p className="text-[#7a7570] text-sm leading-relaxed">
                For portrait commissions, use the dedicated{" "}
                <a href="/commission" className="text-[#c9a96e] hover:text-[#f0ece4] transition-colors underline underline-offset-4">
                  Commission page
                </a>{" "}
                — upload your reference photo and get an instant AI-powered price estimate.
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 border border-[rgba(201,169,110,0.3)] flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-6 h-6 text-[#c9a96e]" />
                </div>
                <h3
                  className="text-2xl font-thin text-[#f0ece4] mb-3"
                  style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
                >
                  Message Sent
                </h3>
                <p className="text-[#7a7570] text-sm mb-8">
                  Thank you for reaching out. I&apos;ll respond within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
                  className="text-xs text-[#7a7570] tracking-[0.3em] uppercase hover:text-[#c9a96e] transition-colors border-b border-[rgba(201,169,110,0.3)] pb-0.5"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] text-[#7a7570] tracking-[0.4em] uppercase mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#7a7570] tracking-[0.4em] uppercase mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#7a7570] tracking-[0.4em] uppercase mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell me about your inquiry..."
                    rows={6}
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#c9a96e] text-[#080808] text-xs tracking-[0.3em] uppercase font-medium hover:bg-[#d4a5a5] transition-colors duration-300"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
