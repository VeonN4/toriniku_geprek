"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        setError(signInError.message || "Email atau password salah");
      } else {
        router.push("/beranda");
        router.refresh();
      }
    } catch (err: any) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: branding (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-orange-400 rounded-full opacity-50" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 bg-orange-600 rounded-full opacity-30" />
        <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-orange-300 rounded-full opacity-40" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5"
              />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">
              Toriniku Geprek
            </p>
            <p className="text-orange-100 text-sm">POS System</p>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Kelola warungmu
            <br />
            dengan mudah 🍗
          </h2>
          <p className="text-orange-100 text-base leading-relaxed max-w-sm">
            Pantau pesanan, kelola menu, dan lacak keuntungan harianmu semua
            dalam satu tempat.
          </p>
          <div className="flex flex-wrap gap-2 mt-8">
            {[
              "📦 Manajemen Pesanan",
              "🍽️ Kelola Menu",
              "📊 Laporan Laba",
              "⚡ Real-time",
            ].map((f) => (
              <span
                key={f}
                className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-orange-200 text-xs">
            © 2026 Toriniku Geprek · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg leading-tight">
              Toriniku Geprek
            </p>
            <p className="text-gray-400 text-sm">POS System</p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Selamat datang! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="input-email"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    />
                    <polyline
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="22,6 12,13 2,6"
                    />
                  </svg>
                </div>
                <input
                  id="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="contoh@email.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="input-password"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 11V7a5 5 0 0 1 10 0v4"
                    />
                  </svg>
                </div>
                <input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-gray-50/50"
                />
                <button
                  id="btn-toggle-password"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                      />
                      <line
                        x1="1"
                        y1="1"
                        x2="23"
                        y2="23"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-3 py-2.5 rounded-xl mb-5">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                  <line
                    x1="12"
                    y1="16"
                    x2="12.01"
                    y2="16"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-login"
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={4}
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
