"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetchWithRetry("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data?.message || data?.error || `Login gagal (${res.status})`);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Panel kiri: identitas produk, disembunyikan di mobile. */}
      <aside className="hidden lg:flex flex-col justify-between bg-slate-950 text-slate-300 p-12">
        <div className="flex items-center gap-3">
          <Image
            src="/logokopma1.png"
            alt=""
            width={36}
            height={36}
            className="rounded-lg bg-white p-1"
          />
          <span className="font-semibold text-white tracking-tight">
            KOPMA UNNES
          </span>
        </div>

        <div className="max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
            Admin Console
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white">
            Satu panel untuk magazine, event, inventaris, dan komentar.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Semua perubahan langsung tersinkron ke situs publik KOPMA UNNES.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Sesi</dt>
            <dd className="mt-1 font-medium text-white">24 jam</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Auth</dt>
            <dd className="mt-1 font-medium text-white">JWT httpOnly</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Akses</dt>
            <dd className="mt-1 font-medium text-white">Pengurus</dd>
          </div>
        </dl>
      </aside>

      {/* Panel kanan: form login. */}
      <main className="flex min-h-screen items-center justify-center bg-white px-5 py-12">
        <div className="w-full max-w-sm">
          <Image
            src="/logokopma1.png"
            alt="Logo KOPMA UNNES"
            width={48}
            height={48}
            className="mb-8 rounded-xl border border-slate-200 p-1 lg:hidden"
            priority
          />

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Masuk ke admin panel
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gunakan akun pengurus yang terdaftar.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
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
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@kopmaunnes.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>

          <p className="mt-8 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Koneksi terenkripsi. Jangan bagikan kredensial.
          </p>
        </div>
      </main>
    </div>
  );
}
