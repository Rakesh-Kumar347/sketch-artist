"use client";

import { useState } from "react";
import { Mail, Instagram, Clock, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactInfo = [
  { icon: <Mail className="w-5 h-5" />, label: "Email", value: "artist@gmail.com", href: "mailto:artist@gmail.com" },
  { icon: <Instagram className="w-5 h-5" />, label: "Instagram", value: "@artfromheart", href: "https://instagram.com" },
  { icon: <Clock className="w-5 h-5" />, label: "Response Time", value: "Within 24 hours", href: null },
];

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--text)]">Get in Touch</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-lg mx-auto">
          Have a question or want to discuss a custom commission? I&apos;d love
          to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact info */}
        <div>
          <h2 className="text-base font-semibold text-[var(--text)] mb-5">
            Contact Information
          </h2>
          <div className="space-y-3">
            {contactInfo.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4"
              >
                <div className="w-9 h-9 bg-[var(--bg-subtle)] rounded-lg flex items-center justify-center text-[var(--text-muted)] shrink-0">
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{c.label}</p>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="font-medium text-[var(--text)] hover:underline text-sm"
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p className="font-medium text-[var(--text)] text-sm">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-[var(--bg-subtle)] rounded-2xl p-5 border border-[var(--border)]">
            <h3 className="font-semibold text-[var(--text)] mb-1.5 text-sm">
              Commission Inquiries
            </h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              For commission requests, use the dedicated{" "}
              <a href="/commission" className="text-[var(--text)] underline font-medium">
                Commission page
              </a>{" "}
              — upload your reference image and get an instant price estimate.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div>
          {submitted ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">Message Sent!</h3>
              <p className="text-[var(--text-muted)] text-sm">
                Thank you for reaching out. I&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
                className="mt-6 text-sm text-[var(--text-muted)] underline hover:text-[var(--text)]"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Your Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Email Address</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Message</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell me about your inquiry..."
                  rows={6}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
