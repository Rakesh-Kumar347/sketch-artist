"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, LogIn, KeyRound, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    const err = await resetPassword(resetEmail);
    if (err) {
      setResetError(err);
    } else {
      setResetSent(true);
    }
    setResetLoading(false);
  };

  const inputCls = "w-full bg-[#0f0f0f] border border-[rgba(201,169,110,0.2)] text-[#f0ece4] placeholder:text-[#7a7570] px-4 py-3 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors";

  return (
    <div className="bg-[#080808] min-h-screen pt-16 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {!showReset ? (
          <>
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

            <div className="mt-5 text-center">
              <button
                onClick={() => { setShowReset(true); setResetEmail(email); setResetError(null); setResetSent(false); }}
                className="inline-flex items-center gap-1.5 text-[#7a7570] text-xs tracking-[0.2em] uppercase hover:text-[#c9a96e] transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />Forgot Password?
              </button>
            </div>

            <p className="text-center text-[#7a7570] text-sm mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#c9a96e] hover:underline">
                Create one
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-3">Account Recovery</p>
              <h1
                className="text-4xl font-thin text-[#f0ece4]"
                style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
              >
                Reset Password
              </h1>
              <p className="text-[#7a7570] text-sm mt-3 font-light">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            {resetSent ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3 text-green-400 bg-green-400/10 border border-green-400/20 px-5 py-6 text-center">
                  <CheckCircle2 className="w-6 h-6" />
                  <p className="text-sm font-light text-[#f0ece4]">Password reset email sent!</p>
                  <p className="text-xs text-[#7a7570]">Check your inbox and follow the link to set a new password.</p>
                </div>
                <button
                  onClick={() => setShowReset(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[rgba(201,169,110,0.2)] text-[#7a7570] text-xs tracking-[0.25em] uppercase hover:text-[#f0ece4] hover:border-[rgba(201,169,110,0.4)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7570]" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Email address"
                    className={`${inputCls} pl-11`}
                  />
                </div>

                {resetError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />{resetError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#c9a96e] text-[#080808] text-xs tracking-[0.25em] uppercase font-medium hover:bg-[#d4b87a] transition-colors disabled:opacity-60"
                >
                  {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[rgba(201,169,110,0.2)] text-[#7a7570] text-xs tracking-[0.25em] uppercase hover:text-[#f0ece4] hover:border-[rgba(201,169,110,0.4)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />Back to Sign In
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
