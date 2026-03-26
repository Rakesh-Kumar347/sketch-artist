"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      const params = new URLSearchParams(window.location.search);
      router.push(params.get("redirect") || "/account");
    }
  };

  const inputCls = "w-full bg-[#0f0f0f] border border-[rgba(201,169,110,0.2)] text-[#f0ece4] placeholder:text-[#7a7570] px-4 py-3 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors";

  return (
    <div className="bg-[#080808] min-h-screen pt-16 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-3">Welcome Back</p>
          <h1
            className="text-4xl font-thin text-[#f0ece4]"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            Sign In
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={inputCls}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputCls}
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#c9a96e] text-[#080808] text-xs tracking-[0.25em] uppercase font-medium hover:bg-[#d4b87a] transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[#7a7570] text-sm mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#c9a96e] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
