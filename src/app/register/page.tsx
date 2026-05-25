"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-white border border-[#e0e0e8] rounded-2xl p-8 shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#f69323] to-[#e07a10] rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">R</div>
          <h1 className="text-xl font-extrabold">Create Account</h1>
          <p className="text-sm text-[#6b6b80] mt-1">Join RepairDesk</p>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-br from-[#f69323] to-[#e07a10] text-white font-semibold py-3 rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-[#6b6b80] mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-[#f69323] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
