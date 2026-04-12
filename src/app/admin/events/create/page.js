"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [layout, setLayout] = useState("none");

  const [mainImage, setMainImage] = useState("");
  const [topImage, setTopImage] = useState("");
  const [middleImage, setMiddleImage] = useState("");

  const [contentTop, setContentTop] = useState("");
  const [contentBottom, setContentBottom] = useState("");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingTop, setUploadingTop] = useState(false);
  const [uploadingMiddle, setUploadingMiddle] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil kategori");
      }
    }

    fetchCategories();
  }, []);

  const selectedCategoryName = useMemo(() => {
    const found = categories.find((item) => String(item.id) === String(categoryId));
    return found?.name || "Belum pilih kategori";
  }, [categories, categoryId]);

  async function uploadImage(file, type) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Upload gagal");
    }

    if (type === "thumbnail") {
      setMainImage(data.filePath);
    } else if (type === "top") {
      setTopImage(data.filePath);
    } else if (type === "middle") {
      setMiddleImage(data.filePath);
    }
  }

  async function handleThumbnailUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingThumb(true);
      await uploadImage(file, "thumbnail");
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal upload thumbnail");
    } finally {
      setUploadingThumb(false);
    }
  }

  async function handleTopUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTop(true);
      await uploadImage(file, "top");
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal upload gambar atas");
    } finally {
      setUploadingTop(false);
    }
  }

  async function handleMiddleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMiddle(true);
      await uploadImage(file, "middle");
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal upload gambar tengah");
    } finally {
      setUploadingMiddle(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        category_id: categoryId,
        main_image: mainImage,
        top_image: layout === "top" || layout === "top-middle" ? topImage : null,
        middle_image:
          layout === "middle" || layout === "top-middle" ? middleImage : null,
        content_top: contentTop,
        content_bottom:
          layout === "middle" || layout === "top-middle"
            ? contentBottom
            : null,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
    console.log("CREATE EVENT RESPONSE:", data);
    alert(data.detail || data.error || data.message);

      if (res.ok) {
        router.push("/admin/events");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Tambah Event</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Judul Event
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan judul event"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Pilih kategori</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="w-full rounded-xl border border-green-200 px-4 py-3"
            />
            {uploadingThumb && (
              <p className="text-sm text-gray-500 mt-2">Uploading thumbnail...</p>
            )}
            {mainImage && (
              <img
                src={mainImage}
                alt="Thumbnail"
                className="mt-3 w-40 h-28 object-cover rounded-xl border"
              />
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Layout Gambar Berita
            </label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="none">Tanpa gambar isi</option>
              <option value="top">Gambar di atas berita</option>
              <option value="middle">Gambar di tengah berita</option>
              <option value="top-middle">Gambar di atas + tengah berita</option>
            </select>
          </div>

          {(layout === "top" || layout === "top-middle") && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Upload Gambar Atas Berita
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleTopUpload}
                className="w-full rounded-xl border border-green-200 px-4 py-3"
              />
              {uploadingTop && (
                <p className="text-sm text-gray-500 mt-2">Uploading gambar atas...</p>
              )}
              {topImage && (
                <img
                  src={topImage}
                  alt="Gambar Atas"
                  className="mt-3 w-40 h-28 object-cover rounded-xl border"
                />
              )}
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Isi Berita Bagian Atas
            </label>
            <textarea
              value={contentTop}
              onChange={(e) => setContentTop(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tulis isi berita bagian awal"
              required
            />
          </div>

          {(layout === "middle" || layout === "top-middle") && (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload Gambar Tengah Berita
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMiddleUpload}
                  className="w-full rounded-xl border border-green-200 px-4 py-3"
                />
                {uploadingMiddle && (
                  <p className="text-sm text-gray-500 mt-2">
                    Uploading gambar tengah...
                  </p>
                )}
                {middleImage && (
                  <img
                    src={middleImage}
                    alt="Gambar Tengah"
                    className="mt-3 w-40 h-28 object-cover rounded-xl border"
                  />
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Isi Berita Bagian Bawah
                </label>
                <textarea
                  value={contentBottom}
                  onChange={(e) => setContentBottom(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tulis isi berita bagian lanjutan"
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-5 py-3 rounded-xl font-semibold"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/events")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-xl font-semibold"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Preview Berita</h2>

        <div className="border border-green-100 rounded-2xl overflow-hidden bg-white">
          {mainImage ? (
            <img
              src={mainImage}
              alt="Thumbnail Preview"
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
              Preview thumbnail
            </div>
          )}

          <div className="p-6">
            <p className="text-sm text-green-700 font-medium mb-2">
              {selectedCategoryName}
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {title || "Judul event akan tampil di sini"}
            </h1>

            {(layout === "top" || layout === "top-middle") && topImage && (
              <img
                src={topImage}
                alt="Gambar atas"
                className="w-full rounded-xl mb-4"
              />
            )}

            {contentTop && (
              <div className="whitespace-pre-line text-gray-700 leading-8 mb-4">
                {contentTop}
              </div>
            )}

            {(layout === "middle" || layout === "top-middle") && middleImage && (
              <img
                src={middleImage}
                alt="Gambar tengah"
                className="w-full rounded-xl mb-4"
              />
            )}

            {contentBottom && (
              <div className="whitespace-pre-line text-gray-700 leading-8">
                {contentBottom}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}