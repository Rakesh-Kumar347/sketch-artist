"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/portfolio",  label: "Portfolio" },
  { href: "/commission", label: "Commission" },
  { href: "/about",      label: "About" },
  { href: "/contact",    label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(8,8,8,0.85)] backdrop-blur-md border-b border-[rgba(201,169,110,0.12)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-[#f0ece4] font-light tracking-[0.15em] uppercase text-sm hover:text-[#c9a96e] transition-colors duration-300"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem", fontStyle: "italic" }}
          >
            Art From Heart
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs tracking-[0.25em] uppercase transition-colors duration-300",
                  pathname === link.href
                    ? "text-[#c9a96e]"
                    : "text-[#7a7570] hover:text-[#f0ece4]"
                )}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/account"
                  className={cn(
                    "flex items-center gap-1.5 text-xs tracking-[0.25em] uppercase transition-colors duration-300",
                    pathname === "/account" ? "text-[#c9a96e]" : "text-[#7a7570] hover:text-[#f0ece4]"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  {profile?.name?.split(" ")[0] || "Account"}
                </Link>
                <button
                  onClick={async () => { await signOut(); router.push("/"); }}
                  className="text-[#7a7570] text-xs tracking-[0.25em] uppercase hover:text-[#f0ece4] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-xs tracking-[0.25em] uppercase text-[#7a7570] hover:text-[#f0ece4] transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/commission"
                  className="px-5 py-2 border border-[rgba(201,169,110,0.4)] text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase hover:bg-[#c9a96e] hover:text-[#080808] transition-all duration-300"
                >
                  Order Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[#7a7570] hover:text-[#f0ece4] transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[rgba(201,169,110,0.12)] bg-[#080808]">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block py-3 text-xs tracking-[0.3em] uppercase border-b border-[rgba(201,169,110,0.08)] transition-colors",
                  pathname === link.href
                    ? "text-[#c9a96e]"
                    : "text-[#7a7570] hover:text-[#f0ece4]"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/account" onClick={() => setOpen(false)} className="block py-3 text-xs tracking-[0.3em] uppercase border-b border-[rgba(201,169,110,0.08)] text-[#7a7570] hover:text-[#f0ece4] transition-colors">
                  My Account
                </Link>
                <button
                  onClick={async () => { setOpen(false); await signOut(); router.push("/"); }}
                  className="block w-full text-left py-3 text-xs tracking-[0.3em] uppercase text-[#7a7570] hover:text-[#f0ece4] transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block py-3 text-xs tracking-[0.3em] uppercase border-b border-[rgba(201,169,110,0.08)] text-[#7a7570] hover:text-[#f0ece4] transition-colors">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="block py-3 text-xs tracking-[0.3em] uppercase text-[#c9a96e]">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
