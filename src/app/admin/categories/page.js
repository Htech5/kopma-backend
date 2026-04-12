"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories", {
        cache: "no-store",
      });
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data kategori");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmDelete = confirm("Yakin ingin menghapus kategori ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus kategori");
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="inline-block px-3 sm:px-4 py-1 rounded-full bg-green-100 text-green-700 text-xs sm:text-sm mb-3">
              Manajemen Kategori
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-700">
              Categories
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Kelola kategori untuk acara dan konten.
            </p>
          </div>

          <Link
            href="/admin/categories/create"
            className="w-full sm:w-auto text-center bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl"
          >
            + Tambah Category
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-4 sm:p-6">
        {loading ? (
          <p className="text-gray-500 text-sm sm:text-base">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            Belum ada kategori.
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-0">
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="text-left border-b border-green-100">
                    <th className="py-3 px-3 text-sm font-semibold">No</th>
                    <th className="py-3 px-3 text-sm font-semibold">Nama</th>
                    <th className="py-3 px-3 text-sm font-semibold">Slug</th>
                    <th className="py-3 px-3 text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((item, index) => (
                    <tr key={item.id} className="border-b border-green-50 align-top">
                      <td className="py-3 px-3 text-sm">{index + 1}</td>
                      <td className="py-3 px-3 text-sm font-medium">{item.name}</td>
                      <td className="py-3 px-3 text-sm break-all text-gray-600">
                        {item.slug}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/categories/edit/${item.id}`}
                            className="text-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid sm:hidden gap-3">
              {categories.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-green-100 p-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">No. {index + 1}</p>
                    <h3 className="text-base font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 break-all">{item.slug}</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href={`/admin/categories/edit/${item.id}`}
                      className="text-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
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