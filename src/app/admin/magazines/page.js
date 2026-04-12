"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function MagazinesPage() {
  const [magazines, setMagazines] = useState([]);
  const [search, setSearch] = useState("");

  const fetchMagazines = async () => {
    try {
      const res = await fetch("/api/magazines");
      const data = await res.json();
      setMagazines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data magazine:", error);
    }
  };

  useEffect(() => {
    fetchMagazines();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = confirm("Yakin ingin menghapus magazine ini?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/magazines/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      alert(data.message || "Magazine berhasil dihapus");
      fetchMagazines();
    } catch (error) {
      console.error("Gagal menghapus magazine:", error);
      alert("Terjadi kesalahan saat menghapus data");
    }
  };

  const filteredMagazines = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return magazines;

    return magazines.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(keyword);
      const yearMatch = String(item.year).includes(keyword);
      return titleMatch || yearMatch;
    });
  }, [magazines, search]);

  const groupedMagazines = useMemo(() => {
    return filteredMagazines.reduce((acc, item) => {
      if (!acc[item.year]) acc[item.year] = [];
      acc[item.year].push(item);
      return acc;
    }, {});
  }, [filteredMagazines]);

  const totalData = magazines.length;
  const totalYear = [...new Set(magazines.map((item) => item.year))].length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Manajemen Magazine
            </span>

            <h2 className="mt-3 text-3xl font-bold text-green-700">
              Magazine
            </h2>

            <p className="mt-2 text-gray-600">
              Kelola file PDF magazine berdasarkan tahun.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Cari judul / tahun"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full sm:w-64 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

            <Link
              href="/admin/magazines/create"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              + Tambah Magazine
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm text-gray-500">Total Magazine</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{totalData}</p>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm text-gray-500">Total Tahun</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{totalYear}</p>
          </div>
        </div>
      </div>

      {filteredMagazines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl">
            📄
          </div>

          <h3 className="text-2xl font-semibold text-gray-800">
            {search ? "Data tidak ditemukan" : "Belum ada data magazine"}
          </h3>

          <p className="mt-2 text-gray-500">
            {search
              ? "Coba gunakan kata kunci lain."
              : "Tambahkan magazine pertama untuk mulai mengelola file PDF."}
          </p>

          {!search && (
            <Link
              href="/admin/magazines/create"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Tambah Sekarang
            </Link>
          )}
        </div>
      ) : (
        Object.keys(groupedMagazines)
          .sort((a, b) => Number(b) - Number(a))
          .map((year) => (
            <section key={year} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-green-600" />
                <h3 className="text-2xl font-bold text-green-700">{year}</h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {groupedMagazines[year].length} data
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {groupedMagazines[year].map((magazine) => (
                  <div
                    key={magazine.id}
                    className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl">
                        📕
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          PDF File
                        </span>

                        <h4 className="mt-2 text-lg font-semibold text-gray-800 break-words">
                          {magazine.title}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          Tahun {magazine.year}
                        </p>

                        <a
                          href={magazine.pdf_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline break-all"
                        >
                          {magazine.pdf_file}
                        </a>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <a
                        href={magazine.pdf_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Lihat PDF
                      </a>

                      <Link
                        href={`/admin/magazines/edit/${magazine.id}`}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-medium text-white hover:bg-amber-600"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(magazine.id)}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
      )}
    </div>
  );
}