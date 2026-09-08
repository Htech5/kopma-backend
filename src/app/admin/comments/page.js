"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { PageHeader, EmptyState, LoadingBlock, useAdminFeedback } from "../_components/AdminUI";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const { notify, askConfirm, closeConfirm, feedbackUI } = useAdminFeedback();

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
      notify(data.message || `${ids.length} komentar di-approve`);
      setSelected(new Set());
      await fetchComments();
    } catch (error) {
      console.error("[AdminComments] approve error:", error);
      notify(error.message || "Gagal approve komentar", "error");
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
      notify(data.message || `${ids.length} komentar di-reject`);
      setSelected(new Set());
      await fetchComments();
    } catch (error) {
      console.error("[AdminComments] reject error:", error);
      notify(error.message || "Gagal reject komentar", "error");
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete(ids) {
    if (ids.length === 0) return;
    try {
      setBulkBusy(true);
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      notify(data.message || `${ids.length} komentar dihapus`);
      setSelected(new Set());
      await fetchComments();
    } catch (error) {
      console.error("[AdminComments] bulk delete error:", error);
      notify(error.message || "Gagal menghapus komentar", "error");
    } finally {
      setBulkBusy(false);
    }
  }

  function confirmDelete(ids) {
    askConfirm({
      title: "Hapus permanen",
      message:
        ids.length > 1
          ? `Hapus ${ids.length} komentar terpilih secara permanen? Tindakan ini tidak bisa dibatalkan.`
          : "Hapus komentar ini secara permanen? Tindakan ini tidak bisa dibatalkan.",
      danger: true,
      onConfirm: () => {
        closeConfirm();
        bulkDelete(ids);
      },
    });
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
      {feedbackUI}

      <PageHeader
        eyebrow="Manajemen Komentar"
        title="Comments"
        description="Kelola komentar masuk, approve, reject, atau hapus."
      />

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

      <div className="bg-white rounded-2xl shadow-md border border-green-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-green-100 px-6 py-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              disabled={filteredComments.length === 0}
              className="h-4 w-4 rounded border-gray-300 accent-green-700"
            />
            Pilih semua
          </label>

          {selected.size > 0 && (
            <>
              <span className="text-sm font-medium text-green-800">
                {selected.size} dipilih
              </span>
              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  disabled={bulkBusy}
                  onClick={() => bulkApprove(selectedIds)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve
                </button>
                <button
                  disabled={bulkBusy}
                  onClick={() => bulkReject(selectedIds)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
                <button
                  disabled={bulkBusy}
                  onClick={() => confirmDelete(selectedIds)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus permanen
                </button>
              </div>
            </>
          )}
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingBlock rows={4} />
          </div>
        ) : errorMsg ? (
          <p className="text-red-500 p-6">{errorMsg}</p>
        ) : filteredComments.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={keyword || statusFilter !== "all" ? "Data tidak ditemukan" : "Belum ada komentar"}
              description={
                keyword || statusFilter !== "all"
                  ? "Coba ubah kata kunci atau filter status."
                  : "Komentar dari pengunjung akan muncul di sini."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-10" />
                <col className="w-44" />
                <col />
                <col className="w-36" />
                <col className="w-32" />
                <col className="w-24" />
                <col className="w-40" />
              </colgroup>
              <thead>
                <tr className="border-b border-green-100 bg-green-50/60 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3" />
                  <th className="px-3 py-3 font-semibold">Pengirim</th>
                  <th className="px-3 py-3 font-semibold">Komentar</th>
                  <th className="px-3 py-3 font-semibold">Konten</th>
                  <th className="px-3 py-3 font-semibold">Tanggal</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredComments.map((item) => (
                  <tr
                    key={item.id}
                    className={selected.has(item.id) ? "bg-green-50/40" : ""}
                  >
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleSelected(item.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-green-700"
                        aria-label={`Pilih komentar dari ${item.name || "-"}`}
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="truncate font-semibold text-gray-800">
                        {item.name || "-"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {item.email || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="line-clamp-3 whitespace-pre-line text-gray-700">
                        {item.comment || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-gray-500">
                      <p className="truncate">{item.content_type || "-"}</p>
                      <p className="truncate">#{item.content_id || "-"}</p>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-gray-500">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status || "pending"}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex justify-end gap-1.5">
                        {item.status !== "approved" && (
                          <button
                            onClick={() => bulkApprove([item.id])}
                            title="Approve"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {item.status !== "rejected" && (
                          <button
                            onClick={() => bulkReject([item.id])}
                            title="Reject"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete([item.id])}
                          title="Hapus permanen"
                          className="grid h-8 w-8 place-items-center rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
