"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader, EmptyState, LoadingBlock, useAdminFeedback } from "../_components/AdminUI";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify, askConfirm, closeConfirm, feedbackUI } = useAdminFeedback();

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      notify("Gagal mengambil data kategori", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id) {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      notify(data.message || "Kategori dihapus", res.ok ? "success" : "error");
      if (res.ok) fetchCategories();
    } catch (error) {
      console.error(error);
      notify("Gagal menghapus kategori", "error");
    }
  }

  function handleDelete(id) {
    askConfirm({
      title: "Hapus kategori",
      message: "Yakin ingin menghapus kategori ini? Tindakan ini tidak bisa dibatalkan.",
      danger: true,
      onConfirm: () => {
        closeConfirm();
        deleteCategory(id);
      },
    });
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      {feedbackUI}

      <PageHeader
        eyebrow="Manajemen Kategori"
        title="Categories"
        description="Kelola kategori untuk acara dan konten."
        action={
          <Link
            href="/admin/categories/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Tambah Category
          </Link>
        }
      />

      <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
        {loading ? (
          <LoadingBlock />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Belum ada kategori"
            description="Tambahkan kategori pertama untuk mengelompokkan acara dan konten."
            action={
              <Link
                href="/admin/categories/create"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Tambah Sekarang
              </Link>
            }
          />
        ) : (
          <div className="space-y-3 sm:space-y-0">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-green-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3">No</th>
                    <th className="px-3 py-3">Nama</th>
                    <th className="px-3 py-3">Slug</th>
                    <th className="px-3 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-50">
                  {categories.map((item, index) => (
                    <tr key={item.id} className="align-top transition hover:bg-green-50/40">
                      <td className="px-3 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                      <td className="px-3 py-3 text-sm text-gray-500 break-all">{item.slug}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/categories/edit/${item.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 sm:hidden">
              {categories.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-green-100 p-4 shadow-sm">
                  <p className="text-xs text-gray-500">No. {index + 1}</p>
                  <h3 className="mt-1 text-base font-semibold text-gray-800">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 break-all">{item.slug}</p>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href={`/admin/categories/edit/${item.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
