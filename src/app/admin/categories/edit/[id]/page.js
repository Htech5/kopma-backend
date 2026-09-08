"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader, LoadingBlock, useAdminFeedback } from "../../../_components/AdminUI";

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { notify, feedbackUI } = useAdminFeedback();

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${id}`);
        const data = await res.json();

        if (res.ok) {
          setName(data.name);
        } else {
          notify(data.message || "Kategori tidak ditemukan", "error");
          router.push("/admin/categories");
        }
      } catch (error) {
        console.error(error);
        notify("Gagal mengambil data kategori", "error");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (res.ok) {
        notify(data.message || "Kategori diperbarui");
        router.push("/admin/categories");
        router.refresh();
      } else {
        notify(data.message || "Gagal update kategori", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Gagal update kategori", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {feedbackUI}

      <PageHeader
        eyebrow="Manajemen Kategori"
        title="Edit Category"
        action={
          <Link
            href="/admin/categories"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        }
      />

      <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        {fetching ? (
          <LoadingBlock rows={1} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nama Category
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama category"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 sm:text-base"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-70"
            >
              {loading ? "Menyimpan..." : "Update"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
