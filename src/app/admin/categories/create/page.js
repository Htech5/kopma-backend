"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        router.push("/admin/categories");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan kategori");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6">
          Tambah Category
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Nama Category
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama category"
              className="w-full rounded-xl border border-green-200 px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-5 py-3 rounded-xl font-semibold"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-xl font-semibold"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}