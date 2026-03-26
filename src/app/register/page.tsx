"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, UserPlus, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    const err = await signUp(form.name, form.email, form.phone, form.password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/account"), 2000);
    }
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const inputCls = "w-full bg-[#0f0f0f] border border-[rgba(201,169,110,0.2)] text-[#f0ece4] placeholder:text-[#7a7570] px-4 py-3 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors";

  if (success) {
    return (
      <div className="bg-[#080808] min-h-screen pt-16 flex items-center justify-center px-6">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-[#c9a96e] mx-auto mb-4" />
          <h2 className="text-2xl font-thin text-[#f0ece4] mb-2" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
            Account Created!
          </h2>
          <p className="text-[#7a7570] text-sm">Redirecting to your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#080808] min-h-screen pt-16 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-3">Join Us</p>
          <h1
            className="text-4xl font-thin text-[#f0ece4]"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            Create Account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required value={form.name} onChange={set("name")} placeholder="Full name" className={inputCls} />
          <input type="email" required value={form.email} onChange={set("email")} placeholder="Email address" className={inputCls} />
          <input type="tel" value={form.phone} onChange={set("phone")} placeholder="Phone number (optional)" className={inputCls} />
          <input type="password" required value={form.password} onChange={set("password")} placeholder="Password (min 6 characters)" className={inputCls} />
          <input type="password" required value={form.confirm} onChange={set("confirm")} placeholder="Confirm password" className={inputCls} />

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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[#7a7570] text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-[#c9a96e] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
