"use client";

import { useEffect, useMemo, useState } from "react";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  async function fetchComments() {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch("/api/comments", {
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
      setComments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("[AdminComments] fetch error:", error);
      setComments([]);
      setErrorMsg(error.message || "Gagal mengambil data komentar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function handleApprove(id) {
    await bulkApprove([id]);
  }

  async function handleReject(id) {
    await bulkReject([id]);
  }

  async function handleDelete(id) {
    const ok = confirm("Yakin ingin menghapus komentar ini secara permanen?");
    if (!ok) return;
    await bulkDelete([id]);
  }

  async function bulkApprove(ids) {
    if (ids.length === 0) return;
    try {
      setBulkBusy(true);
      const res = await fetch("/api/comments/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      setSelected(new Set());
      await fetchComments();
    } catch (error) {
      console.error("[AdminComments] approve error:", error);
      alert(error.message || "Gagal approve komentar");
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkReject(ids) {
    if (ids.length === 0) return;
    try {
      setBulkBusy(true);
      const res = await fetch("/api/comments/reject", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      setSelected(new Set());
      await fetchComments();
    } catch (error) {
      console.error("[AdminComments] reject error:", error);
      alert(error.message || "Gagal reject komentar");
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete(ids) {
    if (ids.length === 0) return;
    try {
      setBulkBusy(true);
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/comments/${id}`, {
            method: "DELETE",
            headers: { Accept: "application/json" },
          }).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
          })
        )
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) alert(`${failed} komentar gagal dihapus.`);
      setSelected(new Set());
      await fetchComments();
    } finally {
      setBulkBusy(false);
    }
  }

  function toggleSelected(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === filteredComments.length
        ? new Set()
        : new Set(filteredComments.map((c) => c.id))
    );
  }

  const safeComments = Array.isArray(comments) ? comments : [];

  const filteredComments = useMemo(() => {
    return safeComments.filter((item) => {
      const matchStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      const text = `
        ${item.name || ""}
        ${item.email || ""}
        ${item.comment || ""}
        ${item.content_type || ""}
        ${item.content_id || ""}
      `
        .toLowerCase()
        .trim();

      const matchKeyword = text.includes(keyword.toLowerCase());

      return matchStatus && matchKeyword;
    });
  }, [safeComments, statusFilter, keyword]);

  const totalPending = safeComments.filter(
    (item) => item.status === "pending"
  ).length;
  const totalApproved = safeComments.filter(
    (item) => item.status === "approved"
  ).length;
  const totalRejected = safeComments.filter(
    (item) => item.status === "rejected"
  ).length;

  function getStatusBadge(status) {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }
    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }
    return "bg-yellow-100 text-yellow-700";
  }

  const selectedIds = Array.from(selected);
  const allSelected =
    filteredComments.length > 0 && selected.size === filteredComments.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm mb-3">
              Manajemen Komentar
            </p>
            <h1 className="text-3xl font-bold text-green-700">Comments</h1>
            <p className="text-gray-600 mt-2">
              Kelola komentar masuk, approve, reject, atau hapus.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md border border-green-100 p-5">
          <h3 className="text-sm text-gray-500">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {totalPending}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-green-100 p-5">
          <h3 className="text-sm text-gray-500">Approved</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {totalApproved}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-green-100 p-5">
          <h3 className="text-sm text-gray-500">Rejected</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {totalRejected}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Cari nama, email, isi komentar, tipe konten, atau ID konten..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-green-200 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <span className="text-sm font-medium text-green-800">
            {selected.size} komentar dipilih
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              disabled={bulkBusy}
              onClick={() => bulkApprove(selectedIds)}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
            >
              Approve terpilih
            </button>
            <button
              disabled={bulkBusy}
              onClick={() => bulkReject(selectedIds)}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
            >
              Reject terpilih
            </button>
            <button
              disabled={bulkBusy}
              onClick={() => {
                if (
                  confirm(
                    `Hapus permanen ${selectedIds.length} komentar terpilih? Tindakan ini tidak bisa dibatalkan.`
                  )
                ) {
                  bulkDelete(selectedIds);
                }
              }}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
            >
              Hapus permanen
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md border border-green-100 overflow-x-auto">
        {loading ? (
          <p className="text-gray-500 p-6">Loading...</p>
        ) : errorMsg ? (
          <p className="text-red-500 p-6">{errorMsg}</p>
        ) : filteredComments.length === 0 ? (
          <p className="text-gray-500 p-6">Belum ada komentar.</p>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-green-100 bg-green-50/60 text-left text-gray-600">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 accent-green-700"
                    aria-label="Pilih semua"
                  />
                </th>
                <th className="px-3 py-3 font-semibold">Pengirim</th>
                <th className="px-3 py-3 font-semibold">Komentar</th>
                <th className="px-3 py-3 font-semibold">Konten</th>
                <th className="px-3 py-3 font-semibold">Tanggal</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 align-top ${
                    selected.has(item.id) ? "bg-green-50/40" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      className="h-4 w-4 rounded border-gray-300 accent-green-700"
                      aria-label={`Pilih komentar dari ${item.name || "-"}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-gray-800">
                      {item.name || "-"}
                    </p>
                    <p className="text-xs text-gray-500">{item.email || "-"}</p>
                  </td>
                  <td className="px-3 py-3 max-w-xs">
                    <p className="text-gray-700 whitespace-pre-line break-words">
                      {item.comment || "-"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">
                    <p>{item.content_type || "-"}</p>
                    <p>#{item.content_id || "-"}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString("id-ID")
                      : "-"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status || "pending"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {item.status !== "approved" && (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs"
                        >
                          Approve
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button
                          onClick={() => handleReject(item.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
