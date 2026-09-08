"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Koin melayang: posisi/durasi tetap biar server & client render sama.
const COINS = [
  { left: 6, size: 34, delay: 0, dur: 17 },
  { left: 18, size: 22, delay: 4, dur: 21 },
  { left: 31, size: 44, delay: 8, dur: 15 },
  { left: 47, size: 26, delay: 2, dur: 23 },
  { left: 62, size: 38, delay: 11, dur: 18 },
  { left: 76, size: 24, delay: 6, dur: 20 },
  { left: 89, size: 40, delay: 13, dur: 16 },
];

function MoneyBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-[#f0faf4] to-emerald-100/60" />

      {COINS.map((c, i) => (
        <span
          key={i}
          className="coin absolute bottom-[-60px] grid place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-bold text-amber-900 shadow-lg shadow-amber-500/20"
          style={{
            left: `${c.left}%`,
            width: c.size,
            height: c.size,
            fontSize: c.size * 0.4,
            animation: `coin-float ${c.dur}s linear ${c.delay}s infinite`,
          }}
        >
          Rp
        </span>
      ))}

      {/* Dua gelombang, kecepatan beda biar ada parallax. */}
      <svg
        className="wave absolute bottom-0 left-0 h-40 w-[200%] text-emerald-500/20"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        style={{ animation: "wave-drift 18s linear infinite" }}
      >
        <path
          fill="currentColor"
          d="M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 V160 H0Z"
        />
      </svg>
      <svg
        className="wave absolute bottom-0 left-0 h-32 w-[200%] text-emerald-600/25"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        style={{ animation: "wave-drift 26s linear infinite" }}
      >
        <path
          fill="currentColor"
          d="M0 100 Q180 150 360 100 T720 100 T1080 100 T1440 100 V160 H0Z"
        />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const turnstileRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email terakhir (bukan password) diingat lokal untuk isi otomatis.
  useEffect(() => {
    const saved = localStorage.getItem("admin_last_email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const turnstileToken =
      turnstileRef.current?.querySelector('[name="cf-turnstile-response"]')
        ?.value || "";

    if (SITE_KEY && !turnstileToken) {
      setError("Tunggu verifikasi keamanan selesai, lalu coba lagi.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetchWithRetry("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, remember, turnstileToken }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data?.message || data?.error || `Login gagal (${res.status})`);
        window.turnstile?.reset();
        return;
      }

      if (remember) localStorage.setItem("admin_last_email", email);
      else localStorage.removeItem("admin_last_email");

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Tidak bisa menghubungi server. Coba lagi.");
      window.turnstile?.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <MoneyBackground />

      {SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-green-100 bg-white/90 p-8 shadow-xl shadow-emerald-900/5 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-green-100 pb-5">
            <Image
              src="/logokopma1.png"
              alt="Logo KOPMA UNNES"
              width={40}
              height={40}
              className="rounded-lg"
              priority
            />
            <div className="leading-tight">
              <p className="font-semibold text-gray-800">Admin KOPMA UNNES</p>
              <p className="text-xs text-gray-500">Masuk untuk melanjutkan</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-400 transition hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-green-700"
              />
              Ingat saya selama 30 hari
            </label>

            {SITE_KEY && (
              <div
                ref={turnstileRef}
                className="cf-turnstile"
                data-sitekey={SITE_KEY}
                data-theme="light"
                data-size="flexible"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:bg-green-400"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Memverifikasi..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Akses terbatas untuk pengurus KOPMA UNNES.
        </p>
      </div>
    </div>
  );
}
