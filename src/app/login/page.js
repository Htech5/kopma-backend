"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Hujan uang di <canvas>: reactbits-style "falling particles" tapi bertema
// rupiah — kartu koin emas + lembar uang hijau, rotate + sway ringan.
// Satu rAF loop, DPI-aware, berhenti kalau prefers-reduced-motion atau tab
// disembunyikan. Tidak butuh GSAP: gerakan sesederhana ini murah lewat
// requestAnimationFrame biasa.
function MoneyRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 26;
    const items = Array.from({ length: COUNT }, () => spawn(true));

    function spawn(initial) {
      const isCoin = Math.random() > 0.45;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -40,
        size: isCoin ? 14 + Math.random() * 14 : 22 + Math.random() * 16,
        speed: 18 + Math.random() * 22,
        drift: (Math.random() - 0.5) * 18,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.8,
        sway: Math.random() * Math.PI * 2,
        isCoin,
        opacity: 0.35 + Math.random() * 0.35,
      };
    }

    function drawCoin(p) {
      const g = ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
      g.addColorStop(0, "#fde68a");
      g.addColorStop(1, "#d97706");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(120,53,15,0.75)";
      ctx.font = `bold ${p.size * 0.42}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Rp", 0, 1);
    }

    function drawNote(p) {
      const wid = p.size;
      const hei = p.size * 0.55;
      const g = ctx.createLinearGradient(-wid / 2, 0, wid / 2, 0);
      g.addColorStop(0, "#6ee7b7");
      g.addColorStop(1, "#16a34a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(-wid / 2, -hei / 2, wid, hei, 3);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-wid / 2 + 3, -hei / 2 + 3, wid - 6, hei - 6);
      ctx.beginPath();
      ctx.arc(0, 0, hei * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fill();
    }

    let raf;
    let last = performance.now();

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (const p of items) {
        p.y += p.speed * dt;
        p.sway += dt * 1.2;
        p.x += (Math.sin(p.sway) * 6 + p.drift) * dt;
        p.angle += p.spin * dt;

        if (p.y - p.size > h) Object.assign(p, spawn(false));

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        if (p.isCoin) drawCoin(p);
        else drawNote(p);
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    }

    if (!reduceMotion) raf = requestAnimationFrame(frame);

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-[#f0faf4] to-emerald-100/60" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const turnstileRef = useRef(null);
  const widgetId = useRef(null);
  const [captchaToken, setCaptchaToken] = useState("");

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

  // Render eksplisit: auto-render Turnstile kadang gagal karena kepentok
  // hydration React (elemen belum ada saat script scan DOM sekali di awal).
  useEffect(() => {
    if (!SITE_KEY) return;

    let cancelled = false;

    function render() {
      if (cancelled || !window.turnstile || !turnstileRef.current) return;
      if (widgetId.current) return;
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: SITE_KEY,
        theme: "light",
        callback: (token) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => setCaptchaToken(""),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const id = setInterval(() => {
        if (window.turnstile) {
          clearInterval(id);
          render();
        }
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (SITE_KEY && !captchaToken) {
      setError("Tunggu verifikasi keamanan selesai, lalu coba lagi.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetchWithRetry("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, remember, turnstileToken: captchaToken }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data?.message || data?.error || `Login gagal (${res.status})`);
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
        setCaptchaToken("");
        return;
      }

      if (remember) localStorage.setItem("admin_last_email", email);
      else localStorage.removeItem("admin_last_email");

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Tidak bisa menghubungi server. Coba lagi.");
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      setCaptchaToken("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <MoneyRain />

      {SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
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

            {SITE_KEY && <div ref={turnstileRef} />}

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
