import Link from "next/link";
import { Pencil, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Pencil className="w-5 h-5" />
              <span>ArtFromHeart</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Handcrafted pencil sketches that capture the essence of your
              moments. Every stroke tells a story.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
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
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Get in Touch</h4>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:artist@gmail.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                artist@gmail.com
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @artfromheart
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-8 text-sm text-stone-500 text-center">
          © {new Date().getFullYear()} ArtFromHeart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
