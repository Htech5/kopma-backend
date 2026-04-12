"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${id}`);
        const data = await res.json();

        if (res.ok) {
          setName(data.name);
        } else {
          alert(data.message);
          router.push("/admin/categories");
        }
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data kategori");
      } finally {
        setFetching(false);
      }
    }

    if (id) fetchCategory();
  }, [id, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
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
      alert("Gagal update kategori");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <p className="text-gray-500 text-sm sm:text-base">Loading...</p>;
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6">
          Edit Category
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
              {loading ? "Menyimpan..." : "Update"}
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