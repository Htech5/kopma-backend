"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditMagazinePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [currentPdfFile, setCurrentPdfFile] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMagazine = async () => {
      try {
        setFetching(true);
        setNotFound(false);

        const res = await fetch(`/api/magazines/${id}`);
        const data = await res.json();

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          alert(data.message || "Gagal mengambil data magazine");
          return;
        }

        setTitle(data.title || "");
        setYear(String(data.year || ""));
        setCurrentPdfFile(data.pdf_file || "");
      } catch (error) {
        console.error("Gagal mengambil detail magazine:", error);
        alert("Terjadi kesalahan saat mengambil data");
      } finally {
        setFetching(false);
      }
    };

    fetchMagazine();
  }, [id]);

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

  const activePreview = previewUrl || currentPdfFile;

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

    if (!title.trim() || !year) {
      alert("Judul dan tahun wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("year", year);

    if (file) {
      formData.append("file", file);
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/magazines/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengupdate magazine");
        return;
      }

      alert(data.message || "Magazine berhasil diupdate");
      router.push("/admin/magazines");
    } catch (error) {
      console.error("Gagal update magazine:", error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 md:p-7">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700">
          Edit Magazine
        </h2>
        <p className="mt-2 text-sm md:text-base text-gray-500">
          Memuat data magazine...
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-red-600">
          Data tidak ditemukan
        </h2>
        <p className="mt-2 text-gray-600">
          Magazine dengan ID ini belum ada atau sudah dihapus.
        </p>

        <Link
          href="/admin/magazines"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800"
        >
          Kembali ke Magazine
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Magazine
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-green-700">
              Edit Magazine
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Ubah data magazine dan ganti file PDF jika diperlukan.
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs md:text-sm text-gray-500">File PDF saat ini</p>
              {currentPdfFile ? (
                <a
                  href={currentPdfFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block break-all text-sm md:text-base font-medium text-blue-600 hover:underline"
                >
                  Lihat PDF sekarang
                </a>
              ) : (
                <p className="mt-2 text-sm text-gray-600">Belum ada file PDF</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Ganti File PDF
              </label>

              <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-300 bg-green-50 px-5 py-6 text-center transition hover:bg-green-100">
                <span className="mb-3 text-4xl">📄</span>
                <span className="text-base md:text-lg font-semibold text-green-700">
                  Klik untuk pilih file PDF baru
                </span>
                <span className="mt-1 text-sm text-gray-600">
                  Kosongkan jika tidak ingin mengganti file
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
                  <p className="text-xs md:text-sm text-gray-500">File baru terpilih</p>
                  <p className="mt-1 break-all font-semibold text-gray-800 text-sm md:text-base">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs md:text-sm text-gray-500">{fileSize}</p>
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
                {loading ? "Menyimpan..." : "Update Magazine"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 md:p-7">
          <h3 className="text-xl md:text-2xl font-bold text-green-700">
            Preview PDF
          </h3>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            Kalau pilih file baru, preview akan berubah ke file baru. Kalau belum,
            yang tampil adalah file PDF saat ini.
          </p>

          {!activePreview ? (
            <div className="mt-5 flex min-h-[320px] md:min-h-[500px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 text-center">
              <div>
                <div className="mb-3 text-5xl">👀</div>
                <p className="text-lg font-semibold text-gray-700">Belum ada preview</p>
                <p className="mt-1 text-sm text-gray-500">
                  File PDF saat ini atau file baru akan tampil di sini.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <iframe
                src={activePreview}
                title="Preview PDF"
                className="h-[380px] md:h-[650px] w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}