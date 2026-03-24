import Link from "next/link";
import { Mail, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[rgba(201,169,110,0.1)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <p
              className="text-[#f0ece4] font-light text-2xl mb-3"
              style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
            >
              Art From Heart
            </p>
            <p className="text-[#7a7570] text-sm leading-relaxed">
              Portraits that transcend photography.<br />
              Capturing souls in graphite and light.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase mb-5">Navigate</p>
            <nav className="space-y-3">
              {[
                ["Portfolio",          "/portfolio"],
                ["Commission a Sketch", "/commission"],
                ["About the Artist",   "/about"],
                ["Contact",            "/contact"],
              ].map(([label, href]) => (
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

          {/* Contact */}
          <div>
            <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase mb-5">Get in Touch</p>
            <div className="space-y-3">
              <a
                href="mailto:ksunil7077@gmail.com"
                className="flex items-center gap-3 text-[#7a7570] text-sm hover:text-[#c9a96e] transition-colors duration-300"
              >
                <Mail className="w-4 h-4 shrink-0" />
                ksunil7077@gmail.com
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#7a7570] text-sm hover:text-[#c9a96e] transition-colors duration-300"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                @artfromheart
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(201,169,110,0.08)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#7a7570] text-xs tracking-wider">
            © {new Date().getFullYear()} Art From Heart. All rights reserved.
          </p>
          <p
            className="text-[#c9a96e] text-sm font-light"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            Made with care, stroke by stroke.
          </p>
        </div>
      </div>
    </footer>
  );
}
