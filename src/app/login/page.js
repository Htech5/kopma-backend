"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, config = {}) {
  const {
    retries = 3,
    initialDelay = 800,
    factor = 2,
    maxDelay = 4000,
    retryOnStatuses = [429, 502, 503, 504],
  } = config;

  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      const shouldRetry =
        retryOnStatuses.includes(response.status) && attempt < retries;

      if (!shouldRetry) {
        return response;
      }
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
    }

    await wait(delay);
    delay = Math.min(delay * factor, maxDelay);
    attempt += 1;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithRetry(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
        {
          retries: 3,
          initialDelay: 800,
          factor: 2,
          maxDelay: 4000,
          retryOnStatuses: [429, 502, 503, 504],
        }
      );

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        alert(data?.message || data?.error || `Login gagal (${res.status})`);
        return;
      }

      alert(data?.message || "Login berhasil");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Terjadi error saat login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-white to-green-300 flex items-center justify-center px-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/70 shadow-xl rounded-3xl p-8 border border-white/30">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
            <Image
              src="/logokopma1.png"
              alt="Logo Kopma"
              width={64}
              height={64}
              className="object-contain p-2"
              priority
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Login Admin
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Panel Kopma Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 transition"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 transition"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 transition"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth={2}
                      d="M3 3l18 18M10.584 10.587a2 2 0 102.828 2.828"
                    />
                    <path
                      strokeWidth={2}
                      d="M9.88 5.091A9.77 9.77 0 0112 5c5 0 9 7 9 7a17.729 17.729 0 01-2.08 2.91M6.53 6.53C4.61 8.08 3 12 3 12s4 7 9 7a9.77 9.77 0 003.11-.49"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] disabled:bg-green-400 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-200"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
