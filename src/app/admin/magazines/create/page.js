"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMagazinePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fileSize = useMemo(() => {
    if (!file) return "";
    const sizeMb = file.size / (1024 * 1024);
    return `${sizeMb.toFixed(2)} MB`;
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("File harus berupa PDF");
      return;
    }

    const maxSizeMb = 50;
    const sizeMb = selectedFile.size / (1024 * 1024);

    if (sizeMb > maxSizeMb) {
      alert(`Ukuran file maksimal ${maxSizeMb} MB`);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !year || !file) {
      alert("Semua field wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("year", year);
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch("/api/magazines", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menambahkan magazine");
        return;
      }

      alert(data.message || "Magazine berhasil ditambahkan");
      router.push("/admin/magazines");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Magazine
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-green-700">
              Tambah Magazine
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Upload file PDF magazine dan kelompokkan berdasarkan tahun.
            </p>
          </div>

          <Link
            href="/admin/magazines"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Kembali
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 md:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Judul Magazine
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Magazine Kopma"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm md:text-base text-gray-800 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tahun
              </label>
             <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Contoh: 2025"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm md:text-base text-gray-800 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Upload File PDF
              </label>

              <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-300 bg-green-50 px-5 py-6 text-center transition hover:bg-green-100">
                <span className="mb-3 text-4xl">📄</span>
                <span className="text-base md:text-lg font-semibold text-green-700">
                  Klik untuk pilih file PDF
                </span>
                <span className="mt-1 text-sm text-gray-500">
                  Format: PDF, maksimal 50 MB
                </span>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs md:text-sm text-gray-500">
                    File terpilih
                  </p>
                  <p className="mt-1 break-all font-semibold text-gray-800 text-sm md:text-base">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs md:text-sm text-gray-500">
                    {fileSize}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/admin/magazines"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:bg-green-400"
              >
                {loading ? "Menyimpan..." : "Simpan Magazine"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 md:p-7">
          <h3 className="text-xl md:text-2xl font-bold text-green-700">
            Preview PDF
          </h3>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            Preview file akan muncul setelah PDF dipilih.
          </p>

          {!previewUrl ? (
            <div className="mt-5 flex min-h-[320px] md:min-h-[500px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 text-center">
              <div>
                <div className="mb-3 text-5xl">👀</div>
                <p className="text-lg font-semibold text-gray-700">
                  Belum ada preview
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Upload file PDF untuk melihat gambaran isi file.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <iframe
                src={previewUrl}
                title="Preview PDF"
                className="h-[380px] md:h-[600px] w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}