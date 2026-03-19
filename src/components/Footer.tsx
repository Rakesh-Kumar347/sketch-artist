import Link from "next/link";
import { Pencil, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-subtle)] border-t border-[var(--border)] mt-auto transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-base text-[var(--text)] mb-3">
              <Pencil className="w-4 h-4" />
              <span>ArtFromHeart</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Handcrafted pencil sketches that capture the essence of your
              moments. Every stroke tells a story.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[var(--text)] font-semibold mb-3 text-sm">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                ["Portfolio", "/portfolio"],
                ["Commission a Sketch", "/commission"],
                ["About the Artist", "/about"],
                ["Contact", "/contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[var(--text)] font-semibold mb-3 text-sm">
              Get in Touch
            </h4>
            <div className="space-y-2 text-sm text-[var(--text-muted)]">
              <a
                href="mailto:artist@gmail.com"
                className="flex items-center gap-2 hover:text-[var(--text)] transition-colors"
              >
                <Mail className="w-4 h-4" />
                artist@gmail.com
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[var(--text)] transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @artfromheart
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-6 text-xs text-[var(--text-muted)] text-center">
          © {new Date().getFullYear()} ArtFromHeart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
