"use client";

import { useEffect, useMemo, useState } from "react";

const INITIAL_FORM = {
  nama: "",
  harga: "",
  stok: "",
  stok_tersedia: "",
  gambar: null,
};

function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export default function AdminInventarisPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [hapusGambarSaatEdit, setHapusGambarSaatEdit] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function fetchInventaris() {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch("/api/inventaris", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      }

      const list = Array.isArray(data) ? data : data.data ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("[AdminInventaris] fetch error:", error);
      setItems([]);
      setErrorMsg(error.message || "Gagal mengambil data inventaris");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventaris();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setHapusGambarSaatEdit(false);
    setErrorMsg("");
    setSuccessMsg("");

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;

    setForm((prev) => ({
      ...prev,
      gambar: file,
    }));

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setHapusGambarSaatEdit(false);
    } else {
      setPreviewUrl("");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setErrorMsg("");
    setSuccessMsg("");
    setHapusGambarSaatEdit(false);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setForm({
      nama: item.nama ?? "",
      harga: item.harga ?? "",
      stok: item.stok ?? "",
      stok_tersedia: item.stok_tersedia ?? "",
      gambar: null,
    });

    setPreviewUrl(item.gambar || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      if (!form.nama.trim()) {
        throw new Error("Nama inventaris wajib diisi");
      }

      const formData = new FormData();
      formData.append("nama", form.nama.trim());
      formData.append("harga", String(form.harga || 0));
      formData.append("stok", String(form.stok || 0));
      formData.append("stok_tersedia", String(form.stok_tersedia || 0));

      if (form.gambar) {
        formData.append("gambar", form.gambar);
      }

      if (editingId && hapusGambarSaatEdit) {
        formData.append("hapus_gambar", "true");
      }

      const url = editingId ? `/api/inventaris/${editingId}` : "/api/inventaris";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      }

      setSuccessMsg(
        data.message ||
          (editingId
            ? "Inventaris berhasil diperbarui"
            : "Inventaris berhasil ditambahkan")
      );

      resetForm();
      await fetchInventaris();
    } catch (error) {
      console.error("[AdminInventaris] submit error:", error);
      setErrorMsg(error.message || "Gagal menyimpan inventaris");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const ok = confirm("Yakin ingin menghapus inventaris ini?");
    if (!ok) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");

      const res = await fetch(`/api/inventaris/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      }

      setSuccessMsg(data.message || "Inventaris berhasil dihapus");

      if (editingId === id) {
        resetForm();
      }

      await fetchInventaris();
    } catch (error) {
      console.error("[AdminInventaris] delete error:", error);
      setErrorMsg(error.message || "Gagal menghapus inventaris");
    }
  }

  const filteredItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    const q = keyword.toLowerCase().trim();

    if (!q) return safeItems;

    return safeItems.filter((item) => {
      const text = `
        ${item.nama || ""}
        ${item.harga || ""}
        ${item.stok || ""}
        ${item.stok_tersedia || ""}
      `
        .toLowerCase()
        .trim();

      return text.includes(q);
    });
  }, [items, keyword]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm mb-3">
              Manajemen Inventaris
            </p>
            <h1 className="text-3xl font-bold text-green-700">Inventaris</h1>
            <p className="text-gray-600 mt-2">
              Kelola data inventaris, gambar, harga sewa, stok, dan stok tersedia.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {editingId ? "Edit Inventaris" : "Tambah Inventaris"}
        </h2>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Nama Inventaris
            </label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Contoh: Tenda Besar"
              className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Harga Sewa
            </label>
            <input
              type="number"
              name="harga"
              value={form.harga}
              onChange={handleChange}
              placeholder="Contoh: 50000"
              min="0"
              className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Stok
            </label>
            <input
              type="number"
              name="stok"
              value={form.stok}
              onChange={handleChange}
              placeholder="Contoh: 10"
              min="0"
              className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Stok Tersedia
            </label>
            <input
              type="number"
              name="stok_tersedia"
              value={form.stok_tersedia}
              onChange={handleChange}
              placeholder="Contoh: 8"
              min="0"
              className="w-full rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Gambar
            </label>
            <input
              type="file"
              name="gambar"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full rounded-xl border border-green-200 px-4 py-3 bg-white"
            />

            {editingId && previewUrl && (
              <label className="inline-flex items-center gap-2 text-sm text-red-600 mt-2">
                <input
                  type="checkbox"
                  checked={hapusGambarSaatEdit}
                  onChange={(e) => setHapusGambarSaatEdit(e.target.checked)}
                />
                Hapus gambar lama saat simpan
              </label>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Preview
            </label>
            <div className="rounded-2xl border border-dashed border-green-200 min-h-[180px] flex items-center justify-center bg-gray-50 overflow-hidden">
              {previewUrl && !hapusGambarSaatEdit ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview inventaris"
                  className="max-h-[220px] w-auto object-contain"
                />
              ) : (
                <span className="text-sm text-gray-400">Belum ada gambar</span>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl disabled:opacity-70"
            >
              {saving
                ? "Menyimpan..."
                : editingId
                ? "Simpan Perubahan"
                : "Tambah Inventaris"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Cari nama, harga, stok..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-gray-500">Belum ada data inventaris.</p>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="border border-green-100 rounded-2xl p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                      {item.gambar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.gambar}
                          alt={item.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <h2 className="text-lg font-bold text-gray-800">
                        {item.nama || "-"}
                      </h2>

                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Harga: {formatCurrency(item.harga)}</p>
                        <p>Stok: {item.stok ?? 0}</p>
                        <p>Stok Tersedia: {item.stok_tersedia ?? 0}</p>
                        <p>
                          Tanggal:
                          {" "}
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString("id-ID")
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-56">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}