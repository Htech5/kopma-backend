"use client";

import { useEffect, useMemo, useState } from "react";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    try {
      const res = await fetch("/api/comments/approve", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      }

      alert(data.message || "Komentar berhasil di-approve");
      fetchComments();
    } catch (error) {
      console.error("[AdminComments] approve error:", error);
      alert(error.message || "Gagal approve komentar");
    }
  }

  async function handleReject(id) {
    try {
      const res = await fetch("/api/comments/reject", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      }

      alert(data.message || "Komentar berhasil di-reject");
      fetchComments();
    } catch (error) {
      console.error("[AdminComments] reject error:", error);
      alert(error.message || "Gagal reject komentar");
    }
  }

  async function handleDelete(id) {
    const ok = confirm("Yakin ingin menghapus komentar ini?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.detail || `HTTP ${res.status}`);
      }

      alert(data.message || "Komentar berhasil dihapus");
      fetchComments();
    } catch (error) {
      console.error("[AdminComments] delete error:", error);
      alert(error.message || "Gagal menghapus komentar");
    }
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

      <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : errorMsg ? (
          <p className="text-red-500">{errorMsg}</p>
        ) : filteredComments.length === 0 ? (
          <p className="text-gray-500">Belum ada komentar.</p>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((item) => (
              <div
                key={item.id}
                className="border border-green-100 rounded-2xl p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-800">
                        {item.name || "-"}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status || "pending"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Email: {item.email || "-"}</p>
                      <p>Tipe Konten: {item.content_type || "-"}</p>
                      <p>ID Konten: {item.content_id || "-"}</p>
                      <p>
                        Tanggal:{" "}
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("id-ID")
                          : "-"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-gray-700 whitespace-pre-line">
                        {item.comment || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-56">
                    {item.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        Approve
                      </button>
                    )}

                    {item.status !== "rejected" && (
                      <button
                        onClick={() => handleReject(item.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                      >
                        Reject
                      </button>
                    )}

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